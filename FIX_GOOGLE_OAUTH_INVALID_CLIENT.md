# 🔴 Google OAuth "invalid_client" Error Fix

## Problem

Error: **"401: invalid_client"** - "The OAuth client was not found"

This means the **Google Client ID** configured in Supabase doesn't exist or is incorrect.

---

## ✅ Solution Steps

### Step 1: Check Google Cloud Console

1. Go to: **https://console.cloud.google.com/**
2. **IMPORTANT:** Select the **CORRECT project** (top left)
3. Navigate to: **APIs & Services** → **Credentials**

### Step 2: Find Your Web Client ID

1. In the "OAuth 2.0 Client IDs" list, find the **"Web client"** or **"Web application"**
   - ❌ NOT "Android client"
   - ❌ NOT "iOS client"  
   - ✅ ONLY "Web client" or "Web application"
2. Click on it to open details
3. **Copy the Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

### Step 3: Get Client Secret

1. In the same form (Web Client Details)
2. Scroll to **"Client Secret"**
3. If you see `***`, click **"Show"**
4. **Copy the Client Secret** (starts with `GOCSPX-`)

### Step 4: Configure Supabase

1. Go to: **https://app.supabase.com/**
2. Select your project
3. Navigate to: **Authentication** → **Providers**
4. Click on **"Google"**
5. Make sure Google is **enabled** (toggle ON)
6. Enter:
   - **Client ID (Web):** The Client ID from Step 2
   - **Client Secret:** The Client Secret from Step 3
7. Click **"Save"**

### Step 5: Verify Redirect URIs in Google Cloud Console

In your Google Cloud Console OAuth 2.0 Client settings, make sure these are configured:

**Authorized JavaScript origins:**
```
https://YOUR_SUPABASE_PROJECT.supabase.co
```

**Authorized redirect URIs:**
```
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

Replace `YOUR_SUPABASE_PROJECT` with your actual Supabase project URL.

### Step 6: Check env.json (for mobile/contacts import)

Your `env.json` should have:
```json
{
  "SUPABASE_URL": "https://your-project.supabase.co",
  "SUPABASE_ANON_KEY": "your-anon-key",
  "GOOGLE_WEB_CLIENT_ID": "your-web-client-id.apps.googleusercontent.com"
}
```

**Note:** The `GOOGLE_WEB_CLIENT_ID` in `env.json` should be the **SAME** as the Client ID you configured in Supabase.

---

## 🔍 Common Issues

### Issue 1: Wrong Project Selected
- Make sure you're using the correct Google Cloud project
- The Client ID must exist in the selected project

### Issue 2: Client ID Mismatch
- The Client ID in Supabase must match the one in Google Cloud Console
- Check for typos or extra spaces

### Issue 3: Client Secret Wrong
- Make sure you copied the entire secret (starts with `GOCSPX-`)
- Don't include extra spaces

### Issue 4: Redirect URI Not Configured
- The redirect URI in Google Cloud Console must exactly match:
  `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

---

## ✅ Verification

After fixing the configuration:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart the Flutter app**
3. Try Google Sign-In again

The error should be resolved!

---

## 📝 Still Having Issues?

If the error persists:

1. **Double-check** the Client ID and Secret in Supabase match Google Cloud Console
2. **Verify** the redirect URIs are correctly configured
3. **Check** that the Google OAuth API is enabled in Google Cloud Console
4. **Ensure** you're using the Web Client ID, not Android/iOS client ID

