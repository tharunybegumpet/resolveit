@echo off
echo ========================================
echo Starting ResolveIT Backend Server
echo ========================================
echo.
cd resolveit-backend
echo Cleaning and starting Spring Boot...
call mvn clean spring-boot:run
pause
