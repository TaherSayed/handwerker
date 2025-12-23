# OnSite Forms Mobile App

Flutter mobile application for OnSite Forms platform.

## Features

- Google OAuth authentication
- Form template selection
- Offline-first form filling
- Draft auto-save
- Background sync
- Photo capture
- Signature capture
- PDF generation

## Setup

1. Install Flutter SDK (3.0.0+)
2. Run `flutter pub get`
3. Configure environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - API_URL

## Run

```bash
flutter run --dart-define=SUPABASE_URL=your_url \
            --dart-define=SUPABASE_ANON_KEY=your_key \
            --dart-define=API_URL=your_api_url
```

## Build

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## Project Structure

```
lib/
  ├── main.dart
  ├── config/
  │   └── theme.dart
  ├── models/
  │   ├── form_template.dart
  │   └── submission.dart
  ├── providers/
  │   ├── auth_provider.dart
  │   ├── templates_provider.dart
  │   └── submissions_provider.dart
  ├── screens/
  │   ├── auth/
  │   ├── home/
  │   ├── templates/
  │   ├── form/
  │   └── submissions/
  ├── services/
  │   ├── api_service.dart
  │   └── local_storage_service.dart
  └── widgets/
      └── form_field_widget.dart
```

