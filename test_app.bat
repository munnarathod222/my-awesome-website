@echo off
cd /d "%~dp0"
echo =========================================================
echo Starting Jaibhavani Cargo System test environment...
echo =========================================================

:: Check if Node is installed
node -v >nul 2>&1
if not errorlevel 1 goto node_ok
echo [ERROR] Node.js is not recognized!
echo.
echo 1. Make sure you installed Node.js from https://nodejs.org
echo 2. IMPORTANT: Close your code editor Cursor or VS Code and open it again so Windows can detect the installation.
echo.
pause
exit /b

:node_ok
:: Read version from .pocketbase-version
if not exist "apps\pocketbase\.pocketbase-version" (
    echo 0.38.0 > apps\pocketbase\.pocketbase-version
)
set PB_VERSION=0.38.0
if exist "apps\pocketbase\.pocketbase-version" (
    set /p PB_VERSION=<apps\pocketbase\.pocketbase-version
)
:: Clean whitespace/carriage returns safely
if not "%PB_VERSION%"=="" (
    for /f "tokens=1" %%g in ("%PB_VERSION%") do set PB_VERSION=%%g
)
if "%PB_VERSION%"=="" set PB_VERSION=0.38.0

:: Check if already downloaded correct version
if not exist "apps\pocketbase\pocketbase.exe" goto download_pb
if not exist "apps\pocketbase\.downloaded-version" goto download_pb

set CURRENT_VER=
if exist "apps\pocketbase\.downloaded-version" (
    set /p CURRENT_VER=<apps\pocketbase\.downloaded-version
)
if not "%CURRENT_VER%"=="" (
    for /f "tokens=1" %%g in ("%CURRENT_VER%") do set CURRENT_VER=%%g
)

if "%CURRENT_VER%"=="%PB_VERSION%" goto pb_ok

:download_pb
echo [INFO] PocketBase version mismatch or not found. Target version: v%PB_VERSION%
echo [INFO] Downloading Windows database runner PocketBase v%PB_VERSION%...
if exist "apps\pocketbase\pocketbase.exe" del /f /q "apps\pocketbase\pocketbase.exe"
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/pocketbase/pocketbase/releases/download/v%PB_VERSION%/pocketbase_%PB_VERSION%_windows_amd64.zip' -OutFile 'apps\pocketbase\pocketbase.zip'"
powershell -Command "Expand-Archive -Path 'apps\pocketbase\pocketbase.zip' -DestinationPath 'apps\pocketbase' -Force"
if exist "apps\pocketbase\pocketbase.zip" del apps\pocketbase\pocketbase.zip
echo %PB_VERSION% > apps\pocketbase\.downloaded-version
echo [INFO] PocketBase v%PB_VERSION% downloaded successfully!

:pb_ok
:: Start PocketBase
echo Starting PocketBase database...
start "PocketBase Database" cmd /k "cd apps\pocketbase && pocketbase.exe serve"

:: Wait 3 seconds for database to initialize
ping -n 4 127.0.0.1 > nul

:: Run installation check
echo [INFO] Checking/Installing backend dependencies (please wait)...
cd apps\api
call npm install
cd ..\..

echo [INFO] Checking/Installing frontend dependencies (please wait)...
cd apps\web
call npm install
cd ..\..

:: Start Backend API
echo Starting Backend API...
start "Backend API" cmd /k "cd apps\api && npm run dev"

:: Start Frontend
echo Starting Frontend Client...
start "Frontend Client" cmd /k "cd apps\web && npm run dev"

echo ---------------------------------------------------------
echo All systems starting up.
echo Keep the opened black windows running in the background.
echo To stop testing, simply close those windows.
echo ---------------------------------------------------------
pause
