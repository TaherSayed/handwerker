Write-Host "Starting Flutter app with Supabase configuration..." -ForegroundColor Green
Write-Host "Using fixed port: 8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Make sure http://localhost:8080/** is added to Supabase Redirect URLs!" -ForegroundColor Yellow
Write-Host ""
flutter run --dart-define-from-file=env.json --web-port=8080

