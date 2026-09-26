@echo off
REM Simple script to start and monitor BPO Nexus dev server

cls
echo 🚀 Starting BPO Nexus dev server...

REM Check if we need to kill existing processes first
for /f "tokens=*" %%a in ('tasklist /fi "imagename eq node.exe" 2^>nul') do (
    if not "%%a"=="INFO: No tasks are running which match the specified criteria." (
        echo ⚠️ Found existing node processes, stopping them...
        taskkill /f /im node.exe >nul 2>&1
    )
)

REM Start the dev server in a new window
start "BPO Nexus Dev Server" cmd /k "npm run dev"

echo ✅ Dev server started in a new window
echo.
echo Waiting for server to initialize...

REM Wait a bit for server to start
ping -n 10 127.0.0.1 >nul

REM Check if server is responding
powershell -Command "$ErrorActionPreference = 'SilentlyContinue'; try { $response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ Server is ready and responding!' } else { Write-Host '⚠️ Server responded with status: $($response.StatusCode)' } } catch { Write-Host '❌ Server is not responding yet - it may still be starting up' }"

echo.
echo The dev server is running in the window titled 'BPO Nexus Dev Server'
echo To stop it, close that window or press Ctrl+C in it
echo.
pause