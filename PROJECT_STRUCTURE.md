# OnSite Forms - Complete Project Structure

## Overview

A complete GoCanvas-like field forms platform with:
- ✅ Backend API (Node.js + TypeScript + Express)
- ✅ Web Admin (React + Vite + TypeScript + Tailwind)
- ✅ Mobile App (Flutter)
- ✅ Database & Auth (Supabase)
- ✅ PDF Generation
- ✅ Offline-first architecture

## Directory Structure

```
onsite-forms/
│
├── server/                          # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts              # Environment configuration
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts   # JWT authentication
│   │   ├── routes/
│   │   │   ├── user.routes.ts      # GET /api/user/me
│   │   │   ├── templates.routes.ts  # CRUD /api/templates
│   │   │   ├── submissions.routes.ts # CRUD /api/submissions + PDF
│   │   │   └── uploads.routes.ts    # POST /api/uploads/*
│   │   ├── services/
│   │   │   ├── supabase.service.ts  # Supabase client
│   │   │   └── pdf.service.ts       # PDF generation
│   │   └── index.ts                 # Express app entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── client/                          # React Web Admin
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx           # Main layout with sidebar
│   │   ├── pages/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── GoogleSignInScreen.tsx
│   │   │   ├── Dashboard.tsx        # Home dashboard
│   │   │   ├── FormTemplates.tsx    # List templates
│   │   │   ├── FormBuilder.tsx      # Create/edit templates
│   │   │   ├── Submissions.tsx      # List submissions
│   │   │   ├── SubmissionDetail.tsx # View submission
│   │   │   └── Settings.tsx         # User settings
│   │   ├── services/
│   │   │   ├── api.service.ts       # API client
│   │   │   └── supabase.ts          # Supabase client
│   │   ├── store/
│   │   │   └── authStore.ts         # Zustand auth state
│   │   ├── App.tsx                  # Router setup
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Tailwind styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── mobile/                          # Flutter Mobile App
│   ├── lib/
│   │   ├── config/
│   │   │   └── theme.dart           # App theme
│   │   ├── models/
│   │   │   ├── form_template.dart
│   │   │   └── submission.dart
│   │   ├── providers/
│   │   │   ├── auth_provider.dart   # State management
│   │   │   ├── templates_provider.dart
│   │   │   └── submissions_provider.dart
│   │   ├── screens/
│   │   │   ├── splash_screen.dart
│   │   │   ├── auth/
│   │   │   │   └── google_signin_screen.dart
│   │   │   ├── home/
│   │   │   │   └── home_screen.dart
│   │   │   ├── templates/
│   │   │   │   └── template_selection_screen.dart
│   │   │   ├── form/
│   │   │   │   └── form_filling_screen.dart
│   │   │   └── submissions/
│   │   │       ├── drafts_list_screen.dart
│   │   │       └── submissions_list_screen.dart
│   │   ├── services/
│   │   │   ├── api_service.dart     # HTTP client
│   │   │   └── local_storage_service.dart # Offline storage
│   │   ├── widgets/
│   │   │   └── form_field_widget.dart # Dynamic form fields
│   │   └── main.dart                # App entry
│   ├── android/
│   │   └── app/
│   │       └── src/main/
│   │           ├── AndroidManifest.xml
│   │           └── kotlin/
│   ├── ios/
│   │   └── Runner/
│   │       └── Info.plist
│   ├── pubspec.yaml
│   └── README.md
│
├── supabase/
│   └── migrations/
│       └── 20251223_onsite_complete_schema.sql  # Database schema + RLS
│
├── Dockerfile                       # Backend container
├── docker-compose.yml               # Docker orchestration
├── package.json                     # Root package (scripts)
├── .gitignore
├── README.md                        # Main documentation
├── SETUP.md                         # Quick setup guide
├── DEPLOYMENT.md                    # Deployment guide
└── PROJECT_STRUCTURE.md             # This file
```

## Key Files Explained

### Backend

**`server/src/index.ts`**
- Express app initialization
- CORS configuration
- Route mounting
- Error handling

**`server/src/middleware/auth.middleware.ts`**
- Validates Supabase JWT
- Extracts user from token
- Protects all API routes

**`server/src/services/pdf.service.ts`**
- Generates PDFs using PDFKit
- Uploads to Supabase Storage
- Returns public URL

### Web Admin

**`client/src/App.tsx`**
- React Router setup
- Protected routes
- Authentication flow

**`client/src/pages/FormBuilder.tsx`**
- Drag & drop form builder
- 10 field types
- Live preview
- Template save/update

**`client/src/store/authStore.ts`**
- Zustand state management
- Authentication state
- User profile

### Mobile App

**`mobile/lib/main.dart`**
- Flutter app initialization
- Provider setup
- Navigation

**`mobile/lib/screens/form/form_filling_screen.dart`**
- Dynamic form rendering
- Customer info capture
- Auto-save drafts
- Offline support

