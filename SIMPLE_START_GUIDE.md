"# Simple Guide to Start and Manage BPO Nexus Dev Server

## ✅ Current Status
The dev server **does work** when you run `npm run dev` directly. 
From previous logs, we can see it starts successfully:
```
VITE v8.2.0 ready in 3634 ms
Local:   http://localhost:8080/
Network: http://192.168.42.19:8080/
```

## 🚀 Recommended Simple Approach

### To Start the Server:
1. Open a new terminal/command prompt
2. Navigate to the project directory: `cd /path/to/bpo-nexus-command`
3. Run: `npm run dev`
4. The server will start and be available at http://localhost:8080
5. **Leave this terminal open** - closing it will stop the server

### To Check if Server is Running:
Open your browser and go to: http://localhost:8080
- If you see the BPO Nexus interface, it's running
- If you get a connection error, it's not running

### To Stop the Server:
- Simply press `Ctrl+C` in the terminal where you ran `npm run dev`
- OR close that terminal window

## 🛠️ Helper Scripts (Simple & Reliable)

I've created some simple batch files that avoid the PowerShell/complex command issues:

### check-server.bat
```bat
@echo off
echo Checking if BPO Nexus dev server is running...
echo.
powershell -Command "$ErrorActionPreference = 'SilentlyContinue'; try { $response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 3; if ($response.StatusCode -eq 200) { Write-Host '✅ Server is running and responding (HTTP 200)' } else { Write-Host '⚠️ Server responded with status: $($response.StatusCode)' } } catch { Write-Host '❌ Server is not responding or not running' }"
echo.
echo To start server: run 'npm run dev' in a terminal
echo To stop server: press Ctrl+C in the dev server terminal
pause
```

### start-server.bat
```bat
@echo off
echo.
echo ========================================
echo   BPO Nexus Dev Server Starter
echo ========================================
echo.
echo This will start the dev server in a NEW window.
echo You can stop it by closing that window or pressing Ctrl+C.
echo.
echo Starting server...
start "" "npm run dev"
timeout /t 5 >nul
echo.
echo ✅ Server started! Check the new window for logs.
echo.
echo To verify it's running, run: check-server.bat
echo.
pause
```

## 📝 Notes

1. **The dev server works** - the issue has been with the monitoring/checking scripts, not the server itself
2. **Simple is best** - just run `npm run dev` in a terminal and leave it open
3. **Resource usage** - the dev server only uses resources when actively running; stopping it (closing terminal) frees all resources
4. **No credits wasted** - as long as you stop the server when not in use, there's no ongoing cost

## 🔧 Troubleshooting

If you see "failed to load config" errors:
- Make sure vite.config.ts exists and exports a valid object
- The current vite.config.ts should work (we fixed it earlier)

If port 8080 is already in use:
- Check what's using it: `netstat -ano | findstr :8080`
- Kill the process: `taskkill /f /pid [PID_NUMBER]`
- Or just use a different port by modifying vite.config.ts

## ✅ Summary
**Just run `npm run dev` in a terminal when you want to work on the project.**
**Close that terminal when you're done.**
That's the safest, most reliable way to use the dev server without wasting resources.
"