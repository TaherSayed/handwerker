# Coolify Environment Variables Setup Guide

## 🚨 Required Environment Variables

You **MUST** set these environment variables in Coolify for the application to work:

### ⚠️ IMPORTANT: Build-time vs Runtime Variables

**VITE_ variables MUST be available during BUILD TIME** (they get embedded in the client bundle).
**Server variables are needed at RUNTIME** (when the server starts).

In Coolify, make sure to set these as **Build Variables** (available during build) or **Runtime Variables** (available when app runs).

### Step 1: Go to Coolify Dashboard
1. Navigate to your application in Coolify
2. Click on **"Environment Variables"** or **"Variables"** tab
3. Add the following variables:

### Step 2: Add Required Variables

#### **🔧 Build-time Variables (for React client)**

These MUST be available during the build phase:

##### **VITE_SUPABASE_URL**
```
https://ckargfikgicnflsqbbld.supabase.co
```

##### **VITE_SUPABASE_ANON_KEY**
```
sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
```

#### **🚀 Runtime Variables (for Node.js server)**

##### **SUPABASE_URL**
```
https://ckargfikgicnflsqbbld.supabase.co
```

##### **SUPABASE_ANON_KEY**
```
sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
```

##### **PORT** (Optional - defaults to 3001)
```
3001
```

##### **CLIENT_URL** (Your frontend URL)
```
https://your-frontend-domain.com
```
or if using the same domain:
```
https://your-domain.com
```

##### **GOOGLE_WEB_CLIENT_ID** (For Google OAuth)
```
514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com
```

## 📋 Quick Copy-Paste for Coolify

Copy and paste these into Coolify's environment variables section:

**⚠️ Make sure these are set as BUILD variables (available during build):**
```
VITE_SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
```

**Runtime variables (available when app runs):**
```
SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
PORT=3001
CLIENT_URL=https://your-frontend-domain.com
GOOGLE_WEB_CLIENT_ID=514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com
```

## ⚠️ Important Notes

1. **No quotes needed** - Coolify will handle the values automatically
2. **Case sensitive** - Variable names must match exactly (uppercase)
3. **Restart required** - After adding variables, restart the application
4. **CLIENT_URL** - This should be your actual frontend URL where the React app is hosted

## 🔍 Verification

After setting the variables, the application should:
- Start without errors
- Connect to Supabase successfully
- No "supabaseUrl is required" errors

## 🐛 Troubleshooting

If you still see errors:
1. Check that all variables are set (no typos)
2. Ensure no extra spaces or quotes
3. Restart the application in Coolify
4. Check the logs for specific error messages

