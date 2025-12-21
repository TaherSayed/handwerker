# 🔄 Update Google OAuth for New Supabase Project

## ⚠️ Important: You've Changed Supabase Projects!

**Old Project:** `qlqvczcgjymyrfarvsgu.supabase.co`  
**New Project:** `bscpnmhkzadrxbpseext.supabase.co`

If you're switching Supabase projects, you **MUST** update the Google OAuth configuration!

---

## Step 1: Update Google Cloud Console Redirect URIs

1. Go to: **https://console.cloud.google.com/**
2. Select project: **OnSite**
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID: `514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr`

5. **Update Authorized JavaScript origins:**
   - Remove old: `https://qlqvczcgjymyrfarvsgu.supabase.co`
   - Add new: `https://bscpnmhkzadrxbpseext.supabase.co`

6. **Update Authorized redirect URIs:**
   - Remove old: `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`
   - Add new: `https://bscpnmhkzadrxbpseext.supabase.co/auth/v1/callback`

7. Click **"Save"**

---

## Step 2: Configure Google OAuth in New Supabase Project

1. Go to: **https://app.supabase.com/**
2. Select project: **bscpnmhkzadrxbpseext**
3. Navigate to: **Authentication** → **Providers**
4. Click on **"Google"**

5. **Configure:**
   - **Enabled:** Toggle ON
   - **Client ID (Web):** `514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com`
   - **Client Secret:** Get from Google Cloud Console (starts with `GOCSPX-`)

6. Click **"Save"**

---

## Step 3: Configure Redirect URLs in New Supabase Project

1. In Supabase Dashboard: **Authentication** → **URL Configuration**

2. **Site URL:**
   ```
   http://localhost:8080
   ```

3. **Redirect URLs:** Add:
   ```
   http://localhost:8080/**
   http://localhost:8080
   ```

4. Click **"Save"**

---

## Step 4: Verify env.json

Your `env.json` should now have:
```json
{
  "SUPABASE_URL": "https://bscpnmhkzadrxbpseext.supabase.co",
  "SUPABASE_ANON_KEY": "sb_publishable_6UkgRfurHnGN4qM7FaZmlQ_IxfTaSv4",
  "GOOGLE_WEB_CLIENT_ID": "514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com"
}
```

✅ Already updated!

---

## Step 5: Restart App

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart Flutter app:**
   ```bash
   .\START_APP_FIXED_PORT.bat
   ```
3. **Wait 5-10 minutes** for Google changes to propagate
4. **Try Google Sign-In again**

---

## ⚠️ Important Notes

### About the Key Format

The key you provided (`sb_publishable_...`) looks like it might be from Expo or a different format. 

**Standard Supabase anon key** is a JWT token (long string starting with `eyJ...`).

**If Google OAuth still doesn't work**, you might need to:
1. Get the **anon/public key** from Supabase Dashboard → Settings → API
2. It should be under **"Project API keys"** → **"anon"** or **"public"**
3. Replace the key in `env.json` with the JWT format key

---

## ✅ Checklist

- [ ] Updated Google Cloud Console redirect URIs to new Supabase project
- [ ] Configured Google OAuth in new Supabase project (Client ID + Secret)
- [ ] Configured redirect URLs in new Supabase project
- [ ] Updated `env.json` with new credentials
- [ ] Waited 5-10 minutes for changes to propagate
- [ ] Cleared browser cache
- [ ] Restarted Flutter app
- [ ] Tested Google Sign-In

---

## 🆘 Still Having Issues?

If you're still getting "invalid_client" error:

1. **Verify the Client Secret** in Supabase matches Google Cloud Console
2. **Check that Google provider is ENABLED** in new Supabase project
3. **Verify the anon key format** - might need JWT format instead of `sb_publishable_`

