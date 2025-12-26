# Build APK für OnSite Handwerker App

Diese Anleitung zeigt, wie du eine APK-Datei für die Installation auf deinem Android-Handy erstellst.

## Voraussetzungen

1. **Flutter SDK installiert**
   - Download: https://flutter.dev/docs/get-started/install
   - Version: Flutter 3.0 oder höher
   - Prüfen: `flutter doctor`

2. **Android SDK installiert**
   - Android Studio installieren
   - Android SDK Platform-Tools installieren
   - Prüfen: `flutter doctor` sollte keine Android-Fehler zeigen

3. **Java JDK**
   - JDK 8 oder höher
   - Prüfen: `java -version`

## Schnellstart

### Windows
```bash
cd mobile
build_apk.bat
```

### Linux/Mac
```bash
cd mobile
chmod +x build_apk.sh
./build_apk.sh
```

## Manueller Build

### 1. Dependencies installieren
```bash
cd mobile
flutter pub get
```

### 2. APK bauen
```bash
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU \
  --dart-define=API_URL=https://hw.sata26.cloud/api
```

### 3. APK finden
Die APK wird erstellt unter:
```
mobile/build/app/outputs/flutter-apk/app-release.apk
```

## APK auf dem Handy installieren

### Option 1: USB-Transfer
1. APK-Datei auf dein Handy kopieren (USB, E-Mail, Cloud, etc.)
2. Auf dem Handy: **Einstellungen** > **Sicherheit** > **Unbekannte Quellen** aktivieren
3. APK-Datei öffnen und installieren

### Option 2: ADB (Android Debug Bridge)
```bash
# Handy per USB verbinden
adb devices

# APK installieren
adb install mobile/build/app/outputs/flutter-apk/app-release.apk
```

### Option 3: QR-Code (empfohlen)
1. APK auf einen Webserver hochladen
2. QR-Code generieren (z.B. mit https://qr-code-generator.com)
3. QR-Code mit dem Handy scannen
4. APK herunterladen und installieren

## Environment-Variablen anpassen

Falls du andere URLs verwenden möchtest, bearbeite die Build-Scripts:

**Windows (`build_apk.bat`):**
```batch
set SUPABASE_URL=https://deine-supabase-url.supabase.co
set SUPABASE_ANON_KEY=dein-supabase-key
set API_URL=https://deine-api-url.com/api
```

**Linux/Mac (`build_apk.sh`):**
```bash
SUPABASE_URL="https://deine-supabase-url.supabase.co"
SUPABASE_ANON_KEY="dein-supabase-key"
API_URL="https://deine-api-url.com/api"
```

## Build-Optionen

### Split APKs (kleinere Dateigröße)
```bash
flutter build apk --split-per-abi --release \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=API_URL=...
```

Erstellt separate APKs für:
- `app-armeabi-v7a-release.apk` (32-bit)
- `app-arm64-v8a-release.apk` (64-bit)
- `app-x86_64-release.apk` (x86_64)

### App Bundle (für Google Play Store)
```bash
flutter build appbundle --release \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=API_URL=...
```

## Troubleshooting

### Fehler: "Flutter SDK not found"
- Stelle sicher, dass Flutter im PATH ist
- Prüfe: `flutter doctor`

### Fehler: "Gradle build failed"
- Android SDK installieren
- `flutter clean` ausführen
- `flutter pub get` erneut ausführen

### Fehler: "No devices found" (bei ADB)
- USB-Debugging auf dem Handy aktivieren
- USB-Treiber installieren
- `adb devices` sollte das Handy anzeigen

### APK installiert nicht
- "Unbekannte Quellen" in Android-Einstellungen aktivieren
- Prüfe, ob genug Speicherplatz vorhanden ist
- Versuche eine neuere Android-Version (min. Android 5.0 / API 21)

## Version aktualisieren

Um die App-Version zu ändern, bearbeite `mobile/pubspec.yaml`:

```yaml
version: 1.0.1+2  # Version: 1.0.1, Build: 2
```

Dann neu bauen:
```bash
flutter build apk --release ...
```

## Produktions-Build

Für einen signierten Release-Build (für Google Play Store):

1. **Keystore erstellen:**
```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

2. **`android/key.properties` erstellen:**
```properties
storePassword=<password>
keyPassword=<password>
keyAlias=upload
storeFile=<path-to-keystore>
```

3. **`android/app/build.gradle` anpassen** (Signing Config hinzufügen)

4. **Build:**
```bash
flutter build appbundle --release ...
```

## Support

Bei Problemen:
1. Prüfe `flutter doctor` für Setup-Probleme
2. Prüfe die Build-Logs für Fehlerdetails
3. Stelle sicher, dass alle Environment-Variablen korrekt sind

