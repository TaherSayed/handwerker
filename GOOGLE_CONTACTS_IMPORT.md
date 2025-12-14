# 📇 Google Kontakte automatisch importieren

> 🇩🇪 **Deutsche Anleitung:** Siehe [GOOGLE_CONTACTS_IMPORT_DE.md](GOOGLE_CONTACTS_IMPORT_DE.md) für detaillierte deutsche Anweisungen!

## ✅ Was wurde implementiert

Die App importiert jetzt **automatisch Ihre Google Kontakte** nach dem Google Sign-In!

### Features:
- ✅ Automatischer Import nach Google Sign-In
- ✅ Kontakte werden in Supabase gespeichert
- ✅ Duplikate werden automatisch übersprungen
- ✅ Funktioniert auf Web und Mobile
- ✅ Keine Fehler, wenn Import fehlschlägt (non-critical)

## 🔧 Google Cloud Console Konfiguration

### Schritt 1: People API aktivieren

1. Öffnen Sie [Google Cloud Console](https://console.cloud.google.com/)
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu **APIs & Services** → **Library** (oder **APIs & Dienste** → **Bibliothek** auf Deutsch)
4. Suchen Sie nach **"People API"**
5. Klicken Sie auf **"People API"**
6. Klicken Sie auf **"Enable"** (oder **"AKTIVIEREN"** auf Deutsch)

### Schritt 2: OAuth Scopes hinzufügen

1. Gehen Sie zu **APIs & Services** → **OAuth consent screen** (oder **APIs & Dienste** → **OAuth-Einwilligungsbildschirm** auf Deutsch)
2. Klicken Sie auf **"Scopes"** im linken Menü
3. Klicken Sie auf **"+ ADD OR REMOVE SCOPES"** (oder **"+ BEREICH HINZUFÜGEN ODER ENTFERNEN"** auf Deutsch)
4. Fügen Sie hinzu:
   - `https://www.googleapis.com/auth/contacts.readonly`
   - Geben Sie dies im Feld **"Manually add a scope"** (oder **"Manuell einen Bereich hinzufügen"**) ein
5. Klicken Sie auf **"UPDATE"** (oder **"AKTUALISIEREN"**) und dann **"SAVE AND CONTINUE"** (oder **"SPEICHERN UND WEITER"**)

### Schritt 3: OAuth Client Scopes aktualisieren

1. Gehen Sie zu **APIs & Services** → **Credentials**
2. Klicken Sie auf Ihre **OAuth 2.0 Client ID** (Web Client)
3. Stellen Sie sicher, dass die Scopes in der OAuth Consent Screen konfiguriert sind

## 📝 Wie es funktioniert

### Mobile (Native Google Sign-In):
1. Benutzer meldet sich mit Google an
2. App fragt nach Berechtigung für Kontakte (`contacts.readonly`)
3. Nach erfolgreicher Anmeldung werden Kontakte automatisch importiert
4. Kontakte werden in Supabase gespeichert
5. Kontakte erscheinen in der App

### Web (OAuth Flow):
1. Benutzer meldet sich mit Google an
2. Supabase erhält Access Token von Google
3. App verwendet Access Token zum Abrufen der Kontakte
4. Kontakte werden in Supabase gespeichert
5. Kontakte erscheinen in der App

## 🔍 Was wird importiert

Für jeden Kontakt werden importiert:
- ✅ **Name** (Vollständiger Name)
- ✅ **E-Mail** (Primäre E-Mail-Adresse)
- ✅ **Telefon** (Primäre Telefonnummer)
- ✅ **Firma** (Organisation/Unternehmen)
- ✅ **Foto** (Profilbild, falls vorhanden)

## ⚠️ Wichtige Hinweise

### Berechtigungen:
- Die App benötigt **nur Leseberechtigung** für Kontakte
- Ihre Kontakte werden **nur in Ihrer Supabase-Datenbank** gespeichert
- Die App kann **keine Kontakte in Google ändern oder löschen**

### Duplikate:
- Kontakte mit derselben E-Mail oder demselben Namen werden übersprungen
- Sie sehen nur neue Kontakte, die noch nicht in der Datenbank sind

### Fehlerbehandlung:
- Wenn der Import fehlschlägt, wird die Anmeldung **nicht** blockiert
- Fehler werden in der Konsole protokolliert
- Die App funktioniert normal, auch wenn keine Kontakte importiert werden

## 🧪 Testen

1. **People API aktivieren** (siehe oben)
2. **OAuth Scopes hinzufügen** (siehe oben)
3. **App neu starten:**
   ```bash
   flutter run --dart-define-from-file=env.json
   ```
4. **Mit Google anmelden**
5. **Kontakte-Tab öffnen**
6. **Ihre Google Kontakte sollten jetzt angezeigt werden!**

## 🐛 Fehlerbehebung

### "Keine Kontakte gefunden"
- **Ursache:** People API nicht aktiviert oder keine Kontakte in Google Account
- **Lösung:** 
  1. Aktivieren Sie People API in Google Cloud Console
  2. Überprüfen Sie, ob Sie Kontakte in Ihrem Google Account haben

### "Access Token fehlt"
- **Ursache:** OAuth Scopes nicht konfiguriert
- **Lösung:** Fügen Sie `contacts.readonly` Scope in OAuth Consent Screen hinzu

### "403 Forbidden"
- **Ursache:** People API nicht aktiviert
- **Lösung:** Aktivieren Sie People API in Google Cloud Console

### Kontakte werden nicht importiert
- **Ursache:** Berechtigung nicht erteilt oder Scope fehlt
- **Lösung:**
  1. Überprüfen Sie OAuth Consent Screen Scopes
  2. Melden Sie sich ab und wieder an
  3. Erteilen Sie die Kontakt-Berechtigung

## 📊 Überprüfen ob Kontakte importiert wurden

1. **Supabase Dashboard öffnen**
   - Gehen Sie zu: https://app.supabase.com/
   - Table Editor → `contacts` Tabelle
   - Sie sollten Ihre importierten Kontakte sehen

2. **App öffnen**
   - Gehen Sie zum **Kontakte-Tab**
   - Ihre Google Kontakte sollten angezeigt werden

## 💡 Tipp

Nach dem ersten Import können Sie jederzeit manuell aktualisieren:
- Ziehen Sie im Kontakte-Tab nach unten zum Aktualisieren
- Oder melden Sie sich ab und wieder an

## 🔐 Datenschutz

- ✅ Kontakte werden nur in Ihrer Supabase-Datenbank gespeichert
- ✅ Nur Sie können Ihre Kontakte sehen
- ✅ Die App verwendet nur Leseberechtigung
- ✅ Keine Kontakte werden an Dritte weitergegeben

