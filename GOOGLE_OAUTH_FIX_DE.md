# Google OAuth redirect_uri_mismatch Fehler beheben

## 🔴 Problem
Fehler 400: `redirect_uri_mismatch` beim Google Sign-In

Dieser Fehler tritt auf, wenn die Redirect-URI in der Google Cloud Console nicht mit der übereinstimmt, die Supabase verwendet.

## ✅ Lösung - Schritt für Schritt

### Schritt 1: Google Cloud Console öffnen

1. Öffnen Sie die [Google Cloud Console](https://console.cloud.google.com/)
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu **APIs & Services** → **Credentials**
4. Klicken Sie auf Ihre **OAuth 2.0 Client ID** (Web Client)

### Schritt 2: Redirect URIs konfigurieren

Fügen Sie **beide** folgenden URIs hinzu:

#### Autorisiert JavaScript-Ursprünge:
```
https://qlqvczcgjymyrfarvsgu.supabase.co
```

#### Autorisierte Weiterleitungs-URIs:
```
https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback
```

**WICHTIG:** 
- Die Supabase Callback-URL ist die, die Google verwendet
- Diese muss **genau** so eingegeben werden (mit `/auth/v1/callback` am Ende)
- Keine zusätzlichen Slashes oder Parameter
- Keine Trailing Slashes

### Schritt 3: Supabase Dashboard konfigurieren

1. Öffnen Sie Ihr [Supabase Dashboard](https://app.supabase.com/)
2. Gehen Sie zu **Authentication** → **Providers**
3. Klicken Sie auf **Google**
4. Stellen Sie sicher, dass:
   - Google Provider **aktiviert** ist (Toggle ON)
   - **Client ID (Web)** eingegeben ist (aus Google Cloud Console)
   - **Client Secret** eingegeben ist (aus Google Cloud Console)

### Schritt 4: Redirect URLs in Supabase konfigurieren

In Supabase unter **Authentication** → **URL Configuration**:

**Site URL:**
```
http://localhost:port
```
(oder Ihre Produktions-URL, z.B. `https://your-domain.com`)

**Redirect URLs:**
```
http://localhost:port/**
https://your-domain.com/**
```

**Hinweis:** Das `/**` am Ende bedeutet, dass alle Pfade unter dieser Domain akzeptiert werden.

### Schritt 5: Änderungen speichern

1. **Google Cloud Console:** Klicken Sie auf **Speichern**
2. **Supabase Dashboard:** Klicken Sie auf **Speichern**

### Schritt 6: Warten Sie 5-10 Minuten

Google Cloud Console-Änderungen können einige Minuten dauern, bis sie wirksam werden.

### Schritt 7: App neu starten

```bash
flutter run --dart-define-from-file=env.json
```

## 🔍 Wie der OAuth-Flow funktioniert

1. **Benutzer klickt "Mit Google anmelden"**
   - App sendet Anfrage an Supabase

2. **Supabase leitet zu Google weiter**
   - Supabase verwendet: `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`
   - Diese URL muss in Google Cloud Console registriert sein

3. **Google authentifiziert Benutzer**
   - Google leitet zurück zu Supabase Callback: `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`

4. **Supabase erstellt Session**
   - Supabase verarbeitet die OAuth-Antwort
   - Supabase leitet zurück zu Ihrer App (die `redirectTo` URL aus dem Code)

5. **App erkennt Session**
   - Auth State Listener erkennt die neue Session
   - Benutzer wird automatisch eingeloggt

## ⚠️ Häufige Fehler

### ❌ Falsch:
- Nur die App-URL in Google Cloud Console (z.B. `http://localhost:port`)
- Falsche Supabase-URL
- Fehlender `/auth/v1/callback` Pfad
- Trailing Slash am Ende (`/auth/v1/callback/`)
- Falsche Client ID oder Secret in Supabase

### ✅ Richtig:
- Supabase Callback-URL in Google Cloud Console: `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`
- Korrekte Client ID und Secret in Supabase
- Beide Redirect URLs konfiguriert
- Google Provider in Supabase aktiviert

## 🧪 Testen

1. App starten:
   ```bash
   flutter run --dart-define-from-file=env.json
   ```

2. "Mit Google anmelden" klicken
3. Google-Anmeldung abschließen
4. Sollte automatisch zurück zur App weiterleiten und einloggen

## 📞 Wenn es immer noch nicht funktioniert

1. **Überprüfen Sie die Browser-Konsole** (F12) für detaillierte Fehler
2. **Überprüfen Sie Supabase Logs** im Dashboard unter **Logs** → **Auth Logs**
3. **Warten Sie 5-10 Minuten** nach Änderungen in Google Cloud Console (Propagierung)
4. **Löschen Sie Browser-Cache** und Cookies
5. **Verwenden Sie einen Inkognito-Modus** zum Testen
6. **Überprüfen Sie, ob die Client ID in Supabase mit der in Google Cloud Console übereinstimmt**

## 🔐 Sicherheitshinweise

- **Niemals** die Client Secret in öffentlichen Repositories speichern
- Verwenden Sie unterschiedliche OAuth Clients für Entwicklung und Produktion
- Überprüfen Sie regelmäßig die Redirect URIs auf unerwartete Einträge

## 📚 Zusätzliche Ressourcen

- [Supabase Google Auth Dokumentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://app.supabase.com/)

