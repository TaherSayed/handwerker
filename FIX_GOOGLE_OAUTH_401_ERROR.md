# 🔴 Google OAuth "401: invalid_client" Fehler beheben

## Problem

Fehler: **"401: invalid_client"** beim Google Sign-In

Dies bedeutet, dass die **Google Client ID** oder das **Client Secret** falsch konfiguriert ist.

---

## ✅ Lösung Schritt für Schritt

### Schritt 1: Google Cloud Console öffnen

1. Gehen Sie zu: **https://console.cloud.google.com/**
2. **WICHTIG:** Wählen Sie das **RICHTIGE Projekt** aus (oben links)
3. Gehen Sie zu: **APIs & Services** → **Credentials**

### Schritt 2: Web Client ID finden

1. In der Liste "OAuth 2.0 Client IDs" finden Sie verschiedene Clients
2. **WICHTIG:** Klicken Sie auf die Zeile, die **"Web client"** oder **"Web application"** heißt
   - ❌ NICHT "Android client"
   - ❌ NICHT "iOS client"
   - ✅ NUR "Web client" oder "Web application"
3. Klicken Sie darauf, um die Details zu öffnen
4. **Kopieren Sie die Client ID** (sieht aus wie: `123456789-abc.apps.googleusercontent.com`)

### Schritt 3: Client Secret finden

1. Im selben Formular (Web Client Details)
2. Scrollen Sie zu **"Client Secret"** oder **"Clientschlüssel"**
3. Falls Sie `***` sehen, klicken Sie auf **"Show"** oder **"Anzeigen"**
4. **Kopieren Sie das Client Secret** (beginnt mit `GOCSPX-`)

### Schritt 4: Supabase konfigurieren

1. Gehen Sie zu: **https://app.supabase.com/**
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu: **Authentication** → **Providers**
4. Klicken Sie auf **"Google"**
5. Stellen Sie sicher, dass Google **aktiviert** ist (Toggle EIN)
6. Fügen Sie ein:
   - **Client ID (Web):** Die kopierte Client ID aus Schritt 2
   - **Client Secret:** Das kopierte Client Secret aus Schritt 3
7. Klicken Sie auf **"Save"** oder **"Speichern"**

### Schritt 5: env.json aktualisieren

1. Öffnen Sie `env.json` im Projekt-Root
2. Stellen Sie sicher, dass `GOOGLE_WEB_CLIENT_ID` die **GLEICHE Client ID** wie in Supabase hat:
   ```json
   {
     "SUPABASE_URL": "https://your-project.supabase.co",
     "SUPABASE_ANON_KEY": "your-anon-key",
     "GOOGLE_WEB_CLIENT_ID": "123456789-abc.apps.googleusercontent.com"
   }
   ```
3. **WICHTIG:** Die Client ID muss **EXAKT** mit der in Supabase übereinstimmen!

### Schritt 6: App neu starten

1. Stoppen Sie die laufende App (drücken Sie `q` im Terminal)
2. Starten Sie die App neu:
   ```bash
   flutter run --dart-define-from-file=env.json --web-port=8080
   ```
   Oder verwenden Sie:
   ```bash
   START_APP_FIXED_PORT.bat
   ```

---

## ❌ Häufige Fehler

### Fehler 1: Falsche Client ID verwendet

**Problem:**
- ❌ Android Client ID verwendet
- ❌ iOS Client ID verwendet
- ❌ Client ID aus einem anderen Projekt verwendet

**Lösung:**
- ✅ Verwenden Sie **NUR** die **Web Client ID**
- ✅ Stellen Sie sicher, dass Client ID und Secret aus dem **SELBEN Projekt** stammen

### Fehler 2: Client ID und Secret gehören nicht zusammen

**Problem:**
- ❌ Client ID aus Projekt A, Secret aus Projekt B
- ❌ Client ID und Secret aus verschiedenen OAuth Clients

**Lösung:**
- ✅ Client ID und Secret müssen aus dem **SELBEN OAuth Client** stammen
- ✅ Beide müssen "Web client" oder "Web application" sein

### Fehler 3: Client Secret fehlt in Supabase

