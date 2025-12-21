Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting OnSite App with FIXED PORT 8080" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Make sure http://localhost:8080/** is added to Supabase Redirect URLs!" -ForegroundColor Yellow
Write-Host ""

# Stop any existing Flutter processes
Write-Host "Stopping any existing Flutter processes..." -ForegroundColor Gray
Get-Process -Name dart -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name flutter -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting Flutter app on port 8080..." -ForegroundColor Green
Write-Host ""

flutter run --dart-define-from-file=env.json --web-port=8080

