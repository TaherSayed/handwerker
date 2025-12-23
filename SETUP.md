# OnSite Forms - Complete Setup Guide

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd onsite-forms

# Install all dependencies
npm run install:all
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database to be provisioned
3. Go to **SQL Editor** and run migrations:
   - Run `supabase/migrations/20251223_onsite_complete_schema.sql`
4. Go to **Authentication** → **Providers** → Enable **Google**
   - Add OAuth credentials from Google Cloud Console
   - Add redirect URL: `http://localhost:5173`
5. Go to **Storage** → Create buckets (if not auto-created):
   - `submission-photos` (private)
   - `submission-pdfs` (private)
   - `company-logos` (private)

### 3. Configure Backend

```bash
cd server
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```bash
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
CORS_ORIGIN=http://localhost:5173
```

### 4. Configure Web Client

```bash
cd ../client
cp .env.example .env
```

Edit `.env`:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:3000/api
```

### 5. Run Development Servers

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Web Client:
```bash
npm run dev:client
```

Open browser: `http://localhost:5173`

### 6. Mobile App Setup

```bash
cd mobile
flutter pub get
```

Create `mobile/.env`:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
API_URL=http://10.0.2.2:3000/api  # Android emulator
# or
API_URL=http://localhost:3000/api  # iOS simulator
```

Run:
```bash
flutter run \
  --dart-define=SUPABASE_URL=$SUPABASE_URL \
  --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --dart-define=API_URL=$API_URL
```

## Detailed Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized redirect URIs:
   - `https://xxxxx.supabase.co/auth/v1/callback`
   - `http://localhost:5173` (development)
6. Copy Client ID and Client Secret
7. Add to Supabase:
   - Go to **Authentication** → **Providers** → **Google**
   - Paste Client ID and Client Secret
   - Save

### Database Schema Verification

Run this query in Supabase SQL Editor to verify tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should see:
- user_profiles
- workspaces
- form_templates
- submissions
- submission_photos

### Storage Buckets Verification

Run this query to verify buckets:
```sql
SELECT id, name, public 
FROM storage.buckets;
```

Should see:
- submission-photos (false)
- submission-pdfs (false)
- company-logos (false)

### RLS Verification

Run this query to check policies:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Should see multiple policies for each table.

## Testing the Setup

### 1. Test Web Admin

1. Open `http://localhost:5173`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Should see Dashboard

### 2. Create Template

1. Go to Templates
2. Click "New Template"
3. Add template name: "Test Form"
4. Add fields (text, number, etc.)
5. Save

### 3. Test Mobile App

1. Run mobile app
2. Sign in with Google
3. Click "New Submission"
4. Select "Test Form"
5. Fill fields
6. Save as draft
7. Submit

### 4. Verify Submission

1. Go to web admin
2. Click "Submissions"
3. Should see test submission
4. Click "Generate PDF"
5. PDF should download

## Common Issues

### Backend won't start
- Check `.env` file exists in `server/`
- Verify Supabase credentials
- Check port 3000 is not in use: `lsof -i :3000`

### Web client won't connect
- Verify API is running on port 3000
- Check CORS settings in backend
- Check browser console for errors

### Mobile app can't connect
- Android emulator: use `10.0.2.2` instead of `localhost`
- iOS simulator: can use `localhost`
- Real device: use computer's local IP
- Check firewall allows connections

### OAuth not working
- Verify redirect URIs in Google Cloud Console
- Check Supabase OAuth configuration
- Clear browser cache/cookies

### RLS errors
- Verify user is authenticated
- Check RLS policies in Supabase
- Look at Supabase logs in dashboard

## Development Tips

### Hot Reload

- Backend: Uses `tsx watch` for hot reload
- Web: Vite provides instant HMR
- Mobile: Flutter hot reload with `r` in terminal

### Database Changes

After changing schema:
1. Create new migration file
2. Run in Supabase SQL Editor
3. Update backend types if needed

### API Testing

Use curl or Postman:
```bash
# Get access token from browser devtools
TOKEN="your_token"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/user/me
```

### Debugging

Backend:
```bash
cd server
npm run dev  # Shows logs in terminal
```

Mobile:
```bash
flutter run --verbose
flutter logs
```

## Next Steps

1. ✅ Basic setup complete
2. Customize company branding
3. Create form templates
4. Test offline functionality
5. Generate PDFs
6. Deploy to production (see DEPLOYMENT.md)

## Support

- Check logs in respective folders
- Review Supabase dashboard for database issues
- Check GitHub issues
- Read API documentation in code comments

## Architecture Overview

```
┌─────────────────┐
│  Mobile App     │
│  (Flutter)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Web Admin      │─────▶│  Backend API │
│  (React)        │      │  (Node.js)   │
└─────────────────┘      └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Supabase   │
                         │ - Database   │
                         │ - Auth       │
                         │ - Storage    │
                         └──────────────┘
```

## Feature Checklist

- [x] Google OAuth login
- [x] Form template builder
- [x] Drag & drop fields
- [x] 10 field types
- [x] Mobile form filling
- [x] Offline drafts
- [x] Auto-save
- [x] Photo capture
- [x] Signature capture
- [x] PDF generation
- [x] Secure storage
- [x] Row-level security

Ready to build forms! 🚀

