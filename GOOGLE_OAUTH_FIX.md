# Google OAuth redirect_uri_mismatch Fehler beheben

## 🔴 Problem
Fehler 400: `redirect_uri_mismatch` beim Google Sign-In

## ✅ Lösung

### Schritt 1: Google Cloud Console konfigurieren

1. Öffnen Sie die [Google Cloud Console](https://console.cloud.google.com/)
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu **APIs & Services** → **Credentials**
4. Klicken Sie auf Ihre **OAuth 2.0 Client ID** (Web Client)

### Schritt 2: Redirect URIs hinzufügen

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

### Schritt 3: Supabase Dashboard konfigurieren

1. Öffnen Sie Ihr [Supabase Dashboard](https://app.supabase.com/)
2. Gehen Sie zu **Authentication** → **Providers**
3. Klicken Sie auf **Google**
4. Stellen Sie sicher, dass:
   - Google Provider **aktiviert** ist
   - **Client ID (Web)** eingegeben ist (aus Google Cloud Console)
   - **Client Secret** eingegeben ist (aus Google Cloud Console)

### Schritt 4: Redirect URL in Supabase

In Supabase unter **Authentication** → **URL Configuration**:

**Site URL:**
```
http://localhost:port
```
(oder Ihre Produktions-URL)

**Redirect URLs:**
```
http://localhost:port/**
https://your-domain.com/**
```

### Schritt 5: App neu starten

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
   - Google leitet zurück zu Supabase Callback

4. **Supabase erstellt Session**
   - Supabase leitet zurück zu Ihrer App (die `redirectTo` URL)

5. **App erkennt Session**
   - Auth State Listener erkennt die neue Session
   - Benutzer wird eingeloggt

## ⚠️ Häufige Fehler

### ❌ Falsch:
- Nur die App-URL in Google Cloud Console
- Falsche Supabase-URL
- Fehlender `/auth/v1/callback` Pfad

### ✅ Richtig:
- Supabase Callback-URL in Google Cloud Console
- Korrekte Client ID und Secret in Supabase
- Beide Redirect URLs konfiguriert

## 🧪 Testen

1. App starten
2. "Mit Google anmelden" klicken
3. Google-Anmeldung abschließen
4. Sollte automatisch zurück zur App weiterleiten

## 📞 Wenn es immer noch nicht funktioniert

1. **Überprüfen Sie die Browser-Konsole** für detaillierte Fehler
2. **Überprüfen Sie Supabase Logs** im Dashboard
3. **Warten Sie 5-10 Minuten** nach Änderungen in Google Cloud Console (Propagierung)
4. **Löschen Sie Browser-Cache** und Cookies
5. **Verwenden Sie einen Inkognito-Modus** zum Testen

