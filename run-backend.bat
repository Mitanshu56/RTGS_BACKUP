@echo off
echo Starting RTGS Backend Server...
echo.

:: Navigate to project root
cd /d "c:\Users\kevin\Downloads\rtgs-automation-app"

:: Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env"
    echo.
    echo Please edit .env file with your configuration.
    echo Opening .env file for editing...
    notepad .env
    pause
)

:: Check if we want to run locally or with Docker
echo Choose how to run the backend:
echo 1. Run locally (requires Python)
echo 2. Run with Docker (recommended)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto docker
goto invalid

:local
echo.
echo Setting up local environment...
cd backend

:: Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

:: Run the server
echo Starting FastAPI server...
echo.
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
goto end

:docker
echo.
echo Starting with Docker...
docker-compose up --build backend
goto end

:invalid
echo Invalid choice. Please run the script again and choose 1 or 2.

:end
pause