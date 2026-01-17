@echo off
echo ==========================================
echo   HMS GitHub Deployer
echo ==========================================
echo.
echo Please ensure you are logged into GitHub in your browser.
echo We are about to push your code to:
echo https://github.com/syedabidali324/hospital-management-system.git
echo.
pause

git branch -M main
git remote remove origin
git remote add origin https://github.com/syedabidali324/hospital-management-system.git
git push -u origin main

echo.
echo ==========================================
echo   If you saw "Success" or "Enumerating objects", 
echo   then it worked!
echo ==========================================
pause
