# Coolify Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (Set in Coolify Dashboard)

**Server Environment Variables:**
```
SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
PORT=3001
CLIENT_URL=<your-frontend-url>
GOOGLE_WEB_CLIENT_ID=514348353198-c3b0339dd0hjbf7tjasaipp81bn8nerr.apps.googleusercontent.com
```

**Client Environment Variables (if deploying separately):**
```
VITE_SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
```

### 2. Build Configuration

- ✅ `nixpacks.toml` configured for monorepo
- ✅ Dependencies install in root, server, and client
- ✅ Build process compiles TypeScript for both server and client
- ✅ Start command runs server

### 3. Project Structure

```
onsite/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express)
├── supabase/       # Database migrations
├── nixpacks.toml   # Coolify build config
└── package.json    # Root package config
```

### 4. Build Process

1. **Install Phase:**
   - Install root dependencies
   - Install server dependencies
   - Install client dependencies

2. **Build Phase:**
   - Build server (TypeScript → JavaScript)
   - Build client (TypeScript → Vite build)

3. **Start Phase:**
   - Start server from `server/dist/index.js`

## 🚀 Deployment Steps

1. Connect your GitHub repository to Coolify
2. Set environment variables in Coolify dashboard
3. Deploy - Coolify will automatically:
   - Detect `nixpacks.toml`
   - Install dependencies
   - Build the application
   - Start the server

## 📝 Notes

- The server runs on port 3001 (configurable via PORT env var)
- The client is built as static files (not served by this deployment)
- For production, you may want to deploy client separately or serve it from the server

