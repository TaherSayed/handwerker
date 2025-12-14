# OnSite - Handwerker Besuchsmanagement App

Eine moderne Flutter-basierte mobile Anwendung für Handwerksbetriebe zur Verwaltung von Kundenbesuchen, Formularen und Berichten.

**Status:** ✅ **PRODUKTIONSBEREIT** - Alle kritischen Probleme behoben, vollständig funktionsfähig

---

## 📋 Voraussetzungen

- Flutter SDK (^3.6.0)
- Dart SDK (≥3.6.0)
- Android Studio / VS Code mit Flutter-Erweiterungen
- Android SDK / Xcode (für iOS-Entwicklung)
- Supabase Account (für Backend-Integration)
- Google Cloud Console Account (für Google OAuth & Contacts)

---

## 🚀 Funktionen

### 🔐 Authentifizierung
- ✅ **E-Mail/Passwort-Anmeldung** - Vollständige Sign-Up und Sign-In Funktionalität
- ✅ **Google OAuth-Integration** - Web (OAuth Redirect) & Mobile (Native Sign-In)
- ✅ **Automatische Profilsynchronisation** - Benutzerdaten werden automatisch synchronisiert
- ✅ **Sichere Sitzungsverwaltung** - Automatische Session-Verwaltung mit Supabase
- ✅ **Google Contacts Import** - Automatischer Import von Google Kontakten nach Login

### 👥 Kontaktverwaltung
- ✅ **Kontakte erstellen, bearbeiten und löschen** - Vollständige CRUD-Operationen
- ✅ **Favoriten-System** - Kontakte als Favoriten markieren
- ✅ **Google Contacts Synchronisation** - Automatischer Import nach Google Sign-In
- ✅ **Suchfunktion** - Echtzeit-Suche nach Name, E-Mail oder Firma
- ✅ **Offline-Support** - Kontakte auch offline verfügbar

### 📝 Formularverwaltung
- ✅ **Drag-and-Drop Formular-Builder** - Visueller Formular-Editor
- ✅ **Mehrere Feldtypen** - Text, Zahl, Datum, Dropdown, Checkbox, Notizen, Signatur
- ✅ **Wiederverwendbare Vorlagen** - Formularvorlagen speichern und wiederverwenden
- ✅ **Feldkonfiguration** - Label, Help-Text, Required/Optional, Validierung
- ✅ **Supabase-Integration** - Formulare werden direkt in Supabase gespeichert
- ✅ **Echtzeit-Vorschau** - Sofortige Vorschau während der Erstellung

### 🏠 Besuchsworkflow
- ✅ **Offline-fähige Besuchserfassung** - Funktioniert auch ohne Internet
- ✅ **Auto-Speicherung** - Automatisches Speichern alle 30 Sekunden
- ✅ **Signatur-Erfassung** - Digitale Signatur-Erfassung
- ✅ **Foto-Anhänge** - Mehrere Fotos pro Besuch
- ✅ **Fortschrittsanzeige** - Visueller Fortschritt der Formularausfüllung
- ✅ **Feldvalidierung** - Automatische Validierung von Pflichtfeldern

### 📊 Dashboard & Berichte
- ✅ **Besuchsstatistiken** - Übersicht über alle Besuche
- ✅ **Kürzliche Besuche** - Schnellzugriff auf letzte Besuche
- ✅ **PDF-Generierung** - Professionelle PDF-Berichte erstellen
- ✅ **PDF-Sharing** - Berichte per E-Mail, WhatsApp, etc. teilen
- ✅ **Synchronisationsstatus** - Anzeige des Sync-Status

### 👤 Benutzerprofil
- ✅ **Profilverwaltung** - Benutzerdaten anzeigen und bearbeiten
- ✅ **Firmeninformationen** - Firmendaten verwalten
- ✅ **Einstellungen** - App-Einstellungen konfigurieren
- ✅ **Datenexport** - Daten exportieren
- ✅ **Account-Verwaltung** - Sign Out, Account löschen

---

## 🛠️ Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd onsite
```

### 2. Abhängigkeiten installieren
```bash
flutter pub get
```

### 3. Supabase-Konfiguration

#### 3.1 Supabase-Projekt erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Notieren Sie sich:
   - **Project URL**: `https://xxxx.supabase.co`
   - **Anon/Public Key**: `eyJxxx...`

