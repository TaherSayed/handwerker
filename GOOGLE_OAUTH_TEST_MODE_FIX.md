# 🔴 Google OAuth Test-Modus Problem beheben

## Problem

Fehler: **"Zugriff blockiert: Die Überprüfung von qlqvczcgjymyrfarvsgu.supabase.co durch Google wurde nicht abgeschlossen"**

**Error 403: access_denied**

Die App befindet sich im **Testmodus** und nur genehmigte Tester haben Zugriff.

---

## ✅ Lösung 1: Test-Benutzer hinzufügen (Schnellste Lösung)

### Schritt 1: Google Cloud Console öffnen

1. Gehen Sie zu: **https://console.cloud.google.com/**
2. Wählen Sie Ihr Projekt aus
3. Klicken Sie im linken Menü auf: **APIs & Services**
4. Klicken Sie auf: **OAuth consent screen**

### Schritt 2: Test-Benutzer hinzufügen

1. Scrollen Sie nach unten zu **"Test users"** (Test-Benutzer)
2. Klicken Sie auf **"+ ADD USERS"** (Benutzer hinzufügen)
3. Geben Sie die E-Mail-Adresse ein: **tahersayed1606@gmail.com**
4. Klicken Sie auf **"ADD"** (Hinzufügen)
5. Klicken Sie auf **"SAVE"** (Speichern)

### Schritt 3: Warten Sie 2-3 Minuten

- Google benötigt Zeit, um die Änderungen zu verarbeiten
- Warten Sie mindestens 2-3 Minuten

### Schritt 4: Erneut testen

1. Öffnen Sie die App
2. Klicken Sie auf "Mit Google anmelden"
3. Sie sollten jetzt Zugriff haben

---

## ✅ Lösung 2: App auf "In Produktion" setzen (Für alle Benutzer)

**⚠️ WICHTIG:** Diese Option ist nur verfügbar, wenn:
- Ihre App alle Google-Verifizierungsanforderungen erfüllt
- Sie eine verifizierte Domain haben
- Sie die Datenschutzerklärung und Nutzungsbedingungen bereitgestellt haben

### Schritt 1: OAuth Consent Screen konfigurieren

1. Gehen Sie zu: **https://console.cloud.google.com/**
2. Wählen Sie Ihr Projekt aus
3. **APIs & Services** → **OAuth consent screen**

### Schritt 2: App-Informationen ausfüllen

Füllen Sie alle **Pflichtfelder** aus:

- **App name** (App-Name): z.B. "OnSite"
- **User support email** (Support-E-Mail): Ihre E-Mail
- **Developer contact information** (Entwickler-Kontakt): Ihre E-Mail
- **App domain** (App-Domain): Ihre Domain (falls vorhanden)
- **Authorized domains** (Autorisierte Domains): Ihre Domain
- **Privacy policy URL** (Datenschutzerklärung): URL zu Ihrer Datenschutzerklärung
- **Terms of service URL** (Nutzungsbedingungen): URL zu Ihren Nutzungsbedingungen

### Schritt 3: Scopes hinzufügen

1. Scrollen Sie zu **"Scopes"**
2. Klicken Sie auf **"ADD OR REMOVE SCOPES"**
3. Fügen Sie folgende Scopes hinzu:
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/contacts.readonly`
4. Klicken Sie auf **"UPDATE"**

### Schritt 4: App veröffentlichen

1. Scrollen Sie nach oben
2. Klicken Sie auf **"PUBLISH APP"** (App veröffentlichen)
3. Bestätigen Sie die Veröffentlichung

**⚠️ HINWEIS:** 
- Die Veröffentlichung kann mehrere Tage dauern
- Google prüft Ihre App
- Sie erhalten eine E-Mail, wenn die Veröffentlichung abgeschlossen ist

---

## ✅ Lösung 3: Temporäre Lösung - Eigene E-Mail als Tester hinzufügen

Wenn Sie schnell testen möchten:

1. **Google Cloud Console** → **APIs & Services** → **OAuth consent screen**
2. Scrollen Sie zu **"Test users"**
3. Klicken Sie auf **"+ ADD USERS"**
4. Fügen Sie **Ihre eigene E-Mail-Adresse** hinzu
5. Klicken Sie auf **"SAVE"**
6. Warten Sie 2-3 Minuten
7. Testen Sie erneut

---

## 🔍 Überprüfung: Ist die App im Testmodus?

1. Gehen Sie zu: **https://console.cloud.google.com/**
2. **APIs & Services** → **OAuth consent screen**
3. Schauen Sie oben rechts:
   - **"Testing"** = App ist im Testmodus (nur Tester haben Zugriff)
   - **"In production"** = App ist veröffentlicht (alle haben Zugriff)

---

## 📋 Checkliste - Test-Benutzer hinzufügen

- [ ] Google Cloud Console geöffnet
- [ ] Projekt ausgewählt
- [ ] OAuth consent screen geöffnet
- [ ] Zu "Test users" gescrollt
- [ ] E-Mail-Adresse hinzugefügt: **tahersayed1606@gmail.com**
- [ ] Gespeichert
- [ ] 2-3 Minuten gewartet
- [ ] Erneut getestet

---

## 🆘 Immer noch Probleme?

### Problem 1: "Test users" Sektion nicht sichtbar

**Lösung:**
- Stellen Sie sicher, dass Sie im richtigen Projekt sind
- Die App muss im "Testing" Modus sein
- Wenn die App bereits "In production" ist, sollten alle Benutzer Zugriff haben

### Problem 2: E-Mail wurde hinzugefügt, aber funktioniert nicht

**Lösung:**
- Warten Sie länger (5-10 Minuten)
- Löschen Sie Browser-Cache und Cookies
- Versuchen Sie es in einem Inkognito-Fenster
- Stellen Sie sicher, dass Sie die richtige E-Mail-Adresse verwendet haben

### Problem 3: App kann nicht veröffentlicht werden

**Lösung:**
- Verwenden Sie Lösung 1 (Test-Benutzer hinzufügen)
- Oder wenden Sie sich an Google Support für Verifizierung

---

## 📞 Weitere Hilfe

Wenn nichts funktioniert:

1. **Screenshot** des OAuth consent screen (mit Test users Sektion)
2. **Screenshot** der Fehlermeldung
3. **E-Mail-Adresse**, die Sie hinzufügen möchten

Mit diesen Informationen kann Ihnen besser geholfen werden.

