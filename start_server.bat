@echo off
REM Simple Windows management script for BPO Nexus dev server

setlocal enabledelayedexpansion

if "%~1"=="" goto :help
if "%~1"=="start" goto :start_server
if "%~1"=="stop" goto :stop_server
if "%~1"=="restart" goto :restart_server
if "%~1"=="status" goto :check_status
if "%~1"=="help" goto :help

echo Unknown command: %~1
goto :help

:start_server
echo 🚀 Starting BPO Nexus dev server...
echo This will start the server and monitor it for health.

REM Check if server is already running
powershell -Command "\$ErrorActionPreference = 'Stop'; try { \$response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 3; Write-Host '⚠️ Server is already running on port 8080'; pause; exit 0 } catch { exit 1 }"

if errorlevel 0 goto :already_running

REM Start the server
start "" npm run dev
timeout /t 5 >nul

powershell -Command "\$ErrorActionPreference = 'Stop'; try { \$response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Server started successfully'; exit 0 } catch { Write-Host '⚠️ Server started but may not be fully ready'; exit 1 }"

if errorlevel 0 (
    echo ✅ Server startup complete
    echo 📊 Server is now running on http://localhost:8080
) else (
    echo ⚠️ Server may still be starting up
)

pause
goto :eof

:stop_server
echo 🛑 Stopping BPO Nexus dev server...

powershell -Command "\$ErrorActionPreference = 'Stop'; try { Get-Process -Name 'node' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Write-Host '✅ Node processes stopped' } catch { Write-Host '⚠️ No node processes found' }"

taskkill /f /im node.exe >nul 2>&1

powershell -Command "\$ErrorActionPreference = 'Stop'; try { \$response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 3; Write-Host '⚠️ Server was still responding' } catch { Write-Host '✅ Server is stopped' }"

echo ✅ Server stopped successfully
pause
goto :eof

:restart_server
call :stop_server
timeout /t 3 >nul
call :start_server
goto :eof

:check_status
powershell -Command "\$ErrorActionPreference = 'Stop'; try { \$response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 3; Write-Host '✅ Server is running and healthy'; exit 0 } catch { Write-Host '❌ Server is not responding'; exit 1 }"
goto :eof

:help
echo Usage: manage_server.bat [command]
echo.
echo Commands:
echo   start    Start the dev server and monitor it
echo   stop     Stop the dev server
echo   restart  Restart the dev server
echo   status   Check if the server is running
echo   help     Show this help message
goto :eof

:already_running
echo ℹ️ Server is already running
pause
goto :eof"