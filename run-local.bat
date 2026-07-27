@echo off
REM JK위드미 로컬 실행 (Windows)
REM 사용법: 이 파일을 더블클릭하거나, 명령프롬프트에서 run-local.bat 실행
cd /d "%~dp0"

where php >nul 2>nul
if errorlevel 1 (
  echo PHP가 설치되어 있지 않습니다. PHP 7.4 이상을 먼저 설치하세요.
  pause
  exit /b 1
)

php setup-local.php
if errorlevel 1 (
  echo 초기화에 실패했습니다.
  pause
  exit /b 1
)

echo.
echo ======================================================
echo   홈페이지 :  http://localhost:8000
echo   관리자   :  http://localhost:8000/backend/admin/
echo              아이디 admin  /  비밀번호 jkwithme!2026
echo   (종료: Ctrl + C)
echo ======================================================
echo.

php -S localhost:8000 -t site
