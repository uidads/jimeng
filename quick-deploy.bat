@echo off
chcp 65001
setlocal EnableDelayedExpansion

echo 🚀 jimeng-free-api 快速部署脚本 (Windows)
echo ==========================================
echo 📦 项目地址: https://github.com/uidads/jimeng.git
echo.

REM 配置参数
set REPO_URL=https://github.com/uidads/jimeng.git
set PROJECT_DIR=jimeng
set BRANCH=%1
if "%BRANCH%"=="" set BRANCH=main

echo 🔍 检查系统环境...

REM 检查Git
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Git 未安装，请从 https://git-scm.com/ 下载安装Git
    pause
    exit /b 1
)

REM 检查Docker
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker 未安装，请从 https://www.docker.com/products/docker-desktop 下载安装Docker Desktop
    pause
    exit /b 1
)

REM 检查Docker是否运行
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker 未运行，请启动Docker Desktop
    pause
    exit /b 1
)

echo ✅ 系统环境检查通过

REM 克隆或更新项目
echo 📦 克隆项目...
if exist "%PROJECT_DIR%" (
    echo ⚠️  目录 %PROJECT_DIR% 已存在，正在更新...
    cd "%PROJECT_DIR%"
    git pull origin %BRANCH%
    if %ERRORLEVEL% neq 0 (
        echo ❌ 项目更新失败
        pause
        exit /b 1
    )
) else (
    git clone -b %BRANCH% %REPO_URL% %PROJECT_DIR%
    if %ERRORLEVEL% neq 0 (
        echo ❌ 项目克隆失败
        pause
        exit /b 1
    )
    cd "%PROJECT_DIR%"
)

echo ✅ 项目克隆/更新完成

REM 检查部署脚本
if not exist "build.bat" (
    echo ❌ 未找到 build.bat 文件
    pause
    exit /b 1
)

REM 执行构建和部署
echo 🚀 开始构建和部署...
call build.bat
if %ERRORLEVEL% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

REM 使用Docker Compose启动服务
docker-compose up -d
if %ERRORLEVEL% neq 0 (
    echo ❌ 服务启动失败
    pause
    exit /b 1
)

echo.
echo 🎉 部署完成！
echo.
echo 📋 部署信息:
echo   项目目录: %CD%
echo   项目地址: %REPO_URL%
echo   访问地址: http://localhost:5566
echo   健康检查: http://localhost:5566/ping
echo.
echo 🔧 常用命令:
echo   查看状态: docker ps
echo   查看日志: docker logs -f jimeng-free-api
echo   停止服务: docker-compose down
echo   重启服务: docker-compose restart
echo   重新部署: quick-deploy.bat
echo.
echo 📖 更多信息请查看: README-Docker.md
echo.
pause 