# 🔧 Fixing Dart/Flutter Process Crashes

## 🔴 Problem

Multiple Dart/Flutter processes are crashing:
- Dart Tooling Daemon (DTD) terminated with code 1
- Dart DevTools exited with code 1
- Analysis server exited with code 1
- Flutter Daemon terminated

## ✅ Quick Fix

Run the fix script:
```bash
.\FIX_DART_CRASHES.bat
```

Then **restart VS Code/Cursor** to clear language server issues.

## 🔍 Root Causes

These crashes typically occur due to:

1. **Corrupted Cache Files**
   - Pub cache corruption
   - Flutter build cache issues
   - Analysis server cache problems

2. **File Locking Issues**
   - VS Code/Cursor holding files open
   - Browser processes locking directories
   - Multiple Flutter instances running

3. **Extension Conflicts**
   - Dart/Flutter extension issues
   - Language server conflicts
   - DevTools connection problems

## 🛠️ Manual Fix Steps

If the script doesn't work, follow these steps manually:

### Step 1: Kill All Processes
```powershell
taskkill /F /IM dart.exe
taskkill /F /IM flutter.exe
taskkill /F /IM chrome.exe
taskkill /F /IM msedge.exe
```

### Step 2: Clean Flutter
```bash
flutter clean
```

### Step 3: Clear Pub Cache
```powershell
Remove-Item -Path "$env:APPDATA\Pub\Cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\Pub\Cache" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 4: Repair Cache
```bash
flutter pub cache repair
```

### Step 5: Refresh Dependencies
```bash
flutter pub get
```

### Step 6: Restart IDE
**IMPORTANT:** Close and restart VS Code/Cursor completely to reset the language server.

## 🚀 Prevention

1. **Always use the batch file** (`START_APP_FIXED_PORT.bat`) to start the app
   - It properly kills processes before starting
   - It cleans problematic directories

2. **Close browser tabs** before stopping Flutter
   - Prevents file locking issues

3. **Don't run multiple Flutter instances**
   - Only one `flutter run` at a time

4. **Regular maintenance**
   - Run `FIX_DART_CRASHES.bat` weekly or when issues occur
   - Keep Flutter SDK updated: `flutter upgrade`

## 📝 If Nothing Works

1. **Restart your computer**
   - Clears all file locks and process issues

2. **Reinstall Flutter SDK**
   ```bash
   # Backup your project first!
   flutter doctor -v  # Check current installation
   # Then reinstall Flutter from https://flutter.dev/docs/get-started/install
   ```

3. **Check VS Code/Cursor Extensions**
   - Disable other Dart/Flutter extensions
   - Reinstall Dart/Flutter extension
   - Check for extension conflicts

## ✅ Verification

After fixing, verify everything works:

```bash
flutter doctor -v
flutter pub get
flutter run --dart-define-from-file=env.json --web-port=8080
```

The app should start without crashes!