**`mobile/lib/services/local_storage_service.dart`**
- SharedPreferences for drafts
- Offline-first architecture
- Background sync

## Database Schema

### Tables

**`user_profiles`**
- User information from Google OAuth
- Company name and logo
- Links to auth.users

**`workspaces`**
- Multi-tenant support (v1: one per user)
- Owner relationship

**`form_templates`**
- Template metadata
- JSONB fields array
- Categories and tags

**`submissions`**
- Customer information
- JSONB field values
- Status (draft/submitted)
- PDF URL reference

**`submission_photos`**
- Photo attachments
- Storage paths
- Field associations

### Storage Buckets

**`submission-photos`** (private)
- Photos from mobile app
- Organized by user_id/submission_id

**`submission-pdfs`** (private)
- Generated PDF files
- Organized by user_id/submission_id

**`company-logos`** (private)
- User company logos
- Organized by user_id

### RLS Policies

All tables have Row-Level Security enabled:
- Users can only access their own data
- Policies enforce user_id matching
- Storage policies mirror database policies

## API Endpoints

### User
```
GET    /api/user/me          # Get current user
PATCH  /api/user/me          # Update profile
```

### Templates
```
GET    /api/templates              # List all
GET    /api/templates/:id          # Get one
POST   /api/templates              # Create
PUT    /api/templates/:id          # Update
DELETE /api/templates/:id          # Delete
POST   /api/templates/:id/duplicate # Duplicate
```

### Submissions
```
GET    /api/submissions         # List all
GET    /api/submissions/:id     # Get one
POST   /api/submissions         # Create
PUT    /api/submissions/:id     # Update
DELETE /api/submissions/:id     # Delete
POST   /api/submissions/:id/pdf # Generate PDF
```

### Uploads
```
POST   /api/uploads/signed-url        # Get upload URL
POST   /api/uploads/submission-photo  # Create photo record
```

## Field Types

1. **text** - Single line text input
2. **number** - Numeric input
3. **checkbox** - Boolean checkbox
4. **toggle** - Yes/No switch
5. **dropdown** - Select from options
6. **date** - Date picker
7. **datetime** - Date & time picker
8. **notes** - Multi-line text area
9. **signature** - Signature capture
10. **photo** - Camera/gallery photo

## Technology Stack

### Backend
- Node.js 20
- TypeScript 5
- Express 4
- Supabase JS Client
- PDFKit (PDF generation)
- CORS, dotenv

### Web Admin
- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- React Router 6
- Zustand (state)
- React Beautiful DnD
- Lucide Icons
- date-fns

### Mobile
- Flutter 3+
- Dart 3+
- Provider (state)
- Supabase Flutter
- HTTP client
- Shared Preferences
- Image Picker
- Signature widget

### Database & Auth
- Supabase (Postgres)
- Row-Level Security
- Google OAuth
- Storage buckets

## Data Flow

### Form Creation (Web)
1. User logs in with Google
2. Creates template in FormBuilder
3. Adds fields via drag & drop
4. Saves to Supabase via API
5. RLS ensures user ownership

### Form Submission (Mobile)
1. User logs in with Google
2. Selects template
3. Fills form offline
4. Auto-saves as draft locally
5. Submits when online
6. Syncs to backend
7. PDF generated on request

### PDF Generation (Backend)
1. Submission fetched from database
2. Template fields retrieved
3. PDF built with PDFKit
4. Uploaded to Supabase Storage
5. URL saved to submission record
6. Returned to client

## Security Features

✅ Google OAuth only (no passwords)
✅ JWT verification on all API routes
✅ Row-Level Security on all tables
✅ Signed URLs for uploads
✅ User isolation (can't access others' data)
✅ HTTPS recommended for production
✅ CORS configured
✅ Environment variables for secrets

## Offline Support

### Mobile App
- Drafts stored locally (SharedPreferences)
- Background sync when online
- Connectivity detection
- Auto-retry failed uploads
- Visual indicators for sync status

### Web Admin
- Real-time via Supabase subscriptions (optional)
- Manual refresh
- Loading states

## Deployment Targets

### Backend
- Docker container
- Node.js server (PM2)
- Coolify
- Any Node.js host

### Web Admin
- Vercel
- Netlify
- Static hosting (Nginx)
- Any static file host

### Mobile
- Android: Google Play Store (APK/AAB)
- iOS: App Store (IPA)

## Environment Configuration

### Development
- Backend: `localhost:3000`
- Web: `localhost:5173`
- Mobile: Emulator/Simulator

### Production
- Backend: `api.yourdomain.com`
- Web: `app.yourdomain.com`
- Mobile: Production API URLs

## Next Steps

1. **Setup**: Follow `SETUP.md`
2. **Develop**: Customize as needed
3. **Test**: Create templates and submissions
4. **Deploy**: Follow `DEPLOYMENT.md`
5. **Monitor**: Set up logging and alerts

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Flutter Docs**: https://flutter.dev/docs
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com

---

**Built with ❤️ for field professionals**

