@echo off
echo Starting PostgreSQL with Docker...
echo.

:: Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)

:: Start PostgreSQL container
echo Starting PostgreSQL container...
docker run -d ^
  --name rtgs-postgres ^
  -e POSTGRES_DB=rtgs_db ^
  -e POSTGRES_USER=rtgs_user ^
  -e POSTGRES_PASSWORD=rtgs_password ^
  -p 5432:5432 ^
  postgres:15

if errorlevel 1 (
    echo.
    echo Container might already exist. Trying to start existing container...
    docker start rtgs-postgres
)

echo.
echo PostgreSQL is now running!
echo Database: rtgs_db
echo User: rtgs_user
echo Password: rtgs_password
echo Host: localhost:5432
echo.
echo To stop PostgreSQL: docker stop rtgs-postgres
echo To remove PostgreSQL: docker rm rtgs-postgres
echo.
pause