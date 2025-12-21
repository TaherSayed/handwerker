@echo off
echo ========================================
echo Fixing Dart/Flutter Process Crashes
echo ========================================
echo.
echo This script will:
echo 1. Kill all Dart/Flutter processes
echo 2. Clean Flutter build directories
echo 3. Clear Pub cache
echo 4. Repair Flutter pub cache
echo 5. Refresh dependencies
echo.

echo Step 1: Stopping all Dart/Flutter processes...
taskkill /F /IM dart.exe 2>nul
taskkill /F /IM flutter.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
timeout /t 3 /nobreak >nul
echo Done.
echo.

echo Step 2: Cleaning problematic plugin symlinks directory...
if exist "windows\flutter\ephemeral\.plugin_symlinks" (
    rmdir /s /q "windows\flutter\ephemeral\.plugin_symlinks" 2>nul
    echo Cleaned plugin symlinks directory
)
echo.
echo Step 3: Cleaning Flutter build directories...
flutter clean 2>nul || echo Warning: Some directories could not be cleaned (this is usually safe to ignore)
echo Done.
echo.

echo Step 4: Clearing Pub cache...
powershell -Command "Remove-Item -Path '$env:APPDATA\Pub\Cache' -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path '$env:LOCALAPPDATA\Pub\Cache' -Recurse -Force -ErrorAction SilentlyContinue" 2>nul
echo Done.
echo.

echo Step 5: Repairing Flutter pub cache...
flutter pub cache repair
echo Done.
echo.

echo Step 6: Refreshing dependencies...
flutter pub get
if errorlevel 1 (
    echo Error: Failed to get dependencies.
    pause
    exit /b 1
)
echo Done.
echo.

echo ========================================
echo Fix completed!
echo ========================================
echo.
echo IMPORTANT: Please restart VS Code/Cursor to clear language server issues.
echo Then try running the app again with START_APP_FIXED_PORT.bat
echo.
pause

