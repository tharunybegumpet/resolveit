@echo off
echo ========================================
echo    ResolveIT Grievance System
echo    Starting Backend and Frontend
echo ========================================
echo.

echo [1/4] Checking Java...
java -version
if errorlevel 1 (
    echo ERROR: Java not found! Please install Java 17+
    pause
    exit /b 1
)

echo.
echo [2/4] Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js 16+
    pause
    exit /b 1
)

echo.
echo [3/4] Starting Backend on port 8080...
start "ResolveIT Backend" cmd /k "cd resolveit-backend && mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak

echo.
echo [4/4] Starting Frontend on port 3000...
start "ResolveIT Frontend" cmd /k "cd resolveit-frontend && npm start"

echo.
echo ========================================
echo    ResolveIT is Starting!
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Admin Login:
echo Email: tharuny.begumpet@gmail.com
echo Password: admin123
echo.
echo Press any key to open browser...
pause

start http://localhost:3000

echo.
echo To stop: Close the Backend and Frontend windows
echo.
pause