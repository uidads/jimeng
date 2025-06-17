#!/bin/bash

# 🚀 jimeng-free-api 快速部署脚本
# 适用于全新环境的一键部署

set -e

echo "🚀 jimeng-free-api 快速部署脚本"
echo "================================="
echo "📦 项目地址: https://github.com/uidads/jimeng.git"
echo ""

# 配置参数
REPO_URL="https://github.com/uidads/jimeng.git"
PROJECT_DIR="jimeng"
BRANCH=${1:-main}

# 检查系统环境
echo "🔍 检查系统环境..."

# 检查Git
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装Git"
    echo "   Ubuntu/Debian: sudo apt-get install git"
    echo "   CentOS/RHEL: sudo yum install git"
    echo "   macOS: brew install git"
    exit 1
fi

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，正在尝试自动安装..."
    curl -fsSL https://get.docker.com | sh
    if [ $? -ne 0 ]; then
        echo "❌ Docker 自动安装失败，请手动安装Docker"
        exit 1
    fi
    echo "✅ Docker 安装成功"
fi

# 检查Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose 未安装，正在尝试自动安装..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    if [ $? -ne 0 ]; then
        echo "❌ Docker Compose 安装失败，但可以继续使用纯Docker部署"
    else
        echo "✅ Docker Compose 安装成功"
    fi
fi

# 启动Docker服务
if ! docker info >/dev/null 2>&1; then
    echo "🔄 启动Docker服务..."
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# 克隆项目
echo "📦 克隆项目..."
if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  目录 $PROJECT_DIR 已存在，正在更新..."
    cd "$PROJECT_DIR"
    git pull origin "$BRANCH"
else
    git clone -b "$BRANCH" "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

echo "✅ 项目克隆/更新完成"

# 检查部署脚本
if [ ! -f "deploy.sh" ]; then
    echo "❌ 未找到 deploy.sh 文件"
    exit 1
fi

# 设置权限并执行部署
echo "🚀 开始部署..."
chmod +x deploy.sh

# 执行部署
./deploy.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📋 部署信息:"
    echo "  项目目录: $(pwd)"
    echo "  项目地址: $REPO_URL"
    echo "  访问地址: http://localhost:5566"
    echo "  健康检查: http://localhost:5566/ping"
    echo ""
    echo "🔧 常用命令:"
    echo "  查看状态: docker ps"
    echo "  查看日志: docker logs -f jimeng-free-api"
    echo "  停止服务: docker stop jimeng-free-api"
    echo "  重启服务: docker restart jimeng-free-api"
    echo "  重新部署: ./deploy.sh"
    echo ""
    echo "📖 更多信息请查看: README-Docker.md"
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi 