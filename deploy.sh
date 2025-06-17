#!/bin/bash

# 部署脚本 - deploy.sh
# 用于一键部署到云端服务器

set -e

echo "🚀 jimeng-free-api 云端部署脚本"
echo "================================="

# 配置参数
IMAGE_NAME="jimeng-free-api"
CONTAINER_NAME="jimeng-free-api"
IMAGE_TAG=${1:-latest}
FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"

# 检查Docker环境
echo "🔍 检查Docker环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装Docker"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker 未运行，请启动Docker"
    exit 1
fi

# 停止并删除现有容器（如果存在）
echo "🔄 清理现有容器..."
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    echo "  停止容器: $CONTAINER_NAME"
    docker stop "$CONTAINER_NAME"
fi

if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
    echo "  删除容器: $CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
fi

# 构建镜像
echo "🔨 构建Docker镜像..."
docker build -t "$FULL_IMAGE_NAME" .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs
mkdir -p configs/prod

# 启动容器
echo "🚢 启动容器..."
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
    echo "✅ 部署成功！"
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker ps | grep -q "$CONTAINER_NAME"; then
        echo "🎉 服务运行正常！"
        echo ""
        echo "📊 服务信息:"
        echo "  容器名称: $CONTAINER_NAME"
        echo "  镜像: $FULL_IMAGE_NAME"
        echo "  端口: 5566"
        echo "  访问地址: http://localhost:5566"
        echo ""
        echo "🔧 管理命令:"
        echo "  查看日志: docker logs -f $CONTAINER_NAME"
        echo "  停止服务: docker stop $CONTAINER_NAME"
        echo "  重启服务: docker restart $CONTAINER_NAME"
        echo "  进入容器: docker exec -it $CONTAINER_NAME /bin/sh"
        echo ""
    else
        echo "❌ 服务启动失败，请查看日志"
        docker logs "$CONTAINER_NAME"
        exit 1
    fi
else
    echo "❌ 容器启动失败"
    exit 1
fi 