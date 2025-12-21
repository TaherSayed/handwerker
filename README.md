# OnSite - First Contact Visit App

A simple, mobile-first Flutter application for craftsmen and service professionals to document first customer visits, fill out custom visit forms, and generate professional PDFs on-site.

## Focus

**Customer → Visit → Form → PDF**

## OnSite is intentionally NOT:

- ❌ a CRM
- ❌ a dashboard
- ❌ a business management system
- ❌ a statistics platform
- ❌ an admin panel

## 🎯 Product Purpose

OnSite is used during the **first customer visit**.

### Typical workflow:

1. Open the app
2. Log in with Google
3. Select customer from Google Contacts
4. Fill out a custom visit form
5. Export a professional PDF

**That's it.**

No statistics.  
No reports overview.  
No admin panels.

---

## 🚀 Core Features

### 🔐 Authentication

- Google Sign-In via Supabase Auth
- Secure session handling
- One account = one craftsman / company
- No roles, no managers, no complexity

### 👥 Customer Selection

- Import customers from Google Contacts
- Auto-fill:
  - Name
  - Phone
  - Email
  - Address
- Manual editing always possible
- Selected customer data cached locally for offline usage

### 📝 Custom Form Builder (CORE FEATURE)

Each user creates their own visit forms.

- Unlimited form templates
- Drag & drop field ordering
- Supported field types:
  - Text
  - Number
  - Checkbox
  - Yes / No toggle
  - Dropdown
  - Date / Time
  - Notes
  - Signature
- No hardcoded fields
- No predefined industry logic
- **The user decides what information is collected.**

### 🏠 Visit Workflow

1. Select customer
2. Select form template
3. Fill out the form on-site
4. Auto-save while working
5. Go back and correct entries at any time
6. Fully functional offline

### 📄 PDF Generation (Final Output)

Each visit ends with a professional PDF.

**PDF includes:**
- Company name and logo
- Customer details
- All filled form fields
- Date and visit ID
- Optional signature

**Features:**
- PDF preview
- Re-generate after edits
- Share via Email / WhatsApp
- Stored securely in Supabase Storage

---

## 📦 Installation

### Prerequisites

- Flutter SDK (3.0 or higher)
- Dart SDK (3.0 or higher)
- Supabase account
- Google Cloud Console account

### 1. Clone the repository

```bash
git clone <repository-url>
cd onsite
```

### 2. Install dependencies

```bash
flutter pub get
```

### 3. Configure Supabase

#### 3.1 Create Supabase project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Note your **Project URL** and **anon/public key**

#### 3.2 Run database migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/20251214174447_onsite_complete_schema.sql`
3. Paste and execute it

The migration creates:
- ✅ User profiles
- ✅ Contacts table
- ✅ Form templates table
- ✅ Visits table with status tracking
- ✅ Photo attachments table
- ✅ PDF reports table
- ✅ Row-Level Security (RLS) policies
- ✅ Automatic triggers for timestamps

#### 3.3 Configure Supabase Redirect URLs

For Google OAuth on Web:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add the following Redirect URLs:
   - `http://localhost:8080/**` (for local development - **fixed port**)
   - `http://localhost:*/**` (alternative: wildcard for any port)
   - Your production URL (e.g. `https://your-app.com/**`)

**⚠️ IMPORTANT:** The app uses a **fixed port 8080** by default. If you use a different port, update the Supabase Redirect URLs accordingly.

### 4. Google Cloud Console Configuration

#### 4.1 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Select **Web application** for Web
6. Add the following **Authorized redirect URIs**:
   - `https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback`
7. Note your **Client ID** and **Client Secret**
8. Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**
9. Enable Google Provider
10. Add **Client ID** and **Client Secret**

#### 4.2 Google Contacts API Setup (Optional, for Contact Import)

1. In Google Cloud Console → **APIs & Services** → **Library**
2. Search for **People API** and enable it
3. Go back to **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add the following **Scope**:
   - `https://www.googleapis.com/auth/contacts.readonly`
6. Save changes

#### 4.3 Google OAuth Test-Mode Fix (IMPORTANT!)

If you see **"Error 403: access_denied"** or **"App is being tested"**:

**⚡ Quick Fix (3 steps, 5 minutes):**

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **OAuth consent screen**
2. Scroll to **"Test users"** → Click **"+ ADD USERS"** → Add your email (e.g. `tahersayed1606@gmail.com`) → Click **"SAVE"**
3. Wait 2-3 minutes, then try again

**📖 Detailed guides:**
- Quick fix: `QUICK_FIX_GOOGLE_OAUTH.md` (3 steps)
- Complete guide: `GOOGLE_OAUTH_TEST_MODE_FIX.md` (detailed)

