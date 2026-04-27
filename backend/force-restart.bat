@echo off
echo 🔄 Force Restart Script
echo.
echo Killing all Node processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM nodemon.exe /T 2>nul
echo.
echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul
echo.
echo Clearing npm cache...
npm cache clean --force
echo.
echo Starting server with fresh configuration...
echo.
npm run dev