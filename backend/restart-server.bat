@echo off
echo ========================================
echo    COMPLETE SERVER RESTART SCRIPT
echo ========================================
echo.

echo Step 1: Killing all Node processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM nodemon.exe /T >nul 2>&1
echo   ✓ Node processes killed

echo.
echo Step 2: Waiting for processes to close...
timeout /t 3 /nobreak >nul
echo   ✓ Wait complete

echo.
echo Step 3: Starting server with clean configuration...
echo   → Server will start in 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    STARTING SERVER NOW...
echo ========================================
npm run dev