# OnSite Forms - Quick Start (5 Minutes)

Get up and running in 5 minutes! ⚡

## Prerequisites

- Node.js 20+
- Supabase account
- Git

## 1. Install Dependencies (1 min)

```bash
# Clone and install
git clone <your-repo>
cd onsite-forms
npm run install:all
```

## 2. Create Supabase Project (2 min)

1. Go to https://supabase.com → New Project
2. Wait for provisioning (1-2 min)
3. Copy your project URL and keys from Settings → API

## 3. Run Database Migration (30 sec)

1. In Supabase dashboard → SQL Editor
2. Copy/paste content from `supabase/migrations/20251223_onsite_complete_schema.sql`
3. Click "Run"

## 4. Configure Environment (1 min)

### Backend
```bash
cd server
cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGIN=http://localhost:5173
EOF
```

### Web Client
```bash
cd ../client
cat > .env << 'EOF'
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000/api
EOF
```

Replace `your_supabase_*` with actual values from Supabase dashboard.

## 5. Enable Google OAuth (30 sec)

1. Supabase dashboard → Authentication → Providers
2. Enable Google
3. For now, use default credentials (or add your own)

## 6. Start Development Servers (30 sec)

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Web Client:**
```bash
npm run dev:client
```

## 7. Open and Test! 🎉

Open browser: http://localhost:5173

You should see:
1. Sign in with Google button
2. Click it (may need to setup OAuth properly)
3. See Dashboard

## First Steps

### Create Your First Template

1. Click "Templates" in sidebar
2. Click "New Template"
3. Name it "Site Inspection"
4. Add fields:
   - Text: "Site Name"
   - Date: "Inspection Date"
   - Dropdown: "Status" (Good, Fair, Poor)
   - Notes: "Comments"
   - Photo: "Site Photo"
5. Click "Save Template"

### Test Submissions

Since mobile takes longer to setup, you can test the API directly:

```bash
# Get your access token from browser DevTools:
# Application → Local Storage → Copy 'sb-xxxxx-auth-token'

# Create a submission
curl -X POST http://localhost:3000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "YOUR_TEMPLATE_ID",
    "customer_name": "Test Customer",
    "field_values": {
      "field_xxx": "Test Value"
    },
    "status": "submitted"
  }'
```

## Mobile App Setup (Optional)

If you want to test the mobile app:

```bash
cd mobile
flutter pub get

# Run on emulator/device
flutter run \
  --dart-define=SUPABASE_URL=your_url \
  --dart-define=SUPABASE_ANON_KEY=your_key \
  --dart-define=API_URL=http://10.0.2.2:3000/api
```

Note: Use `10.0.2.2` for Android emulator (points to host machine)

## Troubleshooting

### Backend won't start
```bash
# Check if .env exists
ls server/.env

# Check port
lsof -i :3000
```

### Web client blank screen
- Check browser console (F12)
- Verify API is running
- Check environment variables

### Can't sign in
- Verify Supabase URL and keys
- Check Google OAuth is enabled
- Clear browser cache

### CORS errors
- Verify CORS_ORIGIN in backend .env
- Should match web client URL

## What's Next?

✅ You now have a working OnSite Forms platform!

**Learn more:**
- Read `README.md` for full features
- See `PROJECT_STRUCTURE.md` for architecture
- Follow `DEPLOYMENT.md` to go live

**Customize:**
- Add more field types
- Customize theme
- Add your company branding

**Deploy:**
- Backend: Docker/Coolify/Node.js
- Web: Vercel/Netlify/Static host
- Mobile: Build APK/IPA and distribute

## Quick Tips

💡 **Templates**: Create reusable forms in the web admin
💡 **Submissions**: Fill forms on mobile (or via API)
💡 **PDFs**: Auto-generate professional PDFs from submissions
💡 **Offline**: Mobile app works offline, syncs when online
💡 **Security**: All data isolated by user (RLS)

## Need Help?

1. Check logs in terminals
2. Review Supabase dashboard for database issues
3. Read full documentation in README.md
4. Check PROJECT_STRUCTURE.md for architecture

---

**You're ready to build! 🚀**

Create templates → Fill forms → Generate PDFs → Ship it!

