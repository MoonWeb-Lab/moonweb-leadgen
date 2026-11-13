@echo off
echo ==============================================
echo Pushing MoonWeb LeadGen to GitHub...
echo ==============================================
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo [OK] Successfully pushed to https://github.com/MoonWeb-Lab/moonweb-leadgen
) else (
    echo [ERROR] Make sure you created the empty repo at https://github.com/new with name 'moonweb-leadgen'!
)
pause
