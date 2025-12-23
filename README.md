# OnSite Forms

A GoCanvas-like field forms platform for professionals. Create form templates, fill them offline on mobile, sync data, and generate professional PDFs.

## Stack

- **Backend**: Node.js 20 + TypeScript + Express
- **Database/Auth/Storage**: Supabase (Postgres + RLS + Storage)
- **Web Admin**: React + Vite + TypeScript + Tailwind CSS
- **Mobile App**: Flutter (Android + iOS)
- **PDF Generation**: PDFKit (server-side)
- **Authentication**: Google OAuth via Supabase

## Features

### Core Functionality
- ✅ Google OAuth authentication
- ✅ Multi-tenant architecture (single workspace per user in v1)
- ✅ Drag-and-drop form template builder
- ✅ Field types: Text, Number, Checkbox, Toggle, Dropdown, Date/Time, Notes, Signature, Photo
- ✅ Offline-first mobile submissions
- ✅ Draft auto-save
- ✅ Background sync
- ✅ Professional PDF generation
- ✅ Supabase Storage integration
- ✅ Row-level security (RLS)

## Project Structure

```
onsite-forms/
├── server/           # Node.js API
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── client/           # React web admin
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── mobile/           # Flutter app
│   ├── lib/
│   │   ├── models/
│   │   ├── providers/
│   │   ├── screens/
│   │   ├── services/
│   │   └── widgets/
│   └── pubspec.yaml
└── supabase/
    └── migrations/
```

## Setup

### Prerequisites
- Node.js 20+
- Flutter 3.0+
- Supabase account

### 1. Supabase Setup

1. Create a new Supabase project
2. Run migrations from `supabase/migrations/`
3. Enable Google OAuth in Supabase Auth settings
4. Create storage buckets: `submission-photos`, `submission-pdfs`, `company-logos`

### 2. Backend Setup

```bash
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ORIGIN=http://localhost:5173
EOF

# Run in development
npm run dev

# Build for production
npm run build
npm start
```

### 3. Web Admin Setup

```bash
cd client
npm install

# Create .env file
cat > .env << EOF
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000/api
EOF

# Run in development
npm run dev

# Build for production
npm run build
```

### 4. Mobile App Setup

```bash
cd mobile
flutter pub get

# Run on device/emulator
flutter run \
  --dart-define=SUPABASE_URL=your_url \
  --dart-define=SUPABASE_ANON_KEY=your_key \
  --dart-define=API_URL=http://your-api-url/api

# Build for Android
flutter build apk --release

# Build for iOS
flutter build ios --release
```

## API Routes

### Authentication
- Handled by Supabase OAuth

### User
- `GET /api/user/me` - Get current user profile
- `PATCH /api/user/me` - Update user profile

### Templates
- `GET /api/templates` - List templates
- `GET /api/templates/:id` - Get template
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/duplicate` - Duplicate template

### Submissions
- `GET /api/submissions` - List submissions
- `GET /api/submissions/:id` - Get submission
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission
- `POST /api/submissions/:id/pdf` - Generate PDF

### Uploads
- `POST /api/uploads/signed-url` - Get signed upload URL
- `POST /api/uploads/submission-photo` - Upload submission photo

## Database Schema

### Tables
- `user_profiles` - User information
- `workspaces` - User workspaces
- `form_templates` - Form templates with fields
- `submissions` - Form submissions
- `submission_photos` - Attached photos

### Storage Buckets
- `submission-photos` - Photo uploads
- `submission-pdfs` - Generated PDFs
- `company-logos` - Company logos

## Security

- Row-level security (RLS) on all tables
- JWT verification on API routes
- Signed URLs for storage uploads
- User can only access their own data

## Deployment

### Backend (Coolify/Docker)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --production
COPY server/ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Web Admin (Static)
```bash
cd client
npm run build
# Deploy dist/ folder to any static host
```

### Mobile App
- Android: Upload APK to Google Play Store
- iOS: Upload to App Store Connect

## Development Workflow

1. Create form templates in web admin
2. Fill forms on mobile (works offline)
3. Sync when online
4. Generate PDFs from submissions
5. View/download PDFs in web admin

## Environment Variables

### Server
- `PORT` - API port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `CORS_ORIGIN` - CORS origin URL

### Web Client
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_API_URL` - Backend API URL

### Mobile
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `API_URL` - Backend API URL

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
# Force rebuild
