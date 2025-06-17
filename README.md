# 🎨 jimeng-free-api

> 基于 Node.js 的免费图像生成 API 服务

[![GitHub stars](https://img.shields.io/github/stars/uidads/jimeng?style=flat-square)](https://github.com/uidads/jimeng/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/uidads/jimeng?style=flat-square)](https://github.com/uidads/jimeng/network)
[![GitHub issues](https://img.shields.io/github/issues/uidads/jimeng?style=flat-square)](https://github.com/uidads/jimeng/issues)
[![Docker](https://img.shields.io/badge/docker-supported-blue?style=flat-square)](https://www.docker.com/)

## ✨ 特性

- 🚀 **快速部署** - 支持 Docker 一键部署
- 🎯 **简单易用** - RESTful API 设计
- 🔄 **自动重启** - 支持服务自动恢复
- 📊 **健康检查** - 内置服务监控
- 🐳 **容器化** - 完整的 Docker 支持
- 🌐 **跨平台** - 支持 Linux/Windows/macOS

## 🚀 快速开始

### 方法一：一键部署（推荐）

**Linux/macOS:**
```bash
curl -fsSL https://raw.githubusercontent.com/uidads/jimeng/main/quick-deploy.sh | bash
```

**Windows:**
```powershell
# 下载并运行快速部署脚本
curl -fsSL https://raw.githubusercontent.com/uidads/jimeng/main/quick-deploy.bat -o quick-deploy.bat
quick-deploy.bat
```

### 方法二：手动部署

```bash
# 1. 克隆项目
git clone https://github.com/uidads/jimeng.git
cd jimeng

# 2. 使用 Docker Compose（推荐）
docker-compose up -d

# 或者使用部署脚本
chmod +x deploy.sh
./deploy.sh
```

## 📋 系统要求

- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0（可选）
- **内存**: >= 2GB
- **磁盘**: >= 10GB

## 🔧 API 使用

### 健康检查
```bash
curl http://localhost:5566/ping
```

### 图像生成
```bash
# 示例 API 调用
curl -X POST http://localhost:5566/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "一只可爱的小猫"}'
```

## 📂 项目结构

```
jimeng/
├── src/                 # 源代码
├── configs/             # 配置文件
├── docker/              # Docker 相关配置
├── logs/                # 日志文件
├── public/              # 静态资源
├── docker-compose.yml   # Docker Compose 配置
├── Dockerfile          # Docker 构建文件
├── deploy.sh           # 部署脚本
├── quick-deploy.sh     # 快速部署脚本
└── README-Docker.md    # Docker 详细文档
```

## 🛠️ 开发

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建项目
npm run build

# 生产模式运行
npm start
```

### Docker 开发

```bash
# 构建开发镜像
./build.sh dev

# 运行开发容器
docker run -p 5566:5566 \
  -v $(pwd)/src:/app/src \
  jimeng-free-api:dev
```

## 📊 服务管理

### 查看状态
```bash
docker ps                              # 查看容器状态
docker logs -f jimeng-free-api         # 查看实时日志
curl http://localhost:5566/ping        # 健康检查
```

### 服务控制
```bash
docker restart jimeng-free-api         # 重启服务
docker stop jimeng-free-api            # 停止服务
docker-compose restart                 # 重启所有服务
docker-compose down                    # 停止所有服务
```

### 服务更新
```bash
git pull origin main                   # 更新代码
./deploy.sh                           # 重新部署
```

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep 5566
   # 或者修改 docker-compose.yml 中的端口映射
   ```

2. **容器启动失败**
   ```bash
   # 查看详细日志
   docker logs jimeng-free-api
   ```

3. **内存不足**
   ```bash
   # 检查系统资源
   free -h
   docker stats
   ```

### 获取帮助

- 🚀 [完整部署指南](./DEPLOY.md)
- 📖 [Docker 部署文档](./README-Docker.md)
- 🐛 [提交问题](https://github.com/uidads/jimeng/issues)
- 💬 [讨论区](https://github.com/uidads/jimeng/discussions)

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 🌟 支持项目

如果这个项目对你有帮助，请给它一个 ⭐️！

---

**项目地址**: https://github.com/uidads/jimeng  
**快速部署**: [DEPLOY.md](./DEPLOY.md)  
**Docker文档**: [README-Docker.md](./README-Docker.md)  
**更新日志**: [CHANGELOG.md](./CHANGELOG.md)