**Detailed guides:** See `GOOGLE_OAUTH_FIX_DE.md` and `GOOGLE_CONTACTS_IMPORT.md`

### 5. Environment Variables

Create an `env.json` file in the project root:

```json
{
  "SUPABASE_URL": "https://your-project.supabase.co",
  "SUPABASE_ANON_KEY": "your-anon-key",
  "GOOGLE_WEB_CLIENT_ID": "your-google-web-client-id.apps.googleusercontent.com"
}
```

**⚠️ IMPORTANT:** Add `env.json` to `.gitignore` to keep your credentials secure!

### 6. Run the app

#### Option 1: Using environment file (Recommended)

```bash
flutter run --dart-define-from-file=env.json
```

#### Option 2: Using command-line arguments

```bash
flutter run \
  --dart-define=SUPABASE_URL=your-url \
  --dart-define=SUPABASE_ANON_KEY=your-key \
  --dart-define=GOOGLE_WEB_CLIENT_ID=your-client-id
```

#### Option 3: Using fixed port scripts (Recommended for Web)

**Windows:**
```bash
START_APP_FIXED_PORT.bat
```

**PowerShell:**
```powershell
.\START_APP_FIXED_PORT.ps1
```

**⚠️ NOTE:** These scripts use a fixed port (8080) to prevent Supabase Redirect URL issues.

#### Option 4: Using regular scripts (Any port)

**Windows:**
```bash
START_APP.bat
```

**PowerShell:**
```powershell
.\START_APP.ps1
```

**⚠️ NOTE:** These may use random ports. For web development, use the fixed port scripts above.

---

## 🏗️ Project Structure

```
lib/
├── core/
│   └── app_export.dart          # Centralized exports
├── services/
│   ├── supabase_service.dart    # Supabase initialization
│   ├── auth_service.dart        # Google Sign-In
│   ├── database_service.dart    # Database operations
│   └── google_contacts_service.dart  # Google Contacts import
├── presentation/
│   ├── splash_screen/           # Initial screen
│   ├── google_sign_in_screen/   # Authentication
│   ├── contact_selection/       # Customer selection
│   ├── form_template_selection/ # Form template selection
│   ├── form_builder/            # Create/edit forms
│   ├── visit_form_filling/      # Fill out visit form
│   └── pdf_preview/             # PDF preview & share
├── widgets/
│   ├── custom_app_bar.dart      # App bar component
│   ├── custom_icon_widget.dart  # Icon component
│   └── custom_image_widget.dart # Image component
└── main.dart                    # App entry point
```

---

## 🔄 App Flow

```
Splash Screen
    ↓
Google Sign-In
    ↓
Contact Selection (from Google Contacts)
    ↓
Form Template Selection
    ↓
Visit Form Filling
    ↓
PDF Preview & Share
```

---

## 🛠️ Development

### Running tests

```bash
flutter test
```

### Building for production

#### Android

```bash
flutter build apk --dart-define-from-file=env.json
```

#### iOS

```bash
flutter build ios --dart-define-from-file=env.json
```

#### Web

```bash
flutter build web --dart-define-from-file=env.json
```

---

## 📚 Additional Documentation

- `GOOGLE_OAUTH_TEST_MODE_FIX.md` - Fix Google OAuth test mode issues
- `GOOGLE_OAUTH_CHECKLIST.md` - Complete OAuth setup checklist
- `GOOGLE_CONTACTS_IMPORT.md` - Google Contacts import guide
- `GOOGLE_OAUTH_EXAKTE_ANLEITUNG.md` - Detailed OAuth setup (German)

---

## 🐛 Troubleshooting

### Problem: "Supabase is not configured"

**Solution:**
- Make sure `env.json` exists in the project root
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
- Run the app with `--dart-define-from-file=env.json`

### Problem: "Error 403: access_denied" on Google Sign-In

**Solution:**
- See `GOOGLE_OAUTH_TEST_MODE_FIX.md`
- Add your email as a test user in Google Cloud Console

### Problem: No contacts from Google

**Solution:**
- See `GOOGLE_CONTACTS_IMPORT.md`
- Use the manual import button in the contact selection screen
- Make sure People API is enabled in Google Cloud Console

### Problem: App crashes on startup

**Solution:**
- Check that all environment variables are set
- Verify Supabase project is active
- Check Flutter console for detailed error messages

---

## 📄 License

[Your License Here]

---

## 👤 Author

[Your Name/Company]

---

## 🙏 Acknowledgments

- Built with [Flutter](https://flutter.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- Authentication via [Google Sign-In](https://developers.google.com/identity)
