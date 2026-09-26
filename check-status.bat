@echo off
REM Simple status checker for BPO Nexus dev server

REM Try to connect to the server using PowerShell (basic version that works)
powershell -Command "$ErrorActionPreference = 'SilentlyContinue'; try { $response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 3; if ($response.StatusCode -eq 200) { Write-Host '✅ Server is running and responding (HTTP 200)' } else { Write-Host '⚠️ Server responded with status: $($response.StatusCode)' } } catch { Write-Host '❌ Server is not responding or not running' }"

echo.
echo To start the server, run: npm run dev
echo To stop the server, close the terminal or press Ctrl+C in the dev server window
echo.
pause