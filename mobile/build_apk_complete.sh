#!/bin/bash
# Complete APK Build Script for OnSite Forms
# Builds a release APK with all field types support

set -e

echo "🚀 OnSite Forms - APK Build"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to mobile directory
cd "$(dirname "$0")"

# Check Flutter
echo -e "${BLUE}📋 Checking Flutter installation...${NC}"
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}❌ Flutter is not installed${NC}"
    echo "Please install Flutter: https://flutter.dev/docs/get-started/install"
    exit 1
fi

echo -e "${GREEN}✅ Flutter found${NC}"
flutter --version
echo ""

# Show app info
echo -e "${BLUE}📱 App Information${NC}"
echo "  Name: OnSite Forms"
echo "  Package: com.onsite.forms"
echo "  Version: 1.0.0+1"
echo "  Min SDK: 21 (Android 5.0)"
echo "  Target SDK: 34 (Android 14)"
echo ""

# Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
flutter clean
echo -e "${GREEN}✅ Clean complete${NC}"
echo ""

# Get dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
flutter pub get
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Analyze code
echo -e "${BLUE}🔍 Analyzing code...${NC}"
flutter analyze lib/widgets/form_field_widget.dart lib/models/form_template.dart 2>&1 | head -20
echo ""

# Build APK
echo -e "${BLUE}🔨 Building APK (Release)...${NC}"
echo "This may take 5-10 minutes on first build..."
echo ""

flutter build apk --release

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ APK BUILD SUCCESSFUL!${NC}"
    echo ""
    
    # Show APK details
    APK_PATH="build/app/outputs/flutter-apk/app-release.apk"
    
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
        echo -e "${GREEN}📦 APK Details:${NC}"
        echo "  Location: $APK_PATH"
        echo "  Size: $APK_SIZE"
        echo "  Type: Release (signed with debug key)"
        echo ""
        
        # Calculate hash
        if command -v md5sum &> /dev/null; then
            APK_HASH=$(md5sum "$APK_PATH" | awk '{print $1}')
            echo "  MD5: $APK_HASH"
        fi
        
        echo ""
        echo -e "${BLUE}📲 Installation Options:${NC}"
        echo ""
        echo "Option 1: Install on connected device"
        echo "  $ flutter install"
        echo ""
        echo "Option 2: Manual installation"
        echo "  1. Copy APK to your phone: $APK_PATH"
        echo "  2. Open the APK file on your phone"
        echo "  3. Allow installation from unknown sources if prompted"
        echo "  4. Install and open the app"
        echo ""
        echo "Option 3: ADB install"
        echo "  $ adb install $APK_PATH"
        echo ""
        
        # Offer to install
        echo -e "${YELLOW}Would you like to install on a connected device now? [y/N]${NC}"
        read -r -t 10 response || response="n"
        
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo ""
            echo -e "${BLUE}📲 Installing on device...${NC}"
            flutter install
            echo -e "${GREEN}✅ Installation complete!${NC}"
        else
            echo ""
            echo -e "${YELLOW}Skipping installation${NC}"
        fi
        
    else
        echo -e "${RED}❌ APK file not found at expected location${NC}"
        exit 1
    fi
    
else
    echo ""
    echo -e "${RED}❌ APK BUILD FAILED${NC}"
    echo "Please check the error messages above"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Build process complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Test the APK on a device"
echo "  2. Verify all 25+ field types work"
echo "  3. Test photo upload and signature features"
echo "  4. If everything works, prepare for production release"
echo ""
echo "📚 For production release (Google Play):"
echo "  1. Create a keystore: keytool -genkey -v -keystore ~/key.jks ..."
echo "  2. Update android/app/build.gradle with release signing config"
echo "  3. Build with: flutter build apk --release"
echo "  4. Upload to Google Play Console"
echo ""
echo -e "${GREEN}✨ Happy Testing!${NC}"
