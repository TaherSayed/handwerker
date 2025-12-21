@echo off
echo ========================================
echo Starting OnSite App with FIXED PORT 8080
echo ========================================
echo.
echo IMPORTANT: Make sure http://localhost:8080/** is added to Supabase Redirect URLs!
echo.
echo Stopping any existing Flutter processes...
taskkill /F /IM dart.exe 2>nul
taskkill /F /IM flutter.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
timeout /t 3 /nobreak >nul
echo.
echo Cleaning problematic directories...
if exist "windows\flutter\ephemeral\.plugin_symlinks" (
    echo Removing plugin symlinks directory...
    rmdir /s /q "windows\flutter\ephemeral\.plugin_symlinks" 2>nul
    if exist "windows\flutter\ephemeral\.plugin_symlinks" (
        echo Warning: Could not delete plugin_symlinks - will try again after clean
    ) else (
        echo Successfully cleaned plugin_symlinks directory
    )
)
echo.
echo Cleaning Flutter build directory...
echo (Some directories may be locked - this is normal and won't prevent the app from running)
flutter clean 2>nul || echo Warning: Some directories could not be cleaned, but this is usually safe to ignore.
echo.
echo Final cleanup of plugin symlinks (in case clean recreated it)...
if exist "windows\flutter\ephemeral\.plugin_symlinks" (
    timeout /t 1 /nobreak >nul
    rmdir /s /q "windows\flutter\ephemeral\.plugin_symlinks" 2>nul
)
echo.
echo Getting Flutter dependencies...
flutter pub get
if errorlevel 1 (
    echo Error: Failed to get dependencies. Please check your connection and try again.
    pause
    exit /b 1
)
echo.
echo Starting Flutter app...
flutter run --dart-define-from-file=env.json --web-port=8080
pause

