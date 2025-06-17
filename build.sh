#!/bin/bash

# 构建脚本 - build.sh
# 用于构建Docker镜像

set -e

echo "🚀 开始构建 jimeng-free-api Docker镜像..."

# 设置镜像名称和标签
IMAGE_NAME="jimeng-free-api"
IMAGE_TAG=${1:-latest}
FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"

echo "📦 镜像名称: $FULL_IMAGE_NAME"

# 检查Docker是否运行
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker 未运行，请启动 Docker 后再试"
    exit 1
fi

# 构建镜像
echo "🔨 构建镜像中..."
docker build -t "$FULL_IMAGE_NAME" .

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 镜像构建成功！"
    echo "📊 镜像信息:"
    docker images | grep "$IMAGE_NAME"
    
    echo ""
    echo "🎯 使用方法:"
    echo "  直接运行: docker run -p 5566:5566 $FULL_IMAGE_NAME"
    echo "  Compose:  docker-compose up -d"
    echo ""
else
    echo "❌ 镜像构建失败"
    exit 1
fi 