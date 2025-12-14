# 🔴 redirect_uri_mismatch - EXAKTE Lösung

## ⚠️ WICHTIG: Lesen Sie diese Anleitung komplett durch!

Der Fehler bedeutet: **Die Redirect-URI in Google Cloud Console stimmt NICHT mit der überein, die Supabase verwendet.**

---

## 📍 SCHRITT 1: Google Cloud Console öffnen

1. Gehen Sie zu: **https://console.cloud.google.com/**
2. Wählen Sie oben links **Ihr Projekt** aus
3. Klicken Sie im linken Menü auf: **APIs & Services**
4. Klicken Sie auf: **Credentials**
5. Sie sehen eine Liste mit "OAuth 2.0 Client IDs"
6. **WICHTIG:** Klicken Sie auf die Zeile, die **"Web client"** oder **"Web application"** heißt
   - ❌ NICHT auf "Android client"
   - ❌ NICHT auf "iOS client"
   - ✅ NUR auf "Web client" oder "Web application"

---

## 📍 SCHRITT 2: Redirect URI hinzufügen

Nachdem Sie auf "Web client" geklickt haben, sehen Sie ein Formular.

### A) Autorisiert JavaScript-Ursprünge

1. Scrollen Sie zu **"Autorisiert JavaScript-Ursprünge"**
2. Klicken Sie auf **"+ URI hinzufügen"** (oder das Plus-Symbol)
3. Geben Sie **EXAKT** diese URL ein (kopieren Sie sie):
   ```
   https://qlqvczcgjymyrfarvsgu.supabase.co
   ```
4. **WICHTIG:**
   - ✅ Beginnt mit `https://`
   - ✅ Kein Slash am Ende
   - ✅ Keine Leerzeichen

### B) Autorisierte Weiterleitungs-URIs

1. Scrollen Sie zu **"Autorisiert Weiterleitungs-URIs"**
2. Klicken Sie auf **"+ URI hinzufügen"** (oder das Plus-Symbol)
3. Geben Sie **EXAKT** diese URL ein (kopieren Sie sie):
   ```
   https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback
   ```
4. **WICHTIG:**
   - ✅ Beginnt mit `https://`
   - ✅ Endet mit `/auth/v1/callback`
   - ✅ **KEIN** Slash nach `callback` (also NICHT `/auth/v1/callback/`)
   - ✅ Keine Leerzeichen
   - ✅ Keine zusätzlichen Parameter

### C) Speichern

1. Scrollen Sie nach unten
2. Klicken Sie auf **"SPEICHERN"** (oder "Save")
3. Warten Sie, bis "Gespeichert" oder "Saved" angezeigt wird

---

## 📍 SCHRITT 3: Supabase Dashboard öffnen

1. Gehen Sie zu: **https://app.supabase.com/**
2. Wählen Sie Ihr Projekt aus (falls mehrere vorhanden)
3. Klicken Sie im linken Menü auf: **Authentication**
4. Klicken Sie auf: **Providers**

---

## 📍 SCHRITT 4: Google Provider aktivieren

1. Sie sehen eine Liste mit verschiedenen Providern (Google, GitHub, etc.)
2. Finden Sie **"Google"** in der Liste
3. Klicken Sie auf den **Toggle/Schalter** neben "Google"
   - Der Toggle muss **GRÜN** oder **EIN** sein
   - Falls er grau/aus ist, klicken Sie darauf, um ihn zu aktivieren

---

## 📍 SCHRITT 5: Google OAuth Credentials eingeben

Nachdem Sie Google aktiviert haben, öffnet sich ein Formular.

### A) Client ID (Web) finden

1. Gehen Sie zurück zu **Google Cloud Console**
2. In der "OAuth 2.0 Client IDs" Liste
3. Klicken Sie wieder auf **"Web client"**
4. Sie sehen ein Feld **"Client-ID"**
5. **Kopieren Sie diese Client-ID** (sie sieht aus wie: `123456789-abc.apps.googleusercontent.com`)

### B) Client Secret finden

1. Im selben Formular in Google Cloud Console
2. Scrollen Sie zu **"Clientschlüssel"** oder **"Client Secret"**
3. Falls Sie `***` sehen, klicken Sie auf **"Clientschlüssel anzeigen"** oder **"Show"**
4. **Kopieren Sie das Client Secret** (es beginnt mit `GOCSPX-`)

### C) In Supabase eintragen

1. Gehen Sie zurück zu **Supabase Dashboard**
2. Im Google Provider Formular:
   - **Client ID (Web):** Fügen Sie die kopierte Client-ID ein
   - **Client Secret:** Fügen Sie das kopierte Client Secret ein
3. Klicken Sie auf **"Speichern"** oder **"Save"**

---

## 📍 SCHRITT 6: Supabase Redirect URLs konfigurieren

1. Im Supabase Dashboard: **Authentication** → **URL Configuration**
2. **Site URL:** Geben Sie ein:
   ```
   http://localhost:55463
   ```
   (Ersetzen Sie `55463` mit Ihrer tatsächlichen Port-Nummer - sehen Sie in der Flutter-Konsole)

3. **Redirect URLs:** Klicken Sie auf **"+ Add URL"** und fügen Sie hinzu:
   ```
   http://localhost:55463/**
   ```
   (Das `/**` am Ende ist wichtig! Ersetzen Sie `55463` mit Ihrer Port-Nummer)

4. Klicken Sie auf **"Speichern"**

---

## 📍 SCHRITT 7: WARTEN

