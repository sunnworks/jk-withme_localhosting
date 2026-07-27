@echo off
chcp 65001 >nul
REM Fill missing media from the live site (no PHP needed - uses PowerShell)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0download-missing.ps1"
pause
