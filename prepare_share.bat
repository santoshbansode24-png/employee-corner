@echo off
echo ===================================================
echo   Employee Corner - Sharing Cleanup Tool
echo ===================================================
echo.
echo This script will delete 'node_modules' and python '.venv' 
echo to make the folder small enough to email or upload.
echo.
echo IMPORTANT: Make sure you have STOPPED the 'npm start' server first!
echo.
pause

echo.
echo 1. Deleting node_modules... (This may take a minute)
rmdir /s /q node_modules
if exist node_modules (
    echo    - Failed to delete some files. Is the server still running?
) else (
    echo    - Done.
)

echo.
echo 2. Deleting Python virtual environment...
rmdir /s /q medical_gen\.venv
rmdir /s /q medical_gen\__pycache__
echo    - Done.

echo.
echo ===================================================
echo   Cleanup Complete!
echo ===================================================
echo.
echo Now you can:
echo 1. Right-click the 'EMPLOYEE CORNER 1.0' folder.
echo 2. Select 'Send to' -> 'Compressed (zipped) folder'.
echo 3. Upload the Zip file to Google Drive.
echo.
pause
