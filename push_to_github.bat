@echo off
echo ========================================
echo   ResolveIT - Push to GitHub Script
echo ========================================
echo.
echo INSTRUCTIONS:
echo 1. Create a new repository on GitHub.com
echo 2. Repository name: resolveit-complaint-management
echo 3. Make it PUBLIC so your mentor can see it
echo 4. DON'T initialize with README
echo 5. Copy the repository URL from GitHub
echo.
set /p repo_url="Enter your GitHub repository URL: "
echo.
echo Adding remote origin...
git remote add origin %repo_url%
echo.
echo Pushing to GitHub...
git push -u origin main
echo.
echo ========================================
echo   SUCCESS! Your project is now on GitHub
echo ========================================
echo.
echo Share this URL with your mentor:
echo %repo_url%
echo.
pause