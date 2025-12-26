# Google OAuth Setup für OnSite

## Übersicht
OnSite verwendet Google OAuth für die Authentifizierung und benötigt Zugriff auf Google Contacts für die Kundenverwaltung.

## 1. Google Cloud Console Setup

### Schritt 1: Projekt erstellen
1. Gehe zu https://console.cloud.google.com
2. Klicke auf "Neues Projekt erstellen"
3. Name: `OnSite Production`
4. Projekt-ID wird automatisch generiert

### Schritt 2: OAuth Consent Screen konfigurieren
1. Navigiere zu **APIs & Services** > **OAuth consent screen**
2. User Type: **External** auswählen
3. **App-Informationen:**
   - **App name: `OnSite Handwerker App`** ⚠️ WICHTIG: Dieser Name wird im Google Login-Dialog angezeigt statt der Supabase-URL
   - User support email: Deine Support-E-Mail
   - App logo: (optional) - Empfohlen: Logo hochladen für professionelleres Aussehen
   - App domain: `hw.sata26.cloud`
4. **App domain:**
   - Application home page: `https://hw.sata26.cloud`
   - Application privacy policy: `https://hw.sata26.cloud/datenschutz`
   - Application terms of service: `https://hw.sata26.cloud/impressum`
5. **Developer contact information:** Deine E-Mail
6. Klicke **Save and Continue**

**⚠️ WICHTIG für App-Name im Login-Dialog:**
- Der **App name** wird im Google OAuth Dialog angezeigt
- Stelle sicher, dass der Name klar und professionell ist: `OnSite Handwerker App`
- Nach der Konfiguration kann es einige Minuten dauern, bis der Name im Dialog erscheint
- Wenn die App noch im "Testing" Status ist, wird der Name möglicherweise nicht sofort angezeigt
- Für Produktion: App zur Verifizierung einreichen, damit der Name korrekt angezeigt wird

### Schritt 3: Scopes hinzufügen
1. Klicke **Add or Remove Scopes**
2. Füge folgende Scopes hinzu:
   ```
   .../auth/userinfo.email
   .../auth/userinfo.profile
   openid
   .../auth/contacts.readonly
   ```
3. **Wichtig:** `contacts.readonly` ist erforderlich für Google Contacts Import
4. Klicke **Update** und dann **Save and Continue**

### Schritt 4: Test Users hinzufügen
Während die App im "Testing" Status ist:
1. Klicke **Add Users**
2. Füge E-Mail-Adressen der Test-Benutzer hinzu:
   ```
   test1@example.com
   test2@example.com
   ```
3. Nur diese Benutzer können sich anmelden

### Schritt 5: OAuth 2.0 Client IDs erstellen
1. Navigiere zu **APIs & Services** > **Credentials**
2. Klicke **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `OnSite Web Client`
5. **Authorized JavaScript origins:**
   ```
   https://hw.sata26.cloud
   http://localhost:5173
   ```
6. **Authorized redirect URIs:**
   ```
   https://hw.sata26.cloud/auth/callback
   http://localhost:5173/auth/callback
   ```
7. Klicke **Create**
8. **Wichtig:** Speichere Client ID und Client Secret

### Schritt 6: People API aktivieren
1. Navigiere zu **APIs & Services** > **Library**
2. Suche nach "People API"
3. Klicke **Enable**

## 2. Supabase Auth Configuration

### Schritt 1: Provider hinzufügen
1. Gehe zu deinem Supabase Project Dashboard
2. Navigiere zu **Authentication** > **Providers**
3. Finde **Google** und klicke **Enable**

### Schritt 2: Client Credentials eingeben
1. **Client ID:** (aus Google Cloud Console)
2. **Client Secret:** (aus Google Cloud Console)
3. **Redirect URL:** Kopiere die Supabase URL:
   ```
   https://<your-project>.supabase.co/auth/v1/callback
   ```
4. Gehe zurück zur Google Cloud Console
5. Füge die Supabase Redirect URL zu **Authorized redirect URIs** hinzu
6. Klicke **Save**

## 3. Environment Variables

### Server (.env)
```env
SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
PORT=3001
```

### Client (.env)
```env
VITE_SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_API_URL=/api
```

## 4. Deployment auf Coolify

### Environment Variables setzen
Gehe zu Coolify Dashboard > OnSite App > Environment Variables:

```bash
SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
VITE_SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
```

## 5. Testing

### Test User Flow
1. Öffne `https://hw.sata26.cloud`
2. Klicke "Mit Google anmelden"
3. **Wenn "unverified app" Warning erscheint:**
   - Klicke "Advanced"
   - Klicke "Go to OnSite (unsafe)"
   - Dies ist normal während der Test-Phase
4. Autorisiere die App
5. Du solltest eingeloggt sein

### Troubleshooting

**Error: "redirect_uri_mismatch"**
- Überprüfe, dass alle Redirect URIs in Google Cloud Console korrekt sind
- Stelle sicher, dass Supabase Callback URL hinzugefügt wurde

**Error: "access_denied"**
- Stelle sicher, dass der Test-Benutzer in Google Cloud Console hinzugefügt wurde
- Überprüfe OAuth Consent Screen Status

**Error: "Invalid scope"**
- Überprüfe, dass alle erforderlichen Scopes hinzugefügt wurden
- People API muss aktiviert sein

## 6. Production Release

Um die App für alle Benutzer freizugeben:

1. Gehe zu **OAuth consent screen**
2. Klicke **Publish App**
3. **Wichtig:** Google wird die App überprüfen
4. Bereite folgendes vor:
   - App beschreibung
   - Screenshots
   - Datenschutzerklärung URL
   - Begründung für Contacts Scope

Die Überprüfung kann 1-2 Wochen dauern.

## 7. Sicherheit

- ✅ Verwende HTTPS in Production
- ✅ Speichere niemals Client Secret im Frontend
- ✅ OAuth wird über Supabase gehandhabt
- ✅ Access Tokens werden sicher gespeichert
- ✅ Alle API-Anfragen sind authentifiziert

## Support

Bei Problemen:
1. Überprüfe Browser Console auf Fehler
2. Überprüfe Supabase Logs
3. Überprüfe Server Logs in Coolify
4. Kontaktiere Support