#### 3.2 Umgebungsvariablen konfigurieren

Erstellen Sie eine `env.json`-Datei im Projektstamm:

```json
{
  "SUPABASE_URL": "https://ihre-projekt-url.supabase.co",
  "SUPABASE_ANON_KEY": "ihr-anon-key-hier"
}
```

**Wichtig:** Diese Datei wird NICHT ins Repository eingecheckt (.gitignore)

#### 3.3 Datenbank-Migration ausführen

1. Öffnen Sie Ihr Supabase-Dashboard
2. Gehen Sie zum SQL-Editor
3. Kopieren Sie den Inhalt von `supabase/migrations/20251214174447_onsite_complete_schema.sql`
4. Fügen Sie ihn ein und führen Sie ihn aus

Die Migration erstellt:
- ✅ Benutzerprofile mit Rollen
- ✅ Kontakte-Tabelle
- ✅ Formularvorlagen-Tabelle
- ✅ Besuche-Tabelle mit Statusverfolgung
- ✅ Foto-Anhänge-Tabelle
- ✅ PDF-Berichte-Tabelle
- ✅ Row-Level Security (RLS) Richtlinien
- ✅ Automatische Trigger für Zeitstempel
- ✅ Test-Daten für sofortiges Testen

#### 3.4 Supabase Redirect URLs konfigurieren

Für Google OAuth auf Web:

1. Gehen Sie zu Supabase Dashboard → Authentication → URL Configuration
2. Fügen Sie folgende Redirect URLs hinzu:
   - `http://localhost:*/**` (für lokale Entwicklung)
   - `https://preview.builtwithrocket.new/**` (für Rocket Preview)
   - Ihre Produktions-URL (z.B. `https://ihre-app.com/**`)

### 4. Google Cloud Console Konfiguration

#### 4.1 Google OAuth Setup

