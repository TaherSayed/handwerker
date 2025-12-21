# ✅ Verify Supabase Google OAuth Configuration

## Current Configuration

**Google Cloud Console Client ID:**
```
514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com
```

**Supabase Project:**
```
qlqvczcgjymyrfarvsgu
```

---

## Step-by-Step Verification

### Step 1: Get Client Secret from Google Cloud Console

1. Go to: **https://console.cloud.google.com/**
2. Select project: **OnSite**
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on the Client ID: `514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr`
5. Scroll down to **"Clientschlüssel" (Client Secret)**
6. Click **"Show"** or **"Anzeigen"** if you see `***`
7. **Copy the entire Client Secret** (starts with `GOCSPX-`)

---

### Step 2: Configure Supabase (CRITICAL)

1. Go to: **https://app.supabase.com/**
2. Select project: **qlqvczcgjymyrfarvsgu**
3. Navigate to: **Authentication** → **Providers**
4. Click on **"Google"**

5. **VERIFY THESE SETTINGS:**

   ✅ **Enabled:** Toggle must be **ON** (green/enabled)
   
   ✅ **Client ID (Web):** Must be EXACTLY:
   ```
   514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com
   ```
   - No extra spaces
   - No trailing slashes
   - Exact match with Google Cloud Console
   
   ✅ **Client Secret:** Must be entered (starts with `GOCSPX-`)
   - Cannot be empty
   - Must match Google Cloud Console

6. Click **"Save"** or **"Speichern"**

---

### Step 3: Verify Redirect URIs in Google Cloud Console

In Google Cloud Console, make sure you have:

**Authorized JavaScript origins:**
```
https://qlqvczcgjymyrfarvsgu.supabase.co
```

**Authorized redirect URIs:**
```
https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback
```

✅ These look correct from your screenshot!

---

### Step 4: Wait for Propagation

After making changes:
- **Wait 5-10 minutes** for Google to propagate changes
- Clear browser cache (Ctrl+Shift+Delete)
- Restart the Flutter app

---

## Common Mistakes

### ❌ Mistake 1: Client ID Typo
- Extra space at the end
- Missing characters
- Wrong client ID (using Android/iOS instead of Web)

### ❌ Mistake 2: Client Secret Missing
- Field is empty
- Only partial secret copied
- Wrong secret (from different client)

### ❌ Mistake 3: Provider Not Enabled
- Toggle is OFF in Supabase
- Forgot to click "Save"

### ❌ Mistake 4: Wrong Project
- Using Client ID from different Google Cloud project
- Supabase project doesn't match

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Client ID in Supabase matches Google Cloud Console exactly
- [ ] Client Secret is entered in Supabase (not empty)
- [ ] Google provider toggle is ON (enabled) in Supabase
- [ ] Clicked "Save" in Supabase after making changes
- [ ] Authorized JavaScript origins in Google Cloud Console: `https://qlqvczcgjymyrfarvsgu.supabase.co`
- [ ] Authorized redirect URIs in Google Cloud Console: `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`
- [ ] `env.json` has correct `GOOGLE_WEB_CLIENT_ID`
- [ ] Waited 5-10 minutes after changes
- [ ] Cleared browser cache
- [ ] Restarted Flutter app

---

## 🧪 Test Again

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart app:**
   ```bash
   .\START_APP_FIXED_PORT.bat
   ```
3. **Try Google Sign-In**
4. **Check browser console** (F12) for any errors

---

## 📸 Screenshot What to Check

Please verify in Supabase Dashboard:

1. **Authentication → Providers → Google**
   - Screenshot showing:
     - Toggle is ON
     - Client ID field value
     - Client Secret field (can blur for security)

This will help identify what's wrong!