- ⏰ **Warten Sie mindestens 5-10 Minuten**
- Google Cloud Console-Änderungen benötigen Zeit zur Propagierung
- Setzen Sie einen Timer, um sicherzustellen, dass Sie genug gewartet haben

---

## 📍 SCHRITT 8: Browser-Cache löschen

1. Drücken Sie **Ctrl + Shift + Delete** (Windows) oder **Cmd + Shift + Delete** (Mac)
2. Wählen Sie **"Cookies und andere Websitedaten"** oder **"Cached images and files"**
3. Klicken Sie auf **"Daten löschen"** oder **"Clear data"**

---

## 📍 SCHRITT 9: App neu starten

1. Stoppen Sie die laufende App (drücken Sie `q` im Terminal)
2. Starten Sie die App neu:
   ```bash
   flutter run --dart-define-from-file=env.json
   ```
3. Warten Sie, bis die App vollständig geladen ist

---

## 📍 SCHRITT 10: Testen

1. Klicken Sie auf **"Mit Google anmelden"**
2. Sie sollten zu Google weitergeleitet werden
3. Wählen Sie Ihr Google-Konto aus
4. Klicken Sie auf **"Zulassen"** oder **"Allow"**
5. Sie sollten automatisch zurück zur App kommen und eingeloggt sein

---

## 🔍 Überprüfung: Was Sie in der Konsole sehen sollten

Wenn Sie die App starten, sehen Sie in der Flutter-Konsole:

```
🔐 Starting Google OAuth flow for web...
📍 Redirect URL: http://localhost:55463/
📍 Supabase URL: https://qlqvczcgjymyrfarvsgu.supabase.co
📍 Expected Google Redirect URI: https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback
⚠️ WICHTIG: Diese URL muss in Google Cloud Console eingetragen sein!
```

**Die "Expected Google Redirect URI" muss EXAKT in Google Cloud Console unter "Autorisiert Weiterleitungs-URIs" stehen!**

---

## ❌ Häufige Fehler - Überprüfen Sie diese

### Fehler 1: Falsche Client-ID verwendet
- ❌ Sie haben die Android Client-ID verwendet
- ❌ Sie haben die iOS Client-ID verwendet
- ✅ Sie MÜSSEN die **Web Client-ID** verwenden

### Fehler 2: Falsche URL in Google Cloud Console
- ❌ `http://localhost:55463` (Ihre App-URL)
- ❌ `https://qlqvczcgjymyrfarvsgu.supabase.co` (ohne `/auth/v1/callback`)
- ✅ `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback` (mit `/auth/v1/callback`)

### Fehler 3: Trailing Slash
- ❌ `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback/` (mit Slash am Ende)
- ✅ `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback` (ohne Slash am Ende)

### Fehler 4: Google Provider nicht aktiviert
- ❌ Der Toggle in Supabase ist AUS/grau
- ✅ Der Toggle muss EIN/grün sein

### Fehler 5: Nicht genug gewartet
- ❌ Sie haben sofort nach der Änderung getestet
- ✅ Sie müssen mindestens 5-10 Minuten warten

### Fehler 6: Falsche Projekt-ID
- ❌ Sie haben die Client-ID aus einem anderen Google Cloud Projekt verwendet
- ✅ Die Client-ID und das Secret müssen aus dem SELBEN Projekt sein

---

## 🆘 Immer noch Probleme?

### Option 1: Browser-Konsole prüfen

1. Drücken Sie **F12** im Browser
2. Gehen Sie zum Tab **"Console"**
3. Suchen Sie nach Fehlermeldungen
4. Kopieren Sie die Fehlermeldung

### Option 2: Supabase Logs prüfen

1. Supabase Dashboard → **Logs** → **Auth Logs**
2. Suchen Sie nach Fehlermeldungen
3. Kopieren Sie die Fehlermeldung

### Option 3: Redirect-URI überprüfen

1. Klicken Sie auf "Mit Google anmelden"
2. Schauen Sie in die Browser-Adressleiste
3. Die URL sollte `redirect_uri=...` enthalten
4. Kopieren Sie diese URL
5. Vergleichen Sie sie mit der in Google Cloud Console eingetragenen URL
6. Sie müssen **EXAKT** übereinstimmen!

---

## ✅ Checkliste - Markieren Sie jeden Punkt

- [ ] Google Cloud Console geöffnet
- [ ] Web Client ID ausgewählt (nicht Android/iOS)
- [ ] JavaScript-Ursprung hinzugefügt: `https://qlqvczcgjymyrfarvsgu.supabase.co`
- [ ] Redirect URI hinzugefügt: `https://qlqvczcgjymyrfarvsgu.supabase.co/auth/v1/callback`
- [ ] In Google Cloud Console gespeichert
- [ ] Supabase Dashboard geöffnet
- [ ] Google Provider aktiviert (Toggle EIN)
- [ ] Client ID (Web) in Supabase eingetragen
- [ ] Client Secret in Supabase eingetragen
- [ ] In Supabase gespeichert
- [ ] Supabase Redirect URLs konfiguriert
- [ ] 5-10 Minuten gewartet
- [ ] Browser-Cache gelöscht
- [ ] App neu gestartet
- [ ] Getestet

---

## 📞 Wenn NICHTS funktioniert

Sammeln Sie diese Informationen:

1. **Screenshot** der Google Cloud Console "Autorisiert Weiterleitungs-URIs"
2. **Screenshot** der Supabase Google Provider-Konfiguration
3. **Screenshot** der Browser-Konsole (F12 → Console)
4. **Screenshot** der Flutter-Konsole mit den Debug-Meldungen

Mit diesen Informationen kann Ihnen besser geholfen werden.

