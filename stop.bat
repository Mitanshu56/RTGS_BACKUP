@echo off
echo Stopping RTGS Automation Application...
echo.

docker-compose down

if errorlevel 1 (
    echo.
    echo ERROR: Failed to stop containers!
    echo Check if docker-compose is available and containers are running.
) else (
    echo.
    echo Application stopped successfully!
)

echo.
pause