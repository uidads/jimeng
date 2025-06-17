# 🚀 jimeng-free-api 部署指南

## 📋 部署方式概览

本项目提供多种部署方式，适用于不同的使用场景：

| 部署方式 | 适用场景 | 难度 | 推荐度 |
|---------|---------|------|--------|
| [一键部署](#一键部署) | 快速体验 | ⭐ | ⭐⭐⭐⭐⭐ |
| [Docker Compose](#docker-compose-部署) | 本地开发 | ⭐⭐ | ⭐⭐⭐⭐ |
| [Docker 直接运行](#docker-直接运行) | 简单部署 | ⭐⭐ | ⭐⭐⭐ |
| [从源码构建](#从源码构建) | 定制开发 | ⭐⭐⭐ | ⭐⭐ |
| [云端部署](#云端部署) | 生产环境 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🚀 一键部署

### Linux/macOS 用户

```bash
# 方法1：在线脚本
curl -fsSL https://raw.githubusercontent.com/uidads/jimeng/main/quick-deploy.sh | bash

# 方法2：下载后运行
wget https://raw.githubusercontent.com/uidads/jimeng/main/quick-deploy.sh
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Windows 用户

```powershell
# PowerShell 中执行
curl -fsSL https://raw.githubusercontent.com/uidads/jimeng/main/quick-deploy.bat -o quick-deploy.bat
quick-deploy.bat
```

## 🐳 Docker Compose 部署

### 基础部署

```bash
# 克隆项目
git clone https://github.com/uidads/jimeng.git
cd jimeng

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 包含 Nginx 的完整部署

```bash
# 启动完整服务（包括 Nginx 反向代理）
docker-compose --profile nginx up -d

# 这将启动：
# - jimeng-free-api 服务（端口 5566）
# - Nginx 反向代理（端口 80/443）
```

## 🔧 Docker 直接运行

### 使用预构建镜像

```bash
# 从 GitHub Container Registry 拉取
docker run -d \
  --name jimeng-free-api \
  -p 5566:5566 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/configs:/app/configs:ro \
  ghcr.io/uidads/jimeng:latest

# 或从 Docker Hub 拉取
docker run -d \
  --name jimeng-free-api \
  -p 5566:5566 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/configs:/app/configs:ro \
  uidads/jimeng-free-api:latest
```

### 本地构建镜像

```bash
# 克隆项目
git clone https://github.com/uidads/jimeng.git
cd jimeng

# 构建镜像
docker build -t jimeng-free-api:local .

# 运行容器
docker run -d \
  --name jimeng-free-api \
  -p 5566:5566 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/configs:/app/configs:ro \
  jimeng-free-api:local
```

## 💻 从源码构建

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 构建步骤

```bash
# 1. 克隆项目
git clone https://github.com/uidads/jimeng.git
cd jimeng

# 2. 安装依赖
npm install

# 3. 构建前端资源
cd dream
npm install
npm run build
cd ..

# 4. 构建后端
npm run build

# 5. 启动服务
npm start
```

### 开发模式

```bash
# 开发模式运行（支持热重载）
npm run dev
```

## ☁️ 云端部署

### 1. VPS/云服务器部署

```bash
# 1. 连接到服务器
ssh user@your-server-ip

# 2. 安装 Docker（如果未安装）
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# 3. 一键部署
curl -fsSL https://raw.githubusercontent.com/uidads/jimeng/main/quick-deploy.sh | bash
```

### 2. 使用 Docker Swarm

```bash
# 初始化 Swarm
docker swarm init

# 部署服务
docker stack deploy -c docker-compose.yml jimeng-stack

# 查看服务状态
docker service ls
docker service logs jimeng-stack_jimeng-api
```

### 3. 使用 Kubernetes

```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jimeng-free-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: jimeng-free-api
  template:
    metadata:
      labels:
        app: jimeng-free-api
    spec:
      containers:
      - name: jimeng-free-api
        image: uidads/jimeng-free-api:latest
        ports:
        - containerPort: 5566
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: jimeng-free-api-service
spec:
  selector:
    app: jimeng-free-api
  ports:
  - port: 80
    targetPort: 5566
  type: LoadBalancer
```

```bash
# 部署到 Kubernetes
kubectl apply -f k8s-deployment.yml

# 查看状态
kubectl get pods
kubectl get services
```

## 🔒 生产环境配置

### 环境变量配置

创建 `docker/production.env` 文件：

```env
# 基础配置
NODE_ENV=production
HOST=0.0.0.0
PORT=5566
TZ=Asia/Shanghai

# 日志配置
LOG_LEVEL=info
LOG_MAX_SIZE=100MB
LOG_MAX_FILES=7

# 安全配置
CORS_ORIGIN=https://yourdomain.com
API_RATE_LIMIT=100

# 可选：数据库配置
# DATABASE_URL=mongodb://localhost:27017/jimeng
# REDIS_URL=redis://localhost:6379
```

### Nginx 反向代理配置

创建 `docker/nginx.conf` 文件：

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server jimeng-api:5566;
    }

    server {
        listen 80;
        server_name yourdomain.com;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### SSL/HTTPS 配置

```bash
# 使用 Certbot 获取 SSL 证书
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# 或者手动配置证书文件
mkdir -p docker/ssl
# 将证书文件放入 docker/ssl/ 目录
```

## 📊 监控和维护

### 健康检查

```bash
# 检查服务状态
curl http://localhost:5566/ping

# 检查容器状态
docker ps
docker stats jimeng-free-api

# 查看详细日志
docker logs -f jimeng-free-api
```

### 日志管理

```bash
# 查看实时日志
tail -f logs/app.log

# 清理旧日志
find logs/ -name "*.log" -mtime +7 -delete

# 日志轮转（推荐使用 logrotate）
sudo vim /etc/logrotate.d/jimeng-api
```

### 备份和恢复

```bash
# 备份配置文件
tar -czf backup-$(date +%Y%m%d).tar.gz configs/ logs/

# 备份容器
docker commit jimeng-free-api jimeng-backup:$(date +%Y%m%d)

# 恢复配置
tar -xzf backup-20240101.tar.gz
```

## 🔄 更新和升级

### 自动更新

```bash
# 创建更新脚本
cat > update.sh << 'EOF'
#!/bin/bash
cd /path/to/jimeng
git pull origin main
docker-compose down
docker-compose up -d --build
EOF

chmod +x update.sh

# 设置定时任务（每天凌晨2点检查更新）
echo "0 2 * * * /path/to/update.sh" | crontab -
```

### 手动更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建并部署
docker-compose down
docker-compose up -d --build

# 或使用部署脚本
./deploy.sh
```

## ❓ 常见问题

### Q: 端口冲突怎么办？

A: 修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:5566"  # 将主机端口改为 8080
```

### Q: 如何修改配置？

A: 编辑 `configs/prod/service.yml` 文件，然后重启服务：

```bash
docker-compose restart
```

### Q: 服务启动失败？

A: 检查日志和常见问题：

```bash
# 查看详细错误信息
docker logs jimeng-free-api

# 检查端口占用
netstat -tlnp | grep 5566

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

### Q: 如何扩展服务？

A: 使用 Docker Compose 扩展：

```bash
# 运行多个实例
docker-compose up -d --scale jimeng-api=3

# 配合负载均衡器使用
```

## 📞 获取帮助

- 📖 [详细文档](./README-Docker.md)
- 🐛 [提交问题](https://github.com/uidads/jimeng/issues)
- 💬 [讨论区](https://github.com/uidads/jimeng/discussions)
- 📧 邮件支持：support@yourdomain.com

---

🎉 选择适合你的部署方式，开始使用 jimeng-free-api！ 