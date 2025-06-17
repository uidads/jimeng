#!/bin/bash

# 🔵🟢 jimeng-free-api 蓝绿部署脚本
# 实现零停机更新

set -e

echo "🔵🟢 jimeng-free-api 蓝绿部署脚本"
echo "===================================="

# 配置参数
IMAGE_NAME="jimeng-free-api"
CURRENT_PORT=${1:-5566}
NEW_PORT=$((CURRENT_PORT + 1))
HEALTH_CHECK_URL="http://localhost"

# 检测当前运行的容器
CURRENT_CONTAINER=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "$CURRENT_PORT" | awk '{print $1}' || echo "")

if [ -z "$CURRENT_CONTAINER" ]; then
    echo "⚠️  未发现运行在端口 $CURRENT_PORT 的容器，将执行首次部署"
    NEW_CONTAINER_NAME="jimeng-blue"
    CURRENT_COLOR="无"
    NEW_COLOR="蓝色"
else
    # 判断当前颜色
    if [[ "$CURRENT_CONTAINER" == *"blue"* ]]; then
        CURRENT_COLOR="蓝色"
        NEW_COLOR="绿色"
        NEW_CONTAINER_NAME="jimeng-green"
    else
        CURRENT_COLOR="绿色"
        NEW_COLOR="蓝色"
        NEW_CONTAINER_NAME="jimeng-blue"
    fi
fi

echo "📊 当前状态:"
echo "  当前容器: ${CURRENT_CONTAINER:-无}"
echo "  当前颜色: $CURRENT_COLOR"
echo "  目标颜色: $NEW_COLOR"
echo "  当前端口: $CURRENT_PORT"
echo "  新容器端口: $NEW_PORT"

# 更新代码
if [ -d ".git" ]; then
    echo "📦 更新代码..."
    git pull origin main
    echo "✅ 代码更新完成"
fi

# 构建新镜像
NEW_IMAGE_TAG="$NEW_COLOR-$(date +%Y%m%d-%H%M%S)"
NEW_IMAGE_NAME="$IMAGE_NAME:$NEW_IMAGE_TAG"

echo "🔨 构建新镜像: $NEW_IMAGE_NAME"
docker build -t "$NEW_IMAGE_NAME" .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

# 启动新容器（使用新端口）
echo "🚢 启动新容器: $NEW_CONTAINER_NAME (端口: $NEW_PORT)"

# 停止可能存在的同名容器
docker stop "$NEW_CONTAINER_NAME" 2>/dev/null || true
docker rm "$NEW_CONTAINER_NAME" 2>/dev/null || true

docker run -d \
    --name "$NEW_CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$NEW_PORT:5566" \
    -v "$(pwd)/logs:/app/logs" \
    -v "$(pwd)/configs:/app/configs:ro" \
    -e NODE_ENV=production \
    -e TZ=Asia/Shanghai \
    "$NEW_IMAGE_NAME"

if [ $? -ne 0 ]; then
    echo "❌ 新容器启动失败"
    exit 1
fi

# 等待新服务启动
echo "⏳ 等待新服务启动..."
sleep 15

# 健康检查
echo "🔍 对新服务进行健康检查..."
for i in {1..12}; do
    if curl -f "$HEALTH_CHECK_URL:$NEW_PORT/ping" >/dev/null 2>&1; then
        echo "✅ 新服务健康检查通过！"
        break
    else
        if [ $i -eq 12 ]; then
            echo "❌ 新服务健康检查失败"
            echo "📋 新容器日志:"
            docker logs --tail 20 "$NEW_CONTAINER_NAME"
            echo "🔄 回滚：删除失败的容器"
            docker stop "$NEW_CONTAINER_NAME"
            docker rm "$NEW_CONTAINER_NAME"
            exit 1
        else
            echo "⏳ 健康检查中... ($i/12)"
            sleep 5
        fi
    fi
done

# 切换流量（更新端口映射）
if [ -n "$CURRENT_CONTAINER" ]; then
    echo "🔄 切换流量到新服务..."
    
    # 停止旧容器
    echo "  停止旧容器: $CURRENT_CONTAINER"
    docker stop "$CURRENT_CONTAINER"
    
    # 启动新容器到原端口
    echo "  将新容器切换到端口 $CURRENT_PORT"
    docker stop "$NEW_CONTAINER_NAME"
    docker rm "$NEW_CONTAINER_NAME"
    
    docker run -d \
        --name "$NEW_CONTAINER_NAME" \
        --restart unless-stopped \
        -p "$CURRENT_PORT:5566" \
        -v "$(pwd)/logs:/app/logs" \
        -v "$(pwd)/configs:/app/configs:ro" \
        -e NODE_ENV=production \
        -e TZ=Asia/Shanghai \
        "$NEW_IMAGE_NAME"
    
    # 等待服务稳定
    sleep 10
    
    # 最终健康检查
    if curl -f "$HEALTH_CHECK_URL:$CURRENT_PORT/ping" >/dev/null 2>&1; then
        echo "✅ 流量切换成功！"
        
        # 清理旧容器
        echo "🧹 清理旧容器: $CURRENT_CONTAINER"
        docker rm "$CURRENT_CONTAINER"
        
        # 清理旧镜像（保留最近3个版本）
        echo "🧹 清理旧镜像..."
        docker images | grep "$IMAGE_NAME" | tail -n +4 | awk '{print $3}' | xargs -r docker rmi || true
        
    else
        echo "❌ 流量切换后健康检查失败，正在回滚..."
        
        # 回滚：重启旧容器
        docker stop "$NEW_CONTAINER_NAME"
        docker start "$CURRENT_CONTAINER"
        
        # 等待旧服务恢复
        sleep 10
        
        if curl -f "$HEALTH_CHECK_URL:$CURRENT_PORT/ping" >/dev/null 2>&1; then
            echo "✅ 回滚成功，服务已恢复"
        else
            echo "❌ 回滚失败，请手动检查服务状态"
        fi
        
        exit 1
    fi
else
    # 首次部署，直接使用目标端口
    echo "🎯 首次部署，重新映射到端口 $CURRENT_PORT"
    docker stop "$NEW_CONTAINER_NAME"
    docker rm "$NEW_CONTAINER_NAME"
    
    docker run -d \
        --name "$NEW_CONTAINER_NAME" \
        --restart unless-stopped \
        -p "$CURRENT_PORT:5566" \
        -v "$(pwd)/logs:/app/logs" \
        -v "$(pwd)/configs:/app/configs:ro" \
        -e NODE_ENV=production \
        -e TZ=Asia/Shanghai \
        "$NEW_IMAGE_NAME"
fi

echo ""
echo "🎉 蓝绿部署完成！"
echo ""
echo "📊 部署信息:"
echo "  新容器: $NEW_CONTAINER_NAME"
echo "  新镜像: $NEW_IMAGE_NAME"
echo "  服务端口: $CURRENT_PORT"
echo "  访问地址: $HEALTH_CHECK_URL:$CURRENT_PORT"
echo ""
echo "🔧 管理命令:"
echo "  查看日志: docker logs -f $NEW_CONTAINER_NAME"
echo "  查看状态: docker ps | grep jimeng"
echo "  重启服务: docker restart $NEW_CONTAINER_NAME"
echo "" 