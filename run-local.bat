@echo off
chcp 65001 >nul
cd /d "%~dp0"

where php >nul 2>nul
if errorlevel 1 (
  echo [!] PHP not found. Please install PHP 7.4+ first.
  echo     Windows: install XAMPP from https://www.apachefriends.org  ^(includes PHP^)
  pause
  exit /b 1
)

php setup-local.php
if errorlevel 1 (
  echo [!] Setup failed.
  pause
  exit /b 1
)

echo.
echo ======================================================
echo   Homepage : http://localhost:8000
echo   Admin    : http://localhost:8000/backend/admin/
echo   Login    : admin  /  jkwithme!2026
echo   ^(Press Ctrl + C to stop the server^)
echo ======================================================
echo.

php -S localhost:8000 -t site
pause
