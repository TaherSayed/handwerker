# OnSite Forms - Testing Guide

## 🔍 How to Verify Fixes Are Working

### 1. Clear Browser Cache
**IMPORTANT**: After deployment, you MUST clear your browser cache:
- **Chrome/Edge**: Press `Ctrl+Shift+Delete` → Select "Cached images and files" → Clear
- **Or**: Hard refresh with `Ctrl+F5` or `Ctrl+Shift+R`
- **Or**: Open in Incognito/Private window

### 2. Test Google OAuth
1. **Sign out** if already logged in
2. Click "Sign in with Google"
3. **Expected**: You should see Google's consent screen asking for:
   - Email
   - Profile
   - **Contacts (read-only)** ← This is NEW!
4. Grant all permissions
5. **Expected**: You should be redirected back to the app and logged in

**If you see "Google hasn't verified this app"**:
- This is NORMAL in Testing mode
- Click "Advanced" → "Go to OnSite (unsafe)"
- This warning disappears once you publish the app

### 3. Test Form Template Creation
1. Go to **Templates** → Click **"New Template"**
2. Enter a template name (e.g., "Test Form")
3. Add some fields (Text, Number, etc.)
4. Click **"Save Template"**
5. **Expected**: 
   - Success message appears
   - Redirects to Templates page
   - Template appears in the list
   - **NO ERROR** about "No workspace found"

### 4. Test Submissions Page
1. Go to **Submissions**
2. **Expected**:
   - Page loads within 10 seconds (not infinite loading)
   - Shows "No submissions yet" if empty (not spinner forever)
   - If error occurs, shows error message with "Retry" button

### 5. Test Settings Page
1. Go to **Settings**
2. Change your name or company name
3. Click **"Save Changes"**
4. **Expected**:
   - Success message appears (green banner)
   - Settings are saved
   - No generic alert popups

### 6. Test Google Contacts (If Available)
1. Create a new submission (if mobile app is set up)
2. When selecting customer, try to load Google Contacts
3. **Expected**:
   - Contacts load from Google
   - Or clear error message if permission not granted

## 🐛 Debugging

### Check Browser Console
1. Open Developer Tools (`F12`)
2. Go to **Console** tab
3. Look for any red errors
4. Share these errors if issues persist

### Check Network Tab
1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Try the action that's failing
4. Look for failed requests (red)
5. Click on failed request → Check **Response** tab

### Common Issues & Solutions

#### Issue: "No workspace found" when saving template
**Solution**: This should be auto-fixed. If still happening:
- Check server logs in Coolify
- Verify user profile was created (check Supabase `user_profiles` table)

#### Issue: Submissions page loads forever
**Solution**: Should timeout after 10 seconds now. If still happening:
- Check browser console for errors
- Check Network tab for failed API calls
- Verify `/api/submissions` endpoint is working

#### Issue: Google Contacts don't load
**Solution**: 
- Sign out and sign back in
- Make sure to grant contacts permission during OAuth
- Check browser console for error messages

#### Issue: Form saves but shows error
**Solution**: Check if error message is user-friendly now (not generic alert)

## ✅ Verification Checklist

After clearing cache and redeploying:

- [ ] Google OAuth shows contacts permission request
- [ ] Can create form templates without "workspace" error
- [ ] Submissions page loads (not infinite spinner)
- [ ] Settings page shows success/error messages (not alerts)
- [ ] Error messages are user-friendly with retry buttons
- [ ] No blank screens or silent failures

## 📞 If Issues Persist

1. **Check Coolify logs**: Go to your app → Logs tab
2. **Check browser console**: Look for JavaScript errors
3. **Check Network tab**: Look for failed API requests
4. **Verify Supabase**: Check if tables exist and RLS policies are correct

## 🔄 Force Fresh Deployment

If fixes aren't showing:
1. In Coolify: Click **"Force Rebuild"** or **"Redeploy"**
2. Wait for build to complete
3. **Clear browser cache** (very important!)
4. Test again

