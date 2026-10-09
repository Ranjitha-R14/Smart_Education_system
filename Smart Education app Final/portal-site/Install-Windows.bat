@echo off
title Install Smart Education Portal
echo.
echo  Installing Smart Education Portal ...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
echo.
pause
