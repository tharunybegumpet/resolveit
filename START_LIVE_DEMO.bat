@echo off
echo ========================================
echo   ResolveIT - Live Demo Setup
echo ========================================
echo.
echo This will start your project and create public URLs
echo that anyone can access from anywhere!
echo.
echo REQUIREMENTS:
echo 1. Ngrok installed at C:\ngrok\ngrok.exe
echo 2. MySQL running with resolveit database
echo 3. Internet connection
echo.
pause

echo.
echo ========================================
echo   Step 1: Starting Backend...
echo ========================================
echo.
start "ResolveIT Backend" cmd /k "cd resolveit-backend && mvn spring-boot:run"
echo Backend starting... (wait 30 seconds)
timeout /t 30 /nobreak

echo.
echo ========================================
echo   Step 2: Starting Frontend...
echo ========================================
echo.
start "ResolveIT Frontend" cmd /k "cd resolveit-frontend && npm start"
echo Frontend starting... (wait 20 seconds)
timeout /t 20 /nobreak

echo.
echo ========================================
echo   Step 3: Creating Public URLs...
echo ========================================
echo.
echo Opening Ngrok for Backend (Port 8080)...
start "Ngrok Backend" cmd /k "cd C:\ngrok && ngrok http 8080"
timeout /t 3 /nobreak

echo.
echo Opening Ngrok for Frontend (Port 3000)...
start "Ngrok Frontend" cmd /k "cd C:\ngrok && ngrok http 3000"

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Check the "Ngrok Backend" window
echo    - Copy the URL (e.g., https://abc123.ngrok-free.app)
echo.
echo 2. Check the "Ngrok Frontend" window
echo    - Copy the URL (e.g., https://xyz789.ngrok-free.app)
echo.
echo 3. Update Frontend:
echo    - Open: resolveit-frontend/src/App.js
echo    - Replace localhost:8080 with your Backend URL
echo    - Save the file
echo.
echo 4. Share your Frontend URL with anyone!
echo.
echo Demo Credentials:
echo    Admin: tharuny.begumpet@gmail.com / admin123
echo    User:  user1@resolveit.com / password123
echo.
echo ========================================
echo   Keep all windows open while demo is active!
echo ========================================
echo.
pause
