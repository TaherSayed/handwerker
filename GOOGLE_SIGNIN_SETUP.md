# Google Sign-In Setup Guide

## ✅ What's Fixed

Google Sign-In is now enabled for **both web and mobile** platforms!

### Web Platform
- Uses Supabase OAuth redirect flow
- Redirects to Google for authentication
- Automatically returns to app after sign-in

### Mobile Platform  
- Uses native Google Sign-In
- Requires `GOOGLE_WEB_CLIENT_ID` in `env.json`

## 🔧 Supabase Configuration

### 1. Enable Google Provider in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to configure
4. Enable the Google provider

### 2. Add Google OAuth Credentials

You need to add your Google OAuth credentials to Supabase:

1. **Client ID (Web)**: From Google Cloud Console
2. **Client Secret**: From Google Cloud Console

### 3. Configure Redirect URLs

In your Google Cloud Console OAuth 2.0 Client:

**Authorized JavaScript origins:**
```
https://qlqvczcgjymyrfarvsgu.supabase.co
```

**Authorized redirect URIs:**
```
https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback
```

## 📝 Environment Variables

Make sure your `env.json` has:

```json
{
  "SUPABASE_URL": "https://qlqvczcgjymyrfarvsgu.supabase.co",
  "SUPABASE_ANON_KEY": "your-anon-key",
  "GOOGLE_WEB_CLIENT_ID": "your-google-web-client-id.apps.googleusercontent.com"
}
```

**Note**: `GOOGLE_WEB_CLIENT_ID` is required for mobile Google Sign-In. For web, Supabase handles the OAuth flow automatically.

## 🚀 How It Works

### Web Flow:
1. User clicks "Mit Google anmelden"
2. App redirects to Google OAuth page
3. User signs in with Google
4. Google redirects back to Supabase
5. Supabase redirects back to your app
6. Auth state listener detects session
7. User is automatically logged in

### Mobile Flow:
1. User clicks "Mit Google anmelden"
2. Native Google Sign-In dialog appears
3. User selects account
4. App receives ID token from Google
5. App sends token to Supabase
6. Supabase creates/updates user session
7. User is logged in

## ✅ Testing

1. **Run the app:**
   ```bash
   flutter run --dart-define-from-file=env.json
   ```

2. **Click "Mit Google anmelden"**
   - On web: You'll be redirected to Google
   - On mobile: Native Google Sign-In will appear

3. **Complete authentication**
   - Sign in with your Google account
   - You'll be redirected back to the app
   - You should see the dashboard

## 🐛 Troubleshooting

### "OAuth flow konnte nicht gestartet werden"
- Check that Google provider is enabled in Supabase
- Verify redirect URLs are correct in Google Cloud Console
- Ensure Supabase has your Google Client ID and Secret

### "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console matches:
  `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`

### Google Sign-In not working on mobile
- Verify `GOOGLE_WEB_CLIENT_ID` is in `env.json`
- Check that you're using the Web Client ID (not Android/iOS)
- Ensure the Client ID is from the same Google Cloud project

### Session not persisting after redirect
- The auth state listener should handle this automatically
- Check browser console for any errors
- Verify Supabase session is being created

## 📚 Additional Resources

- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://app.supabase.com/)

