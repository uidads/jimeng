#!/bin/bash

# 🔄 jimeng-free-api 项目更新脚本
# 用于更新现有的Docker部署

set -e

echo "🔄 jimeng-free-api 项目更新脚本"
echo "================================="

# 配置参数
IMAGE_NAME="jimeng-free-api"
CONTAINER_NAME="jimeng-free-api"
IMAGE_TAG=${1:-latest}
FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"

# 检查是否在项目目录中
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ 请在项目根目录中运行此脚本"
    exit 1
fi

echo "📊 当前状态检查..."

# 检查容器是否运行
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    echo "✅ 发现运行中的容器: $CONTAINER_NAME"
    CONTAINER_RUNNING=true
else
    echo "⚠️  容器未运行或不存在"
    CONTAINER_RUNNING=false
fi

# 备份当前镜像（如果存在）
if docker images -q "$FULL_IMAGE_NAME" | grep -q .; then
    echo "💾 备份当前镜像..."
    docker tag "$FULL_IMAGE_NAME" "$IMAGE_NAME:$BACKUP_TAG"
    echo "  备份镜像: $IMAGE_NAME:$BACKUP_TAG"
fi

# 更新代码（如果是Git仓库）
if [ -d ".git" ]; then
    echo "📦 更新代码..."
    git fetch --all
    git pull origin main || git pull origin master
    echo "✅ 代码更新完成"
else
    echo "⚠️  非Git仓库，请手动确保代码已更新"
fi

# 停止现有容器
if [ "$CONTAINER_RUNNING" = true ]; then
    echo "🛑 停止现有容器..."
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
    echo "✅ 容器已停止并删除"
fi

# 构建新镜像
echo "🔨 构建新Docker镜像..."
docker build -t "$FULL_IMAGE_NAME" .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    
    # 如果有备份镜像，提供恢复选项
    if docker images -q "$IMAGE_NAME:$BACKUP_TAG" | grep -q .; then
        echo "🔄 是否恢复到备份版本? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            docker tag "$IMAGE_NAME:$BACKUP_TAG" "$FULL_IMAGE_NAME"
            echo "✅ 已恢复到备份版本"
        fi
    fi
    exit 1
fi

echo "✅ 新镜像构建成功"

# 创建必要的目录
echo "📁 检查必要目录..."
mkdir -p logs
mkdir -p configs/prod

# 启动新容器
echo "🚢 启动新容器..."
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p 5566:5566 \
    -v "$(pwd)/logs:/app/logs" \
    -v "$(pwd)/configs:/app/configs:ro" \
    -e NODE_ENV=production \
    -e TZ=Asia/Shanghai \
    "$FULL_IMAGE_NAME"

if [ $? -eq 0 ]; then
    echo "✅ 容器启动成功！"
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 15
    
    # 检查服务健康状态
    echo "🔍 检查服务健康状态..."
    for i in {1..6}; do
        if curl -f http://localhost:5566/ping >/dev/null 2>&1; then
            echo "✅ 服务健康检查通过！"
            break
        else
            if [ $i -eq 6 ]; then
                echo "❌ 服务健康检查失败"
                echo "📋 容器日志:"
                docker logs --tail 20 "$CONTAINER_NAME"
                exit 1
            else
                echo "⏳ 等待服务启动... ($i/6)"
                sleep 10
            fi
        fi
    done
    
    # 清理旧镜像（保留备份）
    echo "🧹 清理旧镜像..."
    docker images | grep "$IMAGE_NAME" | grep -v "$BACKUP_TAG" | grep -v "$IMAGE_TAG" | awk '{print $3}' | xargs -r docker rmi || true
    
    echo ""
    echo "🎉 更新部署完成！"
    echo ""
    echo "📊 服务信息:"
    echo "  容器名称: $CONTAINER_NAME"
    echo "  镜像版本: $FULL_IMAGE_NAME"
    echo "  备份镜像: $IMAGE_NAME:$BACKUP_TAG"
    echo "  访问地址: http://localhost:5566"
    echo "  健康检查: http://localhost:5566/ping"
    echo ""
    echo "🔧 管理命令:"
    echo "  查看日志: docker logs -f $CONTAINER_NAME"
    echo "  查看状态: docker ps | grep $CONTAINER_NAME"
    echo "  重启服务: docker restart $CONTAINER_NAME"
    echo "  回滚版本: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME && docker tag $IMAGE_NAME:$BACKUP_TAG $FULL_IMAGE_NAME && ./deploy.sh"
    echo ""
else
    echo "❌ 容器启动失败"
    echo "📋 查看错误日志:"
    docker logs "$CONTAINER_NAME" || true
    exit 1
fi 