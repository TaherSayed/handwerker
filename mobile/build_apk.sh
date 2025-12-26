#!/bin/bash

# Build APK for OnSite Handwerker App
# This script builds a release APK with production environment variables

set -e

echo "🚀 Building OnSite Handwerker APK..."

# Environment variables (update these with your actual values)
SUPABASE_URL="https://ckargfikgicnflsqbbld.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU"
API_URL="https://hw.sata26.cloud/api"

# Navigate to mobile directory
cd "$(dirname "$0")"

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Please install Flutter first."
    echo "   Visit: https://flutter.dev/docs/get-started/install"
    exit 1
fi

# Check Flutter doctor
echo "📋 Checking Flutter setup..."
flutter doctor

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean

# Build APK with environment variables
echo "🔨 Building release APK..."
flutter build apk --release \
  --dart-define=SUPABASE_URL="$SUPABASE_URL" \
  --dart-define=SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  --dart-define=API_URL="$API_URL"

# APK location
APK_PATH="build/app/outputs/flutter-apk/app-release.apk"

if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ APK built successfully!"
    echo "📱 APK location: $APK_PATH"
    echo ""
    echo "📲 To install on your phone:"
    echo "   1. Transfer the APK to your phone"
    echo "   2. Enable 'Install from unknown sources' in Android settings"
    echo "   3. Open the APK file and install"
    echo ""
    echo "💡 Or use ADB to install directly:"
    echo "   adb install $APK_PATH"
else
    echo "❌ APK build failed. Check the error messages above."
    exit 1
fi

