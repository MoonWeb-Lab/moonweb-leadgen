@echo off
title MoonWeb Lab - Instagram Autopilot
cd /d "%~dp0"
echo ===================================================
echo   MoonWeb Lab - Instagram Auto-DM Bot (15/day)
echo ===================================================
echo.
call npm.cmd run instagram:outreach
echo.
echo ===================================================
echo   Finished. Press any key to exit...
echo ===================================================
pause > nul
