# Quick Start Guide

## ⚠️ Important: Always Use Environment Variables

The app **requires** Supabase credentials to function. Always run with:

```bash
flutter run --dart-define-from-file=env.json
```

## 🚀 Running the App

### Development (with hot reload)
```bash
flutter run --dart-define-from-file=env.json
```

### Choose Device
When prompted, select:
- `1` for Chrome
- `2` for Edge  
- Or specify directly: `flutter run -d chrome --dart-define-from-file=env.json`

### Production Builds
```bash
# Web
flutter build web --dart-define-from-file=env.json

# Windows
flutter build windows --dart-define-from-file=env.json

# Android APK
flutter build apk --dart-define-from-file=env.json
```

## ✅ What's Fixed

1. **App no longer crashes** when run without environment variables
2. **Login system** works with email/password
3. **Google Sign-In** works on mobile (needs GOOGLE_WEB_CLIENT_ID)
4. **Error handling** improved throughout

## 🔐 Test Accounts (After Migration)

After running the database migration in Supabase:

- **Craftsman**: `max@mustermann.de` / `handwerk123`
- **Manager**: `lisa@schmidt.de` / `manager123`

## 📝 Current Status

- ✅ Email/Password Login: **Working**
- ✅ Email/Password Sign-Up: **Working**  
- ✅ Google Sign-In: **Configured** (needs GOOGLE_WEB_CLIENT_ID for full functionality)
- ✅ Error Handling: **Improved**
- ✅ App Stability: **No crashes**

## 🐛 Troubleshooting

### "Supabase credentials not configured"
**Solution**: Always use `--dart-define-from-file=env.json` flag

### "Supabase is not configured" error
**Solution**: The app will now show a helpful message instead of crashing. Make sure to:
1. Check that `env.json` exists in project root
2. Verify it contains valid Supabase credentials
3. Run with the correct command

### Login not working
**Solution**: 
1. Verify Supabase migration has been run
2. Check Supabase dashboard for any errors
3. Ensure network connection is active

