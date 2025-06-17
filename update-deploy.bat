@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

REM 🔄 jimeng-free-api 项目更新脚本 (Windows版本)
REM 用于更新现有的Docker部署

echo 🔄 jimeng-free-api 项目更新脚本
echo =================================

REM 配置参数
set IMAGE_NAME=jimeng-free-api
set CONTAINER_NAME=jimeng-free-api
set IMAGE_TAG=%1
if "%IMAGE_TAG%"=="" set IMAGE_TAG=latest
set FULL_IMAGE_NAME=%IMAGE_NAME%:%IMAGE_TAG%

REM 生成备份标签
for /f "tokens=1-4 delims=/ " %%i in ('date /t') do set DATE_PART=%%l%%i%%j
for /f "tokens=1-2 delims=: " %%i in ('time /t') do set TIME_PART=%%i%%j
set BACKUP_TAG=backup-%DATE_PART%-%TIME_PART%

REM 检查是否在项目目录中
if not exist "package.json" goto :not_in_project
if not exist "Dockerfile" goto :not_in_project

echo 📊 当前状态检查...

REM 检查Docker是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未运行，请启动Docker Desktop
    goto :error
)

REM 检查容器是否运行
docker ps -q -f name=%CONTAINER_NAME% >nul 2>&1
if errorlevel 1 (
    echo ⚠️  容器未运行或不存在
    set CONTAINER_RUNNING=false
) else (
    echo ✅ 发现运行中的容器: %CONTAINER_NAME%
    set CONTAINER_RUNNING=true
)

REM 备份当前镜像（如果存在）
docker images -q %FULL_IMAGE_NAME% >nul 2>&1
if not errorlevel 1 (
    echo 💾 备份当前镜像...
    docker tag %FULL_IMAGE_NAME% %IMAGE_NAME%:%BACKUP_TAG%
    echo   备份镜像: %IMAGE_NAME%:%BACKUP_TAG%
)

REM 更新代码（如果是Git仓库）
if exist ".git" (
    echo 📦 更新代码...
    git fetch --all
    git pull origin main || git pull origin master
    if errorlevel 1 (
        echo ⚠️ Git拉取失败，请手动检查
    ) else (
        echo ✅ 代码更新完成
    )
) else (
    echo ⚠️ 非Git仓库，请手动确保代码已更新
)

REM 停止现有容器
if "%CONTAINER_RUNNING%"=="true" (
    echo 🛑 停止现有容器...
    docker stop %CONTAINER_NAME%
    docker rm %CONTAINER_NAME%
    echo ✅ 容器已停止并删除
)

REM 构建新镜像
echo 🔨 构建新Docker镜像...
docker build -t %FULL_IMAGE_NAME% .
if errorlevel 1 (
    echo ❌ 镜像构建失败
    goto :error
)

echo ✅ 新镜像构建成功

REM 创建必要的目录
echo 📁 检查必要目录...
if not exist "logs" mkdir logs
if not exist "configs\prod" mkdir configs\prod

REM 启动新容器
echo 🚢 启动新容器...
docker run -d ^
    --name %CONTAINER_NAME% ^
    --restart unless-stopped ^
    -p 5566:5566 ^
    -v "%cd%\logs:/app/logs" ^
    -v "%cd%\configs:/app/configs:ro" ^
    -e NODE_ENV=production ^
    -e TZ=Asia/Shanghai ^
    %FULL_IMAGE_NAME%

if errorlevel 1 (
    echo ❌ 容器启动失败
    goto :error
)

echo ✅ 容器启动成功！

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 15 /nobreak >nul

REM 检查服务健康状态
echo 🔍 检查服务健康状态...
set /a counter=0
:healthcheck_loop
set /a counter+=1
curl -f http://localhost:5566/ping >nul 2>&1
if not errorlevel 1 (
    echo ✅ 服务健康检查通过！
    goto :success
)
if %counter% GEQ 6 (
    echo ❌ 服务健康检查失败
    echo 📋 容器日志:
    docker logs --tail 20 %CONTAINER_NAME%
    goto :error
)
echo ⏳ 等待服务启动... (%counter%/6)
timeout /t 10 /nobreak >nul
goto :healthcheck_loop

:success
echo.
echo 🎉 更新部署完成！
echo.
echo 📊 服务信息:
echo   容器名称: %CONTAINER_NAME%
echo   镜像版本: %FULL_IMAGE_NAME%
echo   备份镜像: %IMAGE_NAME%:%BACKUP_TAG%
echo   访问地址: http://localhost:5566
echo   健康检查: http://localhost:5566/ping
echo.
echo 🔧 管理命令:
echo   查看日志: docker logs -f %CONTAINER_NAME%
echo   查看状态: docker ps ^| findstr %CONTAINER_NAME%
echo   重启服务: docker restart %CONTAINER_NAME%
echo.
goto :end

:not_in_project
echo ❌ 请在项目根目录中运行此脚本
goto :error

:error
echo.
echo ❌ 更新失败，请检查错误信息
pause
exit /b 1

:end
pause
exit /b 0 