1. Gehen Sie zu [Google Cloud Console](https://console.cloud.google.com)
2. Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes
3. Aktivieren Sie die **Google+ API**
4. Gehen Sie zu **Credentials** → **Create Credentials** → **OAuth client ID**
5. Wählen Sie **Web application** für Web
6. Fügen Sie folgende **Authorized redirect URIs** hinzu:
   - `https://[IHR-SUPABASE-PROJEKT].supabase.co/auth/v1/callback`
7. Notieren Sie sich die **Client ID** und **Client Secret**
8. Gehen Sie zu Supabase Dashboard → Authentication → Providers → Google
9. Aktivieren Sie Google Provider
10. Fügen Sie **Client ID** und **Client Secret** hinzu

#### 4.2 Google Contacts API Setup (Optional, für Kontakt-Import)

1. In Google Cloud Console → **APIs & Services** → **Library**
2. Suchen Sie nach **People API** und aktivieren Sie sie
3. Gehen Sie zurück zu **Credentials**
4. Bearbeiten Sie Ihre OAuth 2.0 Client ID
5. Fügen Sie folgenden **Scope** hinzu:
   - `https://www.googleapis.com/auth/contacts.readonly`
6. Speichern Sie die Änderungen

**Detaillierte Anleitung:** Siehe `GOOGLE_OAUTH_FIX_DE.md` und `GOOGLE_CONTACTS_IMPORT_DE.md`

### 5. App ausführen

#### Mit Umgebungsvariablen (Empfohlen)

**Windows (PowerShell):**
```powershell
flutter run --dart-define-from-file=env.json
```

**Windows (Batch):**
```batch
START_APP.bat
```

**Windows (PowerShell Script):**
```powershell
.\START_APP.ps1
```

**Linux/Mac:**
```bash
flutter run --dart-define-from-file=env.json
```

#### Alternative: VSCode Konfiguration

Fügen Sie zu `.vscode/launch.json` hinzu:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": [
        "--dart-define-from-file",
        "env.json"
      ]
    }
  ]
}
```

#### Alternative: Android Studio / IntelliJ

1. Run → Edit Configurations
2. Fügen Sie zu "Additional arguments" hinzu:
   ```
   --dart-define-from-file=env.json
   ```

---

## 📱 App-Struktur

### Screens (Presentation Layer)

1. **Splash Screen** (`/`) - Initialisierung und Auth-Check
2. **Google Sign-In Screen** (`/google-sign-in-screen`) - Authentifizierung
3. **Dashboard** (`/dashboard`) - Hauptbildschirm mit Statistiken
4. **Contacts Management** (`/contacts-management`) - Kontakt-Verwaltung
5. **Contact Selection** (`/contact-selection`) - Kontakt-Auswahl für Besuche
6. **Form Template Selection** (`/form-template-selection`) - Formular-Vorlagen
7. **Form Builder** (`/form-builder`) - Formular-Erstellung
8. **Visit Form Filling** (`/visit-form-filling`) - Besuchsformular ausfüllen
9. **PDF Preview** (`/pdf-preview`) - PDF-Bericht Vorschau & Sharing
10. **User Profile** (`/user-profile`) - Benutzer-Profil & Einstellungen

### Services (Backend)

- **SupabaseService** - Supabase Initialisierung und Konfiguration
- **AuthService** - Google & Email/Password Authentifizierung
- **DatabaseService** - CRUD-Operationen für alle Daten
- **GoogleContactsService** - Google Contacts Import

### Projektstruktur

```
onsite/
├── android/              # Android-spezifische Konfiguration
├── ios/                  # iOS-spezifische Konfiguration
├── web/                  # Web-spezifische Konfiguration
├── lib/
│   ├── core/            # Kern-Utilities und Exports
│   │   └── app_export.dart
│   ├── presentation/    # UI-Bildschirme
│   │   ├── dashboard/
│   │   ├── form_builder/
│   │   ├── visit_form_filling/
│   │   ├── contacts_management/
│   │   ├── contact_selection/
│   │   ├── form_template_selection/
│   │   ├── pdf_preview/
│   │   ├── user_profile/
│   │   ├── google_sign_in_screen/
│   │   └── splash_screen/
│   ├── services/        # Backend-Services
│   │   ├── supabase_service.dart
│   │   ├── auth_service.dart
│   │   ├── database_service.dart
│   │   └── google_contacts_service.dart
│   ├── routes/          # App-Routing
│   │   └── app_routes.dart
│   ├── theme/           # Theme-Konfiguration
│   │   └── app_theme.dart
│   ├── widgets/         # Wiederverwendbare UI-Komponenten
│   │   ├── custom_app_bar.dart
│   │   ├── custom_bottom_bar.dart
│   │   ├── custom_icon_widget.dart
│   │   ├── custom_image_widget.dart
│   │   └── custom_error_widget.dart
│   └── main.dart        # App-Einstiegspunkt
├── supabase/
│   └── migrations/      # Datenbank-Migrationen
│       └── 20251214174447_onsite_complete_schema.sql
├── assets/              # Statische Assets
│   └── images/
├── env.json             # Umgebungsvariablen (nicht im Git)
├── START_APP.bat        # Windows Batch Start-Script
├── START_APP.ps1        # Windows PowerShell Start-Script
├── pubspec.yaml         # Projekt-Abhängigkeiten
└── README.md           # Projektdokumentation
```

---

## 🔧 Hauptabhängigkeiten

| Kategorie | Paket | Version | Verwendung |
|-----------|-------|---------|------------|
| **Backend** | supabase_flutter | ^2.9.0 | Supabase-Integration |
| **Auth** | google_sign_in | ^6.2.1 | Google OAuth |
| **UI** | sizer | ^2.0.15 | Responsive Layouts |
| **Storage** | shared_preferences | ^2.2.2 | Lokale Datenspeicherung |
| **Networking** | http | ^1.2.0 | HTTP-Client (Google Contacts API) |
| **Charts** | fl_chart | ^0.65.0 | Datenvisualisierung |
| **Typography** | google_fonts | ^6.1.0 | Schriftarten |
| **PDF** | pdf | ^3.11.1 | PDF-Generierung |
| **Sharing** | share_plus | ^12.0.1 | Datei-Sharing |
| **Images** | cached_network_image | ^3.3.1 | Bild-Caching |
| **Connectivity** | connectivity_plus | ^6.1.4 | Netzwerk-Status |
| **Signature** | signature | ^5.5.0 | Signatur-Erfassung |
| **Image Picker** | image_picker | ^1.0.4 | Foto-Auswahl |

---

## 📊 Datenbankschema

### Haupttabellen

1. **user_profiles** - Benutzerprofile
   - Verbunden mit `auth.users`
   - Enthält Firmeninformationen und Rollen
   - Automatische Erstellung bei Registrierung

2. **contacts** - Kundenkontakte
   - Vollständige Kontaktinformationen (Name, E-Mail, Telefon, Firma)
   - Favoriten-System
   - Google Sync Support
   - Avatar-URLs

3. **form_templates** - Formularvorlagen
   - JSONB-basierte Felddefinitionen
   - Wiederverwendbare Strukturen
   - System- und Benutzervorlagen
   - Beschreibungen und Metadaten

4. **visits** - Kundenbesuche
   - Status-Tracking (Entwurf/Abgeschlossen/Synchronisiert)
   - JSONB-Formulardaten
   - Signatur-Support
   - Besuchsdatum und -zeit

5. **visit_photos** - Foto-Anhänge
   - Mehrere Fotos pro Besuch
   - Reihenfolge und Beschriftungen
   - URL-Speicherung

6. **pdf_reports** - Generierte Berichte
   - PDF-Speicherung
   - Metadaten (Erstellungsdatum, Besuch-ID)
   - Download-Links

---

## 🎨 Theming

Die App enthält ein umfassendes Theme-System mit hellen und dunklen Themes:

```dart
// Zugriff auf das aktuelle Theme
ThemeData theme = Theme.of(context);

