# 🔴 Common Google OAuth Errors After Configuration

## Error 1: redirect_uri_mismatch

**Error Message:** `redirect_uri_mismatch` or "The redirect URI in the request does not match"

### Fix:

#### In Supabase Dashboard:
1. Go to: **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:8080/**
   http://localhost:8080
   ```
   (Add both with and without `/**`)

#### In Google Cloud Console:
Make sure you have BOTH:
- **Authorized JavaScript origins:**
  ```
  https://qlqvczcgjymyrfarvsgu.supabase.co
  ```

- **Authorized redirect URIs:**
  ```
  https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback
  ```

---

## Error 2: Access Blocked / Authorization Error

**Error Message:** "Access blocked: Authorization error" or "Error 400"

### Fix:

1. **Check Google Cloud Console:**
   - Make sure the OAuth consent screen is configured
   - Go to: **APIs & Services** → **OAuth consent screen**
   - Fill in all required fields (App name, User support email, etc.)
   - Add your email as a test user if in testing mode

2. **Verify Scopes:**
   - The app requests: `email`, `profile`, `contacts.readonly`
   - Make sure these are approved in OAuth consent screen

---

## Error 3: "The OAuth client was not found" (Still)

**Error Message:** `401: invalid_client`

### Fix:

1. **Double-check Supabase Configuration:**
   - Go to Supabase → Authentication → Providers → Google
   - Verify Client ID: `514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com`
   - Verify Client Secret is entered (not empty)
   - Make sure Google provider is **ENABLED** (toggle ON)

2. **Wait 5-10 minutes** after making changes (Google needs time to propagate)

---

## Error 4: "redirect_uri_mismatch" with localhost

**Error Message:** Redirect URI mismatch with `http://localhost:8080`

### Fix:

#### In Supabase Dashboard:
1. Go to: **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:8080`
3. **Redirect URLs:** Add:
   ```
   http://localhost:8080/**
   http://localhost:8080
   ```

**Important:** The `/**` allows all paths under localhost:8080

---

## Error 5: Session Not Found After Redirect

**Error Message:** User gets redirected but not logged in

### Fix:

1. **Check Browser Console (F12):**
   - Look for any JavaScript errors
   - Check Network tab for failed requests

2. **Verify Redirect URL in Code:**
   - Should be: `http://localhost:8080/` (with trailing slash)
   - Check `lib/services/auth_service.dart` line 75

3. **Clear Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Clear cookies and cache
   - Try again

---

## Error 6: "Invalid scope" or Scope Error

**Error Message:** Scope-related errors

### Fix:

1. **Check OAuth Consent Screen:**
   - Go to Google Cloud Console → OAuth consent screen
   - Make sure scopes are added:
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/contacts.readonly`

2. **Verify in Code:**
   - Check `lib/services/auth_service.dart` line 89
   - Should have: `scopes: 'email profile https://www.googleapis.com/auth/contacts.readonly'`

---

## ✅ Quick Checklist

Before testing, make sure:

- [ ] Client ID in Supabase matches Google Cloud Console
- [ ] Client Secret is entered in Supabase
- [ ] Google provider is ENABLED in Supabase
- [ ] Redirect URIs in Google Cloud Console:
  - [ ] `https://qlqvczcgjymyrfarvsgu.supabase.co` (JavaScript origins)
  - [ ] `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback` (Redirect URIs)
- [ ] Redirect URLs in Supabase:
  - [ ] `http://localhost:8080/**`
  - [ ] `http://localhost:8080`
- [ ] OAuth consent screen is configured in Google Cloud Console
- [ ] `env.json` has correct `GOOGLE_WEB_CLIENT_ID`
- [ ] App restarted after changes

---

## 🧪 Testing Steps

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart Flutter app:**
   ```bash
   .\START_APP_FIXED_PORT.bat
   ```
3. **Open browser console** (F12) to see errors
4. **Try Google Sign-In**
5. **Check for errors** in console

---

## 📞 Still Having Issues?

Please provide:
1. **Exact error message** (screenshot or copy-paste)
2. **Browser console errors** (F12 → Console tab)
3. **Which step fails:**
   - Clicking "Sign in with Google"?
   - After Google authentication?
   - After redirect back to app?