**Problem:**
- ❌ Nur Client ID in Supabase eingetragen
- ❌ Client Secret leer oder falsch

**Lösung:**
- ✅ Beide müssen in Supabase eingetragen sein
- ✅ Client Secret beginnt mit `GOCSPX-`

### Fehler 4: Client ID in env.json stimmt nicht überein

**Problem:**
- ❌ Verschiedene Client IDs in Supabase und env.json
- ❌ Client ID in env.json ist leer oder falsch

**Lösung:**
- ✅ Die Client ID in `env.json` muss **EXAKT** mit der in Supabase übereinstimmen
- ✅ Beide müssen die **Web Client ID** sein

### Fehler 5: Falsches Projekt in Google Cloud Console

**Problem:**
- ❌ Sie haben die Client ID aus einem anderen Google Cloud Projekt verwendet

**Lösung:**
- ✅ Stellen Sie sicher, dass Sie im **RICHTIGEN Projekt** sind
- ✅ Die Client ID muss aus dem Projekt stammen, das Sie für Supabase verwenden

---

## 🔍 Überprüfung: Ist alles korrekt?

### Checkliste:

- [ ] Google Cloud Console geöffnet
- [ ] **RICHTIGES Projekt** ausgewählt
- [ ] **Web Client ID** gefunden (nicht Android/iOS)
- [ ] **Client ID** kopiert (Format: `xxx.apps.googleusercontent.com`)
- [ ] **Client Secret** kopiert (Format: `GOCSPX-xxx`)
- [ ] Beide in **Supabase** eingetragen
- [ ] Google Provider in Supabase **aktiviert** (Toggle EIN)
- [ ] **GLEICHE Client ID** in `env.json` wie in Supabase
- [ ] App neu gestartet

---

## 🆘 Immer noch Probleme?

### Option 1: Neue OAuth Client ID erstellen

Wenn nichts funktioniert, erstellen Sie eine neue:

1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Klicken Sie auf **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Wählen Sie **"Web application"**
4. Geben Sie einen Namen ein (z.B. "OnSite Web Client")
5. Unter **"Authorized JavaScript origins"**:
   - `https://qlqvczcgjymyrfarvsgu.supabase.co`
6. Unter **"Authorized redirect URIs"**:
   - `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`
7. Klicken Sie auf **"CREATE"**
8. **Kopieren Sie die neue Client ID und das Secret**
9. Aktualisieren Sie Supabase und env.json mit den neuen Werten

### Option 2: Client Secret neu generieren

Falls das Client Secret verloren gegangen ist:

1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Klicken Sie auf Ihre **Web Client ID**
3. Scrollen Sie zu **"Client Secret"**
4. Falls vorhanden, klicken Sie auf **"RESET"** oder **"REGENERATE"**
5. **Kopieren Sie das neue Secret**
6. Aktualisieren Sie Supabase mit dem neuen Secret

### Option 3: Überprüfen Sie die Browser-Konsole

1. Drücken Sie **F12** im Browser
2. Gehen Sie zum Tab **"Console"**
3. Suchen Sie nach Fehlermeldungen
4. Kopieren Sie die vollständige Fehlermeldung

---

## 📞 Wenn NICHTS funktioniert

Sammeln Sie diese Informationen:

1. **Screenshot** der Google Cloud Console "Web Client" Details (mit Client ID sichtbar)
2. **Screenshot** der Supabase Google Provider-Konfiguration
3. **Screenshot** der `env.json` (Client ID Teil - ohne das Secret!)
4. **Vollständige Fehlermeldung** aus der Browser-Konsole (F12)

Mit diesen Informationen kann Ihnen besser geholfen werden.

---

## ✅ Schnelllösung (Zusammenfassung)

1. **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Klicken Sie auf **"Web client"** (nicht Android/iOS!)
3. **Kopieren Sie Client ID** und **Client Secret**
4. **Supabase** → **Authentication** → **Providers** → **Google**
5. Fügen Sie **beide** ein und speichern Sie
6. **env.json**: Stellen Sie sicher, dass `GOOGLE_WEB_CLIENT_ID` die **GLEICHE** Client ID hat
7. **App neu starten**

Das sollte das Problem beheben!




