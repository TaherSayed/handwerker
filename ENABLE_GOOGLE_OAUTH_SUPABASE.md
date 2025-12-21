# Enable Google OAuth in Supabase

## 🚨 Error: "Unsupported provider: provider is not enabled"

This error means Google OAuth is not enabled in your Supabase project. Follow these steps to enable it:

## Step 1: Go to Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **ckargfikgicnflsqbbld**
3. Navigate to **Authentication** → **Providers** (in the left sidebar)

## Step 2: Enable Google Provider

1. Find **Google** in the list of providers
2. Click on **Google** to open its configuration
3. Toggle the **Enable Google provider** switch to **ON**

## Step 3: Configure Google OAuth

You'll need to enter your Google OAuth credentials:

### Google Client ID:
```
514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com
```

### Google Client Secret:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID: `514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr`
- Click on it to view details
- Copy the **Client Secret**
- Paste it into Supabase's **Google Client Secret** field

## Step 4: Configure Redirect URLs

### In Supabase Dashboard:
1. In the Google provider settings, find **Redirect URLs**
2. Add your production URL:
   ```
   https://hw.sata26.cloud/**
   ```
3. Also add for development (if needed):
   ```
   http://localhost:5173/**
   ```

### In Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://ckargfikgicnflsqbbld.supabase.co/auth/v1/callback
   ```
5. Click **Save**

## Step 5: Verify Configuration

After enabling and configuring:

1. **Save** the settings in Supabase
2. Wait a few seconds for changes to propagate
3. Try logging in with Google again

## Step 6: Test Users (if in Testing Mode)

If your Google OAuth consent screen is in **Testing** mode:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Under **Test users**, make sure your email is added:
   ```
   tahersayed1606@gmail.com
   ```

## 🔍 Verification Checklist

- [ ] Google provider is **enabled** in Supabase
- [ ] Google Client ID is entered correctly
- [ ] Google Client Secret is entered correctly
- [ ] Redirect URL `https://ckargfikgicnflsqbbld.supabase.co/auth/v1/callback` is in Google Cloud Console
- [ ] Your email is added as a test user (if in testing mode)
- [ ] Settings are saved in both Supabase and Google Cloud Console

## 🐛 Troubleshooting

### Still getting "provider is not enabled"?
- Wait 1-2 minutes after enabling (propagation delay)
- Refresh the Supabase dashboard
- Clear browser cache and try again

### "Access denied" error?
- Check that your email is in the test users list
- Verify OAuth consent screen is published or you're a test user

### Redirect URI mismatch?
- Ensure `https://ckargfikgicnflsqbbld.supabase.co/auth/v1/callback` is in Google Cloud Console
- Check for typos in the redirect URI
- Make sure there are no trailing slashes

## 📝 Quick Reference

**Supabase Project:** `ckargfikgicnflsqbbld`  
**Google Client ID:** `514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com`  
**Supabase Callback URL:** `https://ckargfikgicnflsqbbld.supabase.co/auth/v1/callback`  
**Production URL:** `https://hw.sata26.cloud`

