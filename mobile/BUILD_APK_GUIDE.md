# 📱 Building APK for OnSite Forms

## Quick Build (Automated)

### Option 1: Use the Build Script (Recommended)
```bash
cd mobile
./build_apk_complete.sh
```

This script will:
- ✅ Check Flutter installation
- ✅ Clean previous builds
- ✅ Install dependencies
- ✅ Analyze code
- ✅ Build release APK
- ✅ Show APK location and size
- ✅ Offer to install on device

---

## Manual Build (Step by Step)

### Step 1: Prepare Environment
```bash
cd mobile

# Check Flutter is installed
flutter --version

# Should show Flutter 3.x or higher
```

### Step 2: Clean and Get Dependencies
```bash
# Clean previous builds
flutter clean

# Get all dependencies
flutter pub get
```

### Step 3: Build APK
```bash
# Build release APK (signed with debug key)
flutter build apk --release
```

**Build time:** 5-10 minutes (first build), 2-3 minutes (subsequent builds)

### Step 4: Locate APK
```bash
# APK location
ls -lh build/app/outputs/flutter-apk/app-release.apk
```

---

## Installation Methods

### Method 1: Install via Flutter (Connected Device)
```bash
# Connect Android device via USB
# Enable USB debugging on device
# Run:
flutter install
```

### Method 2: Install via ADB
```bash
# Connect device via USB
adb devices  # Verify device is connected
adb install build/app/outputs/flutter-apk/app-release.apk
```

### Method 3: Manual Installation
1. Copy `build/app/outputs/flutter-apk/app-release.apk` to your phone
2. Open the APK file on your phone
3. Allow installation from unknown sources (if prompted)
4. Install and open the app

### Method 4: Share via Cloud
```bash
# Upload to Google Drive, Dropbox, etc.
# Share link with testers
# They download and install on their devices
```

---

## Build Types

### Debug APK (For Testing)
```bash
flutter build apk --debug
# APK: build/app/outputs/flutter-apk/app-debug.apk
# Size: ~50-60 MB (larger, includes debug symbols)
```

### Release APK (For Distribution)
```bash
flutter build apk --release
# APK: build/app/outputs/flutter-apk/app-release.apk
# Size: ~20-30 MB (smaller, optimized)
```

### Split APKs (Smaller size per architecture)
```bash
flutter build apk --split-per-abi
# Creates separate APKs for different CPU architectures:
# - app-armeabi-v7a-release.apk (32-bit ARM)
# - app-arm64-v8a-release.apk (64-bit ARM)
# - app-x86_64-release.apk (64-bit Intel)
```

---

## App Information

- **App Name:** OnSite Forms
- **Package ID:** com.onsite.forms
- **Version:** 1.0.0 (Build 1)
- **Min Android:** 5.0 (API 21)
- **Target Android:** 14 (API 34)
- **Features:**
  - ✅ All 25+ field types
  - ✅ Photo upload (camera/gallery)
  - ✅ Signature pad
  - ✅ Offline support
  - ✅ Data sync

---

## Troubleshooting

### Error: "Flutter SDK not found"
```bash
# Verify Flutter is in PATH
which flutter

# If not found, install Flutter:
# https://flutter.dev/docs/get-started/install
```

### Error: "Gradle build failed"
```bash
# Clean and retry
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk --release
```

### Error: "minSdkVersion X cannot be smaller than version Y"
Edit `android/app/build.gradle`:
```gradle
defaultConfig {
    minSdkVersion 21  // Change to required version
}
```

### Error: "Package conflicts" or "Dependency issues"
```bash
# Clear pub cache
flutter pub cache repair
flutter pub get
```

### Build is Very Slow
```bash
# Use split APKs (faster build)
flutter build apk --split-per-abi

# Or increase Gradle memory
export GRADLE_OPTS="-Xmx4g -XX:MaxPermSize=2048m"
```

---

## Testing the APK

### After Installation, Verify:

1. **App Opens:** Launch OnSite Forms app
2. **Sign In:** Test authentication
3. **Create Template:** Navigate to templates
4. **All Field Types:** Check all 25+ types display
5. **Photo Upload:** Test camera and gallery
6. **Signature:** Test drawing signature
7. **Form Submission:** Fill and submit a form
8. **Offline Mode:** Test with airplane mode
9. **Data Sync:** Reconnect and verify sync

### Test Checklist:
- [ ] App launches successfully
- [ ] No crashes on startup
- [ ] Can sign in with Google
- [ ] Templates load correctly
- [ ] All field types visible
- [ ] Photo upload works (camera)
- [ ] Photo upload works (gallery)
- [ ] Signature pad works
- [ ] Forms can be filled
- [ ] Forms can be submitted
- [ ] Drafts save correctly
- [ ] Offline mode works
- [ ] Data syncs when online

---

## Production Release (Google Play)

For production release with proper signing:

### Step 1: Create Keystore
```bash
keytool -genkey -v -keystore ~/onsite-forms-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias onsite-forms
```

Save the keystore password and alias securely!

### Step 2: Configure Signing
Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=onsite-forms
storeFile=/path/to/onsite-forms-key.jks
```

### Step 3: Update build.gradle
Edit `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 4: Build Production APK
```bash
flutter build apk --release
```

### Step 5: Upload to Google Play
1. Go to Google Play Console
2. Create new app
3. Upload APK
4. Fill in store listing
5. Submit for review

---

## Build Variants

### Development Build (Debug)
- Use: Testing and development
- Size: Larger (~50MB)
- Performance: Slower
- Debug info: Included
- Build command: `flutter build apk --debug`

### Release Build (Production)
- Use: Distribution to users
- Size: Smaller (~20MB)
- Performance: Optimized
- Debug info: Stripped
- Build command: `flutter build apk --release`

### Profile Build (Performance Testing)
- Use: Performance profiling
- Size: Medium
- Performance: Optimized
- Debug info: Some included
- Build command: `flutter build apk --profile`

---

## Quick Reference

```bash
# Clean build
flutter clean && flutter pub get

# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# Split APKs (per architecture)
flutter build apk --split-per-abi

# Install on device
flutter install

# Check APK details
ls -lh build/app/outputs/flutter-apk/
```

---

## File Sizes (Approximate)

- **Debug APK:** ~50-60 MB
- **Release APK:** ~20-30 MB
- **Split APK (arm64):** ~15-20 MB
- **Split APK (armv7):** ~15-20 MB
- **Split APK (x86_64):** ~15-20 MB

---

## Support

### Build Issues?
1. Run `flutter doctor` to check setup
2. Clean build: `flutter clean`
3. Update Flutter: `flutter upgrade`
4. Check `BUILD_APK_GUIDE.md` troubleshooting section

### APK Won't Install?
1. Enable "Unknown sources" on device
2. Verify APK isn't corrupted (check file size)
3. Try ADB install method
4. Check device has enough storage

### App Crashes?
1. Check device meets minimum requirements (Android 5.0+)
2. Clear app data and reinstall
3. Check device logs: `adb logcat`

---

**Ready to build? Run: `./build_apk_complete.sh`**
