# 🔧 OAuth Callback für Rocket Preview URL beheben

## 🔴 Problem

Nach dem Google Sign-In werden Sie zu `https://preview.builtwithrocket.new/onsite-8za7014?code=...` weitergeleitet, aber die App verarbeitet den OAuth-Code nicht automatisch.

## ✅ Lösung

### Schritt 1: Supabase Redirect URLs aktualisieren

1. Öffnen Sie Ihr [Supabase Dashboard](https://app.supabase.com/)
2. Gehen Sie zu **Authentication** → **URL Configuration**
3. Unter **Redirect URLs**, fügen Sie hinzu:
   ```
   https://preview.builtwithrocket.new/**
   ```
4. Klicken Sie auf **Speichern**

**WICHTIG:** Das `/**` am Ende bedeutet, dass alle Pfade unter dieser Domain akzeptiert werden.

### Schritt 2: Site URL aktualisieren (optional)

Falls Sie die Rocket Preview URL als Haupt-URL verwenden möchten:

1. In Supabase: **Authentication** → **URL Configuration**
2. **Site URL:** Setzen Sie auf:
   ```
   https://preview.builtwithrocket.new
   ```
3. Klicken Sie auf **Speichern**

### Schritt 3: App neu starten

```bash
flutter run --dart-define-from-file=env.json
```

## 🔍 Wie es funktioniert

1. **Benutzer klickt "Mit Google anmelden"**
   - App sendet Anfrage an Supabase

2. **Supabase leitet zu Google weiter**
   - Google authentifiziert den Benutzer

3. **Google leitet zurück zu Supabase**
   - Supabase verarbeitet die OAuth-Antwort
   - Supabase erstellt eine Session

4. **Supabase leitet zurück zur App**
   - URL: `https://preview.builtwithrocket.new/onsite-8za7014?code=...`
   - Der `code` Parameter wird von Supabase automatisch verarbeitet

5. **App erkennt Session**
   - Die App prüft beim Start, ob ein `code` Parameter vorhanden ist
   - Supabase tauscht den Code automatisch gegen eine Session
   - Der Auth State Listener erkennt die neue Session
   - Benutzer wird automatisch eingeloggt

## ⚠️ Wichtige Hinweise

### Für lokale Entwicklung:
- Verwenden Sie `http://localhost:port/**` in Supabase Redirect URLs
- Die App verwendet automatisch `Uri.base.origin` für die Redirect-URL

### Für Rocket Preview:
- Fügen Sie `https://preview.builtwithrocket.new/**` zu Supabase Redirect URLs hinzu
- Die App wird automatisch zur Rocket Preview URL weitergeleitet

### Für Produktion:
- Fügen Sie Ihre Produktions-URL zu Supabase Redirect URLs hinzu
- Beispiel: `https://your-domain.com/**`

## 🧪 Testen

1. App starten (oder Rocket Preview öffnen)
2. "Mit Google anmelden" klicken
3. Google-Anmeldung abschließen
4. Sie werden zurück zur Rocket Preview URL weitergeleitet
5. Die App sollte automatisch die Session erkennen und Sie einloggen

## 🐛 Wenn es nicht funktioniert

1. **Überprüfen Sie Supabase Redirect URLs**
   - Stellen Sie sicher, dass `https://preview.builtwithrocket.new/**` hinzugefügt ist

2. **Überprüfen Sie die Browser-Konsole (F12)**
   - Suchen Sie nach Fehlermeldungen
   - Prüfen Sie, ob die Session erstellt wurde

3. **Überprüfen Sie Supabase Auth Logs**
   - Supabase Dashboard → Logs → Auth Logs
   - Suchen Sie nach erfolgreichen OAuth-Callbacks

4. **Löschen Sie Browser-Cache**
   - Drücken Sie Ctrl+Shift+Delete
   - Löschen Sie Cookies und Cache

5. **Warten Sie einige Minuten**
   - Supabase-Änderungen können einige Minuten dauern

## 📝 Code-Änderungen

Die App wurde aktualisiert, um:
- OAuth-Code-Parameter beim App-Start zu erkennen
- Automatisch die Session zu verarbeiten, wenn ein Code vorhanden ist
- Die Rocket Preview URL zu unterstützen

Die Änderungen sind bereits im Code implementiert. Sie müssen nur die Supabase Redirect URLs aktualisieren.

