# 多阶段构建 Dockerfile for jimeng-free-api

# ===== 前端构建阶段 =====
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端项目文件
COPY dream/package*.json ./

# 安装前端依赖（包括开发依赖用于构建）
RUN npm install --ignore-scripts

# 复制前端源码
COPY dream/ ./

# 构建前端项目
RUN npm run build

# ===== 后端构建阶段 =====
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# 复制后端项目文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装依赖（包括开发依赖，用于构建）
RUN npm install --ignore-scripts

# 复制后端源码
COPY src/ ./src/
COPY public/ ./public/
COPY configs/ ./configs/

# 从前端构建阶段复制构建产物
COPY --from=frontend-builder /app/public/dream ./public/dream/

# 构建后端项目
RUN npm run build

# ===== 运行时阶段 =====
FROM node:18-alpine AS runtime

# 安装必要的运行时依赖
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# 创建用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S jimeng -u 1001

WORKDIR /app

# 复制package.json
COPY package*.json ./

# 只安装生产依赖
RUN npm install --only=production --ignore-scripts && \
    npm cache clean --force

# 复制构建产物和必要文件
COPY --from=backend-builder /app/backend/dist ./dist/
COPY --from=backend-builder /app/backend/public ./public/
COPY --from=backend-builder /app/backend/configs ./configs/

# 创建日志目录
RUN mkdir -p logs && \
    chown -R jimeng:nodejs /app

# 切换到非root用户
USER jimeng

# 暴露端口
EXPOSE 5566

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5566/ping || exit 1

# 启动命令
CMD ["npm", "start"] 