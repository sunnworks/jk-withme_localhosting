@echo off
REM 누락 미디어 자동 보충 (Windows) - 이 파일을 더블클릭하세요. PHP 불필요.
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0download-missing.ps1"
