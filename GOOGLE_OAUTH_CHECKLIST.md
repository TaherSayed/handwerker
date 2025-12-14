# ✅ Google OAuth redirect_uri_mismatch - Schritt-für-Schritt Checkliste

## 🔴 Problem
Fehler 400: `redirect_uri_mismatch` - Die Redirect-URI stimmt nicht überein

## 📋 Checkliste - Folgen Sie jedem Schritt genau

### ✅ Schritt 1: Google Cloud Console öffnen

- [ ] Gehen Sie zu: https://console.cloud.google.com/
- [ ] Wählen Sie das richtige Projekt aus
- [ ] Klicken Sie auf **APIs & Services** (links im Menü)
- [ ] Klicken Sie auf **Credentials**
- [ ] Finden Sie Ihre **OAuth 2.0 Client IDs**
- [ ] Klicken Sie auf die **Web Client ID** (nicht Android/iOS!)

### ✅ Schritt 2: Autorisiert JavaScript-Ursprünge hinzufügen

- [ ] Scrollen Sie zu **Autorisiert JavaScript-Ursprünge**
- [ ] Klicken Sie auf **+ URI hinzufügen**
- [ ] Geben Sie **genau** diese URL ein:
  ```
  https://qlqvczcgjymyrfarvsgu.supabase.co
  ```
- [ ] **KEIN** Slash am Ende!
- [ ] Klicken Sie auf **Speichern** (wenn vorhanden)

### ✅ Schritt 3: Autorisierte Weiterleitungs-URIs hinzufügen

- [ ] Scrollen Sie zu **Autorisiert Weiterleitungs-URIs**
- [ ] Klicken Sie auf **+ URI hinzufügen**
- [ ] Geben Sie **genau** diese URL ein:
  ```
  https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback
  ```
- [ ] **WICHTIG:** 
  - Muss mit `/auth/v1/callback` enden
  - **KEIN** Slash am Ende (`/auth/v1/callback/` ist FALSCH!)
  - **KEINE** Leerzeichen
  - **KEINE** zusätzlichen Parameter
- [ ] Klicken Sie auf **Speichern**

### ✅ Schritt 4: Supabase Dashboard öffnen

- [ ] Gehen Sie zu: https://app.supabase.com/
- [ ] Wählen Sie Ihr Projekt aus
- [ ] Klicken Sie auf **Authentication** (links im Menü)
- [ ] Klicken Sie auf **Providers**

### ✅ Schritt 5: Google Provider konfigurieren

- [ ] Finden Sie **Google** in der Liste
- [ ] Klicken Sie auf **Google** (oder den Toggle)
- [ ] Stellen Sie sicher, dass der Toggle **EIN** ist (grün/aktiviert)
- [ ] Öffnen Sie die Google-Konfiguration

### ✅ Schritt 6: Google OAuth Credentials eingeben

- [ ] **Client ID (Web):** 
  - Kopieren Sie die Client ID aus Google Cloud Console
  - Fügen Sie sie in Supabase ein
  - Format: `xxxxx.apps.googleusercontent.com`
  
- [ ] **Client Secret:**
  - Kopieren Sie das Client Secret aus Google Cloud Console
  - Fügen Sie es in Supabase ein
  - Format: `GOCSPX-xxxxx`

- [ ] Klicken Sie auf **Speichern**

### ✅ Schritt 7: Supabase Redirect URLs konfigurieren

- [ ] In Supabase: **Authentication** → **URL Configuration**
- [ ] **Site URL:** Geben Sie Ihre App-URL ein:
  ```
  http://localhost:port
  ```
  (Ersetzen Sie `port` mit Ihrer tatsächlichen Port-Nummer, z.B. `http://localhost:55463`)

- [ ] **Redirect URLs:** Fügen Sie hinzu:
  ```
  http://localhost:port/**
  ```
  (Das `/**` am Ende ist wichtig!)

- [ ] Klicken Sie auf **Speichern**

### ✅ Schritt 8: Warten Sie 5-10 Minuten

- [ ] Google Cloud Console-Änderungen benötigen Zeit zur Propagierung
- [ ] Warten Sie mindestens 5 Minuten
- [ ] Optional: Löschen Sie Browser-Cache und Cookies

### ✅ Schritt 9: App neu starten

- [ ] Stoppen Sie die laufende App (q im Terminal)
- [ ] Starten Sie die App neu:
  ```bash
  flutter run --dart-define-from-file=env.json
  ```

### ✅ Schritt 10: Testen

- [ ] Klicken Sie auf "Mit Google anmelden"
- [ ] Sie sollten zu Google weitergeleitet werden
- [ ] Nach der Anmeldung sollten Sie zurück zur App kommen
- [ ] Sie sollten automatisch eingeloggt sein

## 🔍 Debug-Informationen

Wenn Sie die App starten, sehen Sie in der Konsole:

```
📍 Redirect URL: http://localhost:port/
📍 Supabase URL: https://qlqvczcgjymyrfarvsgu.supabase.co
📍 Expected Google Redirect URI: https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback
⚠️ WICHTIG: Diese URL muss in Google Cloud Console eingetragen sein!
```

**Die "Expected Google Redirect URI" muss EXAKT in Google Cloud Console unter "Autorisiert Weiterleitungs-URIs" stehen!**

## ❌ Häufige Fehler

### Fehler 1: Falsche URL in Google Cloud Console
- ❌ `http://localhost:port` (App-URL)
- ✅ `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback` (Supabase Callback)

### Fehler 2: Trailing Slash
- ❌ `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback/`
- ✅ `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`

### Fehler 3: Falsche Client ID
- ❌ Android Client ID verwendet
- ❌ iOS Client ID verwendet
- ✅ Web Client ID verwenden

### Fehler 4: Google Provider nicht aktiviert
- ❌ Toggle ist AUS in Supabase
- ✅ Toggle muss EIN sein

### Fehler 5: Nicht genug gewartet
- ❌ Sofort nach Änderung getestet
- ✅ Mindestens 5 Minuten warten

## 🆘 Immer noch Probleme?

1. **Überprüfen Sie die Browser-Konsole (F12)**
   - Öffnen Sie die Entwicklertools
   - Gehen Sie zum Tab "Console"
   - Suchen Sie nach Fehlermeldungen

2. **Überprüfen Sie Supabase Logs**
   - Supabase Dashboard → Logs → Auth Logs
   - Suchen Sie nach Fehlermeldungen

3. **Überprüfen Sie die tatsächliche Redirect-URI**
   - In der Browser-Adressleiste nach dem Klick auf "Mit Google anmelden"
   - Die URL sollte `redirect_uri=...` enthalten
   - Vergleichen Sie diese mit der in Google Cloud Console

4. **Verwenden Sie Inkognito-Modus**
   - Öffnen Sie einen Inkognito/Private Browser-Tab
   - Testen Sie dort

5. **Kontaktieren Sie den Support**
   - Wenn nichts funktioniert, sammeln Sie:
     - Screenshot der Google Cloud Console Redirect URIs
     - Screenshot der Supabase Provider-Konfiguration
     - Browser-Konsolen-Fehler
     - Supabase Auth Logs

