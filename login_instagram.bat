@echo off
title MoonWeb Lab - Instagram Login
cd /d "%~dp0"
echo ===================================================
echo   MoonWeb Lab - Instagram Session Login
echo   Chrome will open. Log in calmly with no time limit!
echo ===================================================
echo.
call npm.cmd run instagram:login
pause
