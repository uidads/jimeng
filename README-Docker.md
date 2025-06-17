# 🐳 jimeng-free-api Docker 部署指南

## 📋 目录
- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [本地开发部署](#本地开发部署)
- [生产环境部署](#生产环境部署)
- [配置说明](#配置说明)
- [常用命令](#常用命令)
- [故障排除](#故障排除)

## 🔧 系统要求

- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0
- **系统内存**: >= 2GB
- **磁盘空间**: >= 10GB

## 🚀 快速开始

### 1. 一键部署（推荐）

```bash
# 克隆项目
git clone https://github.com/uidads/jimeng.git
cd jimeng

# 一键部署
chmod +x deploy.sh
./deploy.sh

# Windows用户
build.bat && docker-compose up -d
```

### 2. 使用Docker Compose

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 3. 直接使用Docker

```bash
# 构建镜像
docker build -t jimeng-free-api:latest .

# 运行容器
docker run -d \
  --name jimeng-free-api \
  -p 5566:5566 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/configs:/app/configs:ro \
  jimeng-free-api:latest
```

## 💻 本地开发部署

### 开发环境配置

```bash
# 1. 安装依赖
npm install

# 2. 前端依赖
cd dream && npm install && cd ..

# 3. 本地构建测试
npm run build

# 4. Docker构建
./build.sh dev

# 5. 运行开发环境
docker run -p 5566:5566 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/configs:/app/configs \
  jimeng-free-api:dev
```

## 🌐 生产环境部署

### 环境准备

1. **服务器配置**
   ```bash
   # 安装Docker
   curl -fsSL https://get.docker.com | sh
   sudo systemctl enable docker
   sudo systemctl start docker
   
   # 安装Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **项目部署**
   ```bash
   # 直接克隆并部署
   git clone https://github.com/uidads/jimeng.git
   cd jimeng
   
   # 执行部署
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 使用Nginx反向代理（可选）

```bash
# 启动包含Nginx的完整服务
docker-compose --profile nginx up -d

# 或者单独配置Nginx
docker run -d \
  --name jimeng-nginx \
  -p 80:80 -p 443:443 \
  -v ./docker/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

## ⚙️ 配置说明

### 环境变量配置

在 `docker/production.env` 中配置：

```env
# 服务配置
NODE_ENV=production
HOST=0.0.0.0
PORT=5566

# 时区设置
TZ=Asia/Shanghai

# 日志级别
LOG_LEVEL=info
```

### 服务配置文件

在 `configs/prod/service.yml` 中配置：

```yaml
name: jimeng-free-api
host: 0.0.0.0
port: 5566
bindAddress: # 可选：外部访问地址
```

### Docker Compose 配置

主要配置选项：

```yaml
services:
  jimeng-api:
    build: .
    ports:
      - "5566:5566"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
      - ./configs:/app/configs:ro
    restart: unless-stopped
```

## 🔧 常用命令

### 容器管理

```bash
# 查看运行状态
docker ps
docker-compose ps

# 查看日志
docker logs -f jimeng-free-api
docker-compose logs -f

# 重启服务
docker restart jimeng-free-api
docker-compose restart

# 停止服务
docker stop jimeng-free-api
docker-compose down

# 更新服务
docker-compose pull
docker-compose up -d --force-recreate
```

### 镜像管理

```bash
# 构建镜像
./build.sh [tag]

# 查看镜像
docker images | grep jimeng

# 清理无用镜像
docker image prune -f

# 删除所有相关镜像
docker images | grep jimeng | awk '{print $3}' | xargs docker rmi
```

### 数据管理

```bash
# 备份日志
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/

# 清理日志
truncate -s 0 logs/*.log

# 查看容器资源使用
docker stats jimeng-free-api
```

## 🩺 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 查看详细日志
   docker logs jimeng-free-api
   
   # 检查端口占用
   netstat -tlnp | grep 5566
   lsof -i :5566
   ```

2. **构建失败**
   ```bash
   # 清理Docker缓存
   docker system prune -a
   
   # 重新构建
   docker build --no-cache -t jimeng-free-api:latest .
   ```

3. **前端资源404**
   ```bash
   # 检查前端构建
   docker exec -it jimeng-free-api ls -la /app/public/dream/
   
   # 重新构建前端
   cd dream && npm run build
   ```

4. **健康检查失败**
   ```bash
   # 手动测试健康检查
   curl http://localhost:5566/ping
   
   # 检查服务状态
   docker exec -it jimeng-free-api ps aux
   ```

### 性能优化

1. **内存优化**
   ```bash
   # 限制容器内存使用
   docker run --memory="1g" --memory-swap="1g" ...
   ```

2. **日志优化**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "100m"
       max-file: "3"
   ```

3. **镜像优化**
   ```dockerfile
   # 使用.dockerignore减少构建上下文
   # 多阶段构建减少镜像大小
   # 清理包管理器缓存
   ```

## 📊 监控和维护

### 服务监控

```bash
# 实时监控
watch -n 5 'docker ps && echo "" && docker stats --no-stream'

# 健康检查
while true; do curl -f http://localhost:5566/ping && echo " ✅" || echo " ❌"; sleep 30; done
```

### 自动化维护

```bash
# 创建定时任务清理日志
cat > /etc/cron.d/jimeng-cleanup << EOF
0 2 * * * root find /path/to/jimengapi/logs -name "*.log" -mtime +7 -delete
EOF
```

## 🔗 相关链接

- [项目主页](https://github.com/uidads/jimeng)
- [Docker Hub](https://hub.docker.com/r/uidads/jimeng-free-api)
- [问题反馈](https://github.com/uidads/jimeng/issues)

---

💡 如有问题，请查看详细日志或提交Issue。 