// Theme-Farben verwenden
Color primaryColor = theme.colorScheme.primary;
```

Das Theme umfasst:
- Farbschemata für helle und dunkle Modi
- Typografie-Stile
- Button-Themes
- Input-Decoration-Themes
- Card- und Dialog-Themes

---

## 📱 Responsive Design

Die App ist mit responsivem Design unter Verwendung des Sizer-Pakets gebaut:

```dart
// Beispiel für responsive Größenanpassung
Container(
  width: 50.w, // 50% der Bildschirmbreite
  height: 20.h, // 20% der Bildschirmhöhe
  child: Text('Responsiver Container'),
)
```

---

## 🔒 Sicherheit

- **Row Level Security (RLS)**: Alle Tabellen sind durch RLS-Richtlinien geschützt
- **Authentifizierung**: Sichere E-Mail/Passwort und OAuth-Flows
- **Datenisolierung**: Benutzer können nur ihre eigenen Daten sehen
- **Sichere Speicherung**: Passwörter werden mit bcrypt gehasht
- **HTTPS**: Alle API-Kommunikation über HTTPS

---

## 🔐 Demo-Anmeldedaten

Nach Ausführung der Migration stehen folgende Test-Accounts zur Verfügung:

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Handwerker | max@mustermann.de | handwerk123 |
| Manager | lisa@schmidt.de | manager123 |

Diese werden auch im Anmeldebildschirm angezeigt.

---

## 🧪 Testen

### Unit-Tests ausführen
```bash
flutter test
```

### Integration-Tests
```bash
flutter test integration_test
```

### Code-Analyse
```bash
flutter analyze
```

**Aktueller Status:**
- ✅ **Fehler (Errors):** 0
- ✅ **Warnungen (Warnings):** 0
- ℹ️ **Info-Hinweise:** 21 (nur Style-Hinweise, keine funktionalen Probleme)

---

## 📦 Bereitstellung

### Android APK erstellen
```bash
flutter build apk --release --dart-define-from-file=env.json
```

### Android App Bundle (für Play Store)
```bash
flutter build appbundle --release --dart-define-from-file=env.json
```

### iOS Build
```bash
flutter build ios --release --dart-define-from-file=env.json
```

### Web Build
```bash
flutter build web --release --dart-define-from-file=env.json
```

---

## 🐛 Fehlerbehebung

### Supabase-Verbindungsfehler
- ✅ Überprüfen Sie `env.json` auf korrekte URL und Key
- ✅ Stellen Sie sicher, dass die Migration ausgeführt wurde
- ✅ Überprüfen Sie die Internetverbindung
- ✅ Prüfen Sie Supabase Dashboard → Logs

### Authentifizierungsprobleme
- ✅ Überprüfen Sie E-Mail-Bestätigungseinstellungen in Supabase
- ✅ Stellen Sie sicher, dass RLS-Richtlinien korrekt sind
- ✅ Prüfen Sie Supabase Auth-Logs im Dashboard
- ✅ Überprüfen Sie Google Cloud Console OAuth-Konfiguration
- ✅ Siehe `GOOGLE_OAUTH_CHECKLIST.md` für detaillierte Anleitung

### Google Contacts Import funktioniert nicht
- ✅ Überprüfen Sie, ob People API in Google Cloud Console aktiviert ist
- ✅ Stellen Sie sicher, dass `contacts.readonly` Scope hinzugefügt wurde
- ✅ Siehe `GOOGLE_CONTACTS_IMPORT_DE.md` für detaillierte Anleitung

### Build-Fehler
```bash
flutter clean
flutter pub get
flutter run --dart-define-from-file=env.json
```

### Layout-Overflow Fehler
- ✅ Alle Layout-Probleme wurden behoben
- ✅ Form Builder verwendet jetzt optimierte Layouts
- ✅ Responsive Design mit Sizer implementiert

---

## 📚 Zusätzliche Dokumentation

- **`GOOGLE_OAUTH_FIX_DE.md`** - Detaillierte Anleitung für Google OAuth Setup
- **`GOOGLE_OAUTH_CHECKLIST.md`** - Checkliste für OAuth-Konfiguration
- **`GOOGLE_CONTACTS_IMPORT_DE.md`** - Anleitung für Google Contacts Import
- **`APP_FULL_CHECK_REPORT.md`** - Vollständige App-Überprüfung
- **`QUICK_START.md`** - Schnellstart-Anleitung

---

## 🎯 Features im Detail

### Form Builder
- **Drag-and-Drop**: Felder per Drag-and-Drop sortieren
- **Feldtypen**: Text, Zahl, Datum, Dropdown, Checkbox, Notizen, Signatur
- **Einstellungen**: Label, Help-Text, Required/Optional, Validierung
- **Speicherung**: Direkt in Supabase gespeichert
- **Vorschau**: Echtzeit-Vorschau während der Erstellung

### Google Contacts Import
- **Automatisch**: Importiert automatisch nach Google Sign-In
- **Deduplizierung**: Verhindert doppelte Kontakte
- **Vollständig**: Name, E-Mail, Telefon, Firma, Avatar
- **Optional**: Funktioniert auch ohne Google Contacts

### Offline-Support
- **Besuche**: Besuche können offline erstellt werden
- **Auto-Sync**: Automatische Synchronisation bei Internet-Verbindung
- **Lokale Speicherung**: SharedPreferences für Offline-Daten

---

## 📝 Changelog

### Version 1.0.0 (Aktuell)
- ✅ Vollständige Authentifizierung (Google & Email/Password)
- ✅ Google Contacts Import
- ✅ Form Builder mit Drag-and-Drop
- ✅ Offline-fähige Besuchserfassung
- ✅ PDF-Generierung und Sharing
- ✅ Vollständige Kontaktverwaltung
- ✅ Dashboard mit Statistiken
- ✅ Benutzerprofil-Verwaltung
- ✅ Alle Layout-Probleme behoben
- ✅ BuildContext async gaps behoben
- ✅ Code-Qualität optimiert

---

## 📝 Lizenz

Dieses Projekt wurde mit [Rocket.new](https://rocket.new) erstellt.

---

## 🙏 Danksagungen

- Gebaut mit [Rocket.new](https://rocket.new)
- Unterstützt von [Flutter](https://flutter.dev) & [Dart](https://dart.dev)
- Backend von [Supabase](https://supabase.com)
- Gestaltet mit Material Design 3
- Icons von Material Icons

---

**Gebaut mit ❤️ auf Rocket.new**

**Status:** ✅ **PRODUKTIONSBEREIT** - Alle Funktionen implementiert und getestet
