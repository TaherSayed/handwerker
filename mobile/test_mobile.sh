#!/bin/bash
# Mobile App Testing Script
# This script helps test the mobile app with all field types

set -e

echo "🧪 Mobile App Field Types Testing"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}❌ Flutter is not installed${NC}"
    echo "Please install Flutter: https://flutter.dev/docs/get-started/install"
    exit 1
fi

echo -e "${GREEN}✅ Flutter detected${NC}"
flutter --version
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")"

echo -e "${BLUE}📦 Step 1: Clean and get dependencies${NC}"
echo "--------------------------------------"
flutter clean
flutter pub get
echo ""

echo -e "${BLUE}📝 Step 2: Analyze code${NC}"
echo "------------------------"
flutter analyze lib/widgets/form_field_widget.dart lib/models/form_template.dart
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ No analysis issues found${NC}"
else
    echo -e "${YELLOW}⚠️  Some issues found, but continuing...${NC}"
fi
echo ""

echo -e "${BLUE}🔨 Step 3: Build options${NC}"
echo "------------------------"
echo "Choose what you want to do:"
echo "  1) Run on connected device (debug mode)"
echo "  2) Run on Android emulator"
echo "  3) Run on iOS simulator (macOS only)"
echo "  4) Build APK (Android release)"
echo "  5) Build iOS (macOS only)"
echo "  6) Just test compilation"
echo "  7) Skip build"
echo ""

read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Running on connected device...${NC}"
        flutter run
        ;;
    2)
        echo -e "${BLUE}🚀 Running on Android emulator...${NC}"
        flutter emulators --launch "Pixel_4_API_30" 2>/dev/null || flutter emulators --launch "$(flutter emulators | grep android | head -1 | awk '{print $1}')"
        sleep 5
        flutter run
        ;;
    3)
        echo -e "${BLUE}🚀 Running on iOS simulator...${NC}"
        open -a Simulator
        sleep 5
        flutter run
        ;;
    4)
        echo -e "${BLUE}🔨 Building APK...${NC}"
        flutter build apk --release
        echo -e "${GREEN}✅ APK built: build/app/outputs/flutter-apk/app-release.apk${NC}"
        ;;
    5)
        echo -e "${BLUE}🔨 Building iOS...${NC}"
        flutter build ios --release
        echo -e "${GREEN}✅ iOS build complete${NC}"
        ;;
    6)
        echo -e "${BLUE}🧪 Testing compilation...${NC}"
        flutter build apk --debug
        echo -e "${GREEN}✅ Compilation successful${NC}"
        ;;
    7)
        echo -e "${YELLOW}⏭️  Skipping build${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Testing Guide${NC}"
echo "=================="
echo ""
echo "📋 Test Checklist:"
echo "  ✓ Section headers display correctly"
echo "  ✓ Full name field has person icon"
echo "  ✓ Email field has email icon and validation"
echo "  ✓ Phone field has phone keyboard"
echo "  ✓ Radio buttons allow single selection"
echo "  ✓ Star rating shows 5 stars"
echo "  ✓ Scale rating shows slider 1-10"
echo "  ✓ Time picker opens correctly"
echo "  ✓ Photo upload works (camera/gallery)"
echo "  ✓ Signature pad allows drawing"
echo "  ✓ Dividers show horizontal lines"
echo "  ✓ All required field validation works"
echo ""
echo "📱 To test:"
echo "  1. Sign in to the app"
echo "  2. Go to 'New Submission'"
echo "  3. Select 'Comprehensive Field Test' template"
echo "  4. Verify all field types display correctly"
echo "  5. Try filling out each field"
echo "  6. Test validation (try submitting without required fields)"
echo ""
echo -e "${GREEN}🎉 Happy Testing!${NC}"
