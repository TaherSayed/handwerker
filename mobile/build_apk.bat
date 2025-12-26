@echo off
REM Build APK for OnSite Handwerker App (Windows)
REM This script builds a release APK with production environment variables

echo 🚀 Building OnSite Handwerker APK...

REM Environment variables (update these with your actual values)
set SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
set SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
set API_URL=https://hw.sata26.cloud/api

REM Navigate to mobile directory
cd /d "%~dp0"

REM Check if Flutter is installed
where flutter >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Flutter is not installed. Please install Flutter first.
    echo    Visit: https://flutter.dev/docs/get-started/install
    exit /b 1
)

REM Check Flutter doctor
echo 📋 Checking Flutter setup...
flutter doctor

REM Get dependencies
echo 📦 Getting dependencies...
flutter pub get

REM Clean previous builds
echo 🧹 Cleaning previous builds...
flutter clean

REM Build APK with environment variables
echo 🔨 Building release APK...
flutter build apk --release ^
  --dart-define=SUPABASE_URL=%SUPABASE_URL% ^
  --dart-define=SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY% ^
  --dart-define=API_URL=%API_URL%

REM APK location
set APK_PATH=build\app\outputs\flutter-apk\app-release.apk

if exist "%APK_PATH%" (
    echo.
    echo ✅ APK built successfully!
    echo 📱 APK location: %APK_PATH%
    echo.
    echo 📲 To install on your phone:
    echo    1. Transfer the APK to your phone
    echo    2. Enable 'Install from unknown sources' in Android settings
    echo    3. Open the APK file and install
    echo.
    echo 💡 Or use ADB to install directly:
    echo    adb install %APK_PATH%
) else (
    echo ❌ APK build failed. Check the error messages above.
    exit /b 1
)

pause

