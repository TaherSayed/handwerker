# How to Run the App

## Quick Start

Always run the app with the environment file to load Supabase credentials:

```bash
flutter run --dart-define-from-file=env.json
```

## Available Devices

When prompted, choose:
- `1` for Chrome
- `2` for Edge

## Alternative: Specify Device Directly

```bash
# Run on Chrome
flutter run -d chrome --dart-define-from-file=env.json

# Run on Edge  
flutter run -d edge --dart-define-from-file=env.json

# Run on Windows
flutter run -d windows --dart-define-from-file=env.json
```

## Build for Production

```bash
# Web
flutter build web --dart-define-from-file=env.json

# Windows
flutter build windows --dart-define-from-file=env.json

# Android APK
flutter build apk --dart-define-from-file=env.json
```

## Troubleshooting

If you see "Supabase credentials not configured":
- Make sure you're using the `--dart-define-from-file=env.json` flag
- Verify that `env.json` exists in the project root
- Check that `env.json` contains valid Supabase credentials

