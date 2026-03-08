@echo off
echo ========================================
echo   ResolveIT - Demo Readiness Check
echo ========================================
echo.

echo Checking Backend (Port 8080)...
curl -s http://localhost:8080/api/auth/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 8080
) else (
    echo [X] Backend is NOT running
    echo     Start with: cd resolveit-backend ^&^& mvn spring-boot:run
)

echo.
echo Checking Frontend (Port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is running on port 3000
) else (
    echo [X] Frontend is NOT running
    echo     Start with: cd resolveit-frontend ^&^& npm start
)

echo.
echo Checking Ngrok...
if exist "C:\ngrok\ngrok.exe" (
    echo [OK] Ngrok is installed at C:\ngrok\
) else (
    echo [X] Ngrok NOT found
    echo     Download from: https://ngrok.com/download
    echo     Extract to: C:\ngrok\
)

echo.
echo ========================================
echo   Summary
echo ========================================
echo.
echo If all checks pass, you're ready to create public URLs!
echo.
echo Next steps:
echo 1. Open 2 new terminals
echo 2. Terminal 1: cd C:\ngrok ^&^& ngrok http 8080
echo 3. Terminal 2: cd C:\ngrok ^&^& ngrok http 3000
echo 4. Copy the URLs and share!
echo.
pause
