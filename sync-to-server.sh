#!/bin/bash

# 🌐 jimeng-free-api 远程服务器同步脚本
# 将本地更新同步到远程服务器

set -e

# 配置参数 - 请根据你的服务器信息修改
SERVER_HOST="${1:-your-server-ip}"
SERVER_USER="${2:-root}"
SERVER_PORT="${3:-22}"
PROJECT_PATH="${4:-/opt/jimeng}"
SSH_KEY="${5:-~/.ssh/id_rsa}"

echo "🌐 jimeng-free-api 远程服务器同步脚本"
echo "========================================"

# 检查参数
if [ "$SERVER_HOST" = "your-server-ip" ]; then
    echo "❌ 请提供服务器信息！"
    echo ""
    echo "使用方法:"
    echo "  $0 <服务器IP> [用户名] [SSH端口] [项目路径] [SSH密钥路径]"
    echo ""
    echo "示例:"
    echo "  $0 192.168.1.100 ubuntu 22 /home/ubuntu/jimeng ~/.ssh/id_rsa"
    echo "  $0 your-domain.com root 22 /opt/jimeng"
    echo ""
    exit 1
fi

echo "📋 同步配置:"
echo "  服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo "  项目路径: $PROJECT_PATH"
echo "  SSH密钥: $SSH_KEY"
echo ""

# 检查SSH连接
echo "🔍 检查SSH连接..."
if ! ssh -i "$SSH_KEY" -p "$SERVER_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "echo 'SSH连接成功'" 2>/dev/null; then
    echo "❌ SSH连接失败，请检查："
    echo "  1. 服务器地址和端口是否正确"
    echo "  2. SSH密钥是否正确配置"
    echo "  3. 服务器是否允许SSH连接"
    exit 1
fi

echo "✅ SSH连接正常"

# 检查服务器上的项目目录
echo "🔍 检查服务器项目目录..."
ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "
    if [ ! -d '$PROJECT_PATH' ]; then
        echo '创建项目目录: $PROJECT_PATH'
        mkdir -p '$PROJECT_PATH'
    fi
    
    if [ ! -f '$PROJECT_PATH/package.json' ]; then
        echo '⚠️  服务器上未找到项目文件，将进行完整同步'
        FULL_SYNC=true
    else
        echo '✅ 发现现有项目文件'
        FULL_SYNC=false
    fi
    
    echo \$FULL_SYNC
" > /tmp/sync_check.tmp

FULL_SYNC=$(cat /tmp/sync_check.tmp | tail -n 1)
rm -f /tmp/sync_check.tmp

# 准备本地文件
echo "📦 准备同步文件..."

# 创建临时同步目录
SYNC_DIR="/tmp/jimeng-sync-$(date +%s)"
mkdir -p "$SYNC_DIR"

# 复制需要同步的文件
echo "  复制项目文件..."
cp -r . "$SYNC_DIR/" 2>/dev/null || true

# 清理不需要同步的文件
echo "  清理临时文件..."
cd "$SYNC_DIR"
rm -rf node_modules dream/node_modules .git logs docker/ssl 2>/dev/null || true
rm -f *.log .env.local .DS_Store 2>/dev/null || true

# 同步到服务器
echo "🚀 同步文件到服务器..."
rsync -avz --delete \
    -e "ssh -i $SSH_KEY -p $SERVER_PORT -o StrictHostKeyChecking=no" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.DS_Store' \
    "$SYNC_DIR/" \
    "$SERVER_USER@$SERVER_HOST:$PROJECT_PATH/"

if [ $? -ne 0 ]; then
    echo "❌ 文件同步失败"
    rm -rf "$SYNC_DIR"
    exit 1
fi

echo "✅ 文件同步完成"

# 清理本地临时目录
rm -rf "$SYNC_DIR"

# 在服务器上执行更新
echo "🔄 在服务器上执行更新..."
ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "
    cd '$PROJECT_PATH'
    
    # 检查Docker环境
    if ! command -v docker &> /dev/null; then
        echo '❌ 服务器上未安装Docker'
        exit 1
    fi
    
    # 设置脚本权限
    chmod +x *.sh
    
    # 根据同步类型选择部署方式
    if [ '$FULL_SYNC' = 'true' ]; then
        echo '🚀 执行首次部署...'
        ./deploy.sh
    else
        # 检查是否有更新脚本
        if [ -f 'update-deploy.sh' ]; then
            echo '🔄 执行增量更新...'
            ./update-deploy.sh
        elif [ -f 'blue-green-deploy.sh' ]; then
            echo '🔵🟢 执行蓝绿部署...'
            ./blue-green-deploy.sh
        else
            echo '🚀 执行标准部署...'
            ./deploy.sh
        fi
    fi
"

DEPLOY_RESULT=$?

if [ $DEPLOY_RESULT -eq 0 ]; then
    echo ""
    echo "🎉 远程同步和部署完成！"
    echo ""
    echo "📊 部署信息:"
    echo "  服务器: $SERVER_USER@$SERVER_HOST"
    echo "  项目路径: $PROJECT_PATH"
    echo "  访问地址: http://$SERVER_HOST:5566"
    echo ""
    
    # 获取服务器状态
    echo "📋 服务器状态:"
    ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "
        cd '$PROJECT_PATH'
        echo '  容器状态:'
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep jimeng || echo '    无运行中的容器'
        echo ''
        echo '  镜像信息:'
        docker images | grep jimeng | head -3 || echo '    无相关镜像'
    "
    
    echo ""
    echo "🔧 远程管理命令:"
    echo "  连接服务器: ssh -i $SSH_KEY -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"
    echo "  查看日志: ssh $SERVER_USER@$SERVER_HOST 'cd $PROJECT_PATH && docker logs -f jimeng-free-api'"
    echo "  重启服务: ssh $SERVER_USER@$SERVER_HOST 'cd $PROJECT_PATH && docker restart jimeng-free-api'"
    echo ""
else
    echo "❌ 远程部署失败，请检查服务器日志"
    
    # 显示服务器错误日志
    echo "📋 服务器错误信息:"
    ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "
        cd '$PROJECT_PATH'
        echo '最近的容器日志:'
        docker logs --tail 10 jimeng-free-api 2>/dev/null || echo '无可用日志'
    "
    exit 1
fi 