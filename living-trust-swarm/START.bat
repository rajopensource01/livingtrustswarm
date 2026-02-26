@echo off
REM Living Trust Swarm - Quick Start Script for Windows

echo 🚀 Living Trust Swarm - Quick Start
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    echo    Visit: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    echo    Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed
echo.

REM Navigate to docker directory
cd /d "%~dp0docker"

echo 📦 Building and starting containers...
echo.

REM Start all services
docker-compose up --build

echo.
echo ✨ System is running!
echo.
echo 📱 Access the application:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8000
echo    API Docs:  http://localhost:8000/docs
echo.
echo 🛑 To stop the system, press Ctrl+C
echo    Or run: docker-compose down
pause