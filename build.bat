@echo off
REM 构建脚本 - build.bat (Windows版本)
REM 用于构建Docker镜像

setlocal

echo 🚀 开始构建 jimeng-free-api Docker镜像...

REM 设置镜像名称和标签
set IMAGE_NAME=jimeng-free-api
set IMAGE_TAG=%1
if "%IMAGE_TAG%"=="" set IMAGE_TAG=latest
set FULL_IMAGE_NAME=%IMAGE_NAME%:%IMAGE_TAG%

echo 📦 镜像名称: %FULL_IMAGE_NAME%

REM 检查Docker是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未运行，请启动 Docker 后再试
    exit /b 1
)

REM 构建镜像
echo 🔨 构建镜像中...
docker build -t "%FULL_IMAGE_NAME%" .

if errorlevel 1 (
    echo ❌ 镜像构建失败
    exit /b 1
) else (
    echo ✅ 镜像构建成功！
    echo 📊 镜像信息:
    docker images | findstr "%IMAGE_NAME%"
    
    echo.
    echo 🎯 使用方法:
    echo   直接运行: docker run -p 5566:5566 %FULL_IMAGE_NAME%
    echo   Compose:  docker-compose up -d
    echo.
)

endlocal 