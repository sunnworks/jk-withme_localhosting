@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM --- locate php.exe folder (to find its ext directory) ---
set "PHPDIR="
for %%i in (php.exe) do set "PHPDIR=%%~dp$PATH:i"
if not defined PHPDIR (
  echo [!] PHP not found in PATH. Please install PHP 7.4+ first.
  echo     Windows: install XAMPP from https://www.apachefriends.org  ^(includes PHP^)
  pause
  exit /b 1
)

REM --- enable SQLite drivers at runtime, so php.ini is NOT required ---
set "EXT=-d extension_dir=%PHPDIR%ext -d extension=pdo_sqlite -d extension=sqlite3"

php %EXT% setup-local.php
if errorlevel 1 (
  echo.
  echo [!] Setup failed. See the message above.
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

php %EXT% -S localhost:8000 -t site
pause
