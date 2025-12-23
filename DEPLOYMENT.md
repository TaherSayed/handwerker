# Deployment Guide

## Prerequisites

1. Supabase project with:
   - Database migrations applied
   - Google OAuth configured
   - Storage buckets created
   - RLS policies enabled

2. Domain names (optional):
   - API: `api.onsiteforms.com`
   - Web: `app.onsiteforms.com`

## Backend Deployment

### Option 1: Docker (Recommended)

1. Build Docker image:
```bash
docker build -t onsite-forms-api .
```

2. Run container:
```bash
docker run -d \
  -p 3000:3000 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
  -e CORS_ORIGIN=https://app.onsiteforms.com \
  --name onsite-api \
  onsite-forms-api
```

### Option 2: Node.js Direct

1. Install dependencies:
```bash
cd server
npm ci --production
```

2. Build:
```bash
npm run build
```

3. Start with PM2:
```bash
pm2 start dist/index.js --name onsite-api
pm2 save
```

### Option 3: Coolify

1. Create new application in Coolify
2. Connect to your Git repository
3. Set build command: `cd server && npm ci && npm run build`
4. Set start command: `cd server && npm start`
5. Add environment variables
6. Deploy

## Web Admin Deployment

### Option 1: Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd client
vercel --prod
```

### Option 2: Netlify

1. Build:
```bash
cd client
npm run build
```

2. Deploy `dist/` folder to Netlify

### Option 3: Static Hosting (Nginx)

1. Build:
```bash
cd client
npm run build
```

2. Copy `dist/` to web server:
```bash
rsync -avz dist/ user@server:/var/www/onsite-forms/
```

3. Nginx config:
```nginx
server {
    listen 80;
    server_name app.onsiteforms.com;
    
    root /var/www/onsite-forms;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # SSL configuration (use certbot)
}
```

## Mobile App Deployment

### Android

1. Update version in `pubspec.yaml`

2. Build release APK:
```bash
cd mobile
flutter build apk --release \
  --dart-define=SUPABASE_URL=your_url \
  --dart-define=SUPABASE_ANON_KEY=your_key \
  --dart-define=API_URL=https://api.onsiteforms.com/api
```

3. Build App Bundle for Play Store:
```bash
flutter build appbundle --release \
  --dart-define=SUPABASE_URL=your_url \
  --dart-define=SUPABASE_ANON_KEY=your_key \
  --dart-define=API_URL=https://api.onsiteforms.com/api
```

4. Upload to Google Play Console

### iOS

1. Update version in `pubspec.yaml`

2. Build:
```bash
cd mobile
flutter build ios --release \
  --dart-define=SUPABASE_URL=your_url \
  --dart-define=SUPABASE_ANON_KEY=your_key \
  --dart-define=API_URL=https://api.onsiteforms.com/api
```

3. Open Xcode and archive
4. Upload to App Store Connect

## Environment Variables

### Backend
```bash
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
CORS_ORIGIN=https://app.onsiteforms.com
```

### Web Client
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://api.onsiteforms.com/api
```

### Mobile App
Pass as `--dart-define`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `API_URL`

## SSL/HTTPS Setup

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.onsiteforms.com -d app.onsiteforms.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs onsite-api
```

### Docker Logs
```bash
docker logs -f onsite-api
```

### Health Check Endpoint
```
GET https://api.onsiteforms.com/health
```

## Backup

### Database (Supabase)
- Automated daily backups by Supabase
- Manual backup via Supabase dashboard

### Storage
- Supabase Storage has built-in redundancy
- Consider periodic exports for critical data

## Scaling

### Backend
- Use load balancer (Nginx, HAProxy)
- Run multiple API instances
- Use Redis for session management if needed

### Database
- Supabase automatically scales
- Consider read replicas for high traffic

## Troubleshooting

### API not responding
```bash
# Check if running
pm2 status
# or
docker ps

# Check logs
pm2 logs onsite-api
# or
docker logs onsite-api
```

### CORS errors
- Verify `CORS_ORIGIN` in backend env
- Check Supabase allowed origins

### Mobile app can't connect
- Verify API_URL is accessible from mobile network
- Check firewall rules
- Test API endpoint in browser

## Security Checklist

- [ ] All environment variables set correctly
- [ ] HTTPS enabled on all endpoints
- [ ] Supabase RLS policies verified
- [ ] API rate limiting configured (optional)
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Mobile app deep links working
- [ ] Google OAuth redirect URIs configured

## Post-Deployment

1. Test user signup flow
2. Create test form template
3. Fill form on mobile app
4. Verify PDF generation
5. Test offline functionality
6. Monitor error logs for 24 hours

