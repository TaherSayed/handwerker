@echo off
echo Starting Flutter app with Supabase configuration...
echo Using fixed port: 8080
echo.
echo IMPORTANT: Make sure http://localhost:8080/** is added to Supabase Redirect URLs!
echo.
flutter run --dart-define-from-file=env.json --web-port=8080
pause

