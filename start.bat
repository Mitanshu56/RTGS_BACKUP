@echo off
echo Starting RTGS Automation Application...
echo.

:: Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)

:: Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: docker-compose is not available!
    echo Please install Docker Compose.
    pause
    exit /b 1
)

:: Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env"
    echo.
    echo Please edit .env file with your configuration before running again.
    echo Opening .env file for editing...
    notepad .env
    pause
    exit /b 0
)

echo Building and starting containers...
docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start containers!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  RTGS Automation Application Started!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo To stop the application, run: docker-compose down
echo To view logs, run: docker-compose logs -f
echo.
echo Press any key to open the application in your browser...
pause >nul

:: Open the application in default browser
start http://localhost:3000

echo.
echo Application is running! Press any key to exit this window.
pause >nul