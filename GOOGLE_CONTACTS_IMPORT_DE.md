# 📇 Google Kontakte automatisch importieren - Deutsche Anleitung

## ✅ Was wurde implementiert

Die App importiert jetzt **automatisch Ihre Google Kontakte** nach dem Google Sign-In!

### Features:
- ✅ Automatischer Import nach Google Sign-In
- ✅ Kontakte werden in Supabase gespeichert
- ✅ Duplikate werden automatisch übersprungen
- ✅ Funktioniert auf Web und Mobile
- ✅ Keine Fehler, wenn Import fehlschlägt (non-critical)

## 🔧 Google Cloud Console Konfiguration (DEUTSCH)

### Schritt 1: People API aktivieren

1. Öffnen Sie [Google Cloud Console](https://console.cloud.google.com/)
2. Wählen Sie Ihr Projekt aus (oben links)
3. Klicken Sie auf **"APIs & Dienste"** (APIs & Services) im linken Menü
4. Klicken Sie auf **"Bibliothek"** (Library)
5. Suchen Sie nach **"People API"** in der Suchleiste
6. Klicken Sie auf **"People API"** in den Suchergebnissen
7. Klicken Sie auf den blauen Button **"AKTIVIEREN"** (Enable)

✅ **Fertig!** People API ist jetzt aktiviert.

### Schritt 2: OAuth-Einwilligungsbildschirm öffnen

1. Bleiben Sie in **"APIs & Dienste"** (APIs & Services)
2. Klicken Sie im linken Menü auf **"OAuth-Einwilligungsbildschirm"** (OAuth consent screen)
3. Falls noch nicht konfiguriert:
   - Wählen Sie **"Extern"** (External) aus
   - Klicken Sie auf **"ERSTELLEN"** (Create)
   - Füllen Sie die Pflichtfelder aus:
     - **App-Name**: z.B. "OnSite App"
     - **Benutzer-Support-E-Mail**: Ihre E-Mail
     - **Entwicklerkontaktinformationen**: Ihre E-Mail
   - Klicken Sie auf **"SPEICHERN UND WEITER"** (Save and Continue)

### Schritt 3: Scopes hinzufügen

1. Sie sollten jetzt auf der Seite **"Scopes"** sein
   - Falls nicht, klicken Sie auf **"Scopes"** im linken Menü

2. Klicken Sie auf den Button **"+ BEREICH HINZUFÜGEN ODER ENTFERNEN"** (+ ADD OR REMOVE SCOPES)

3. Im Popup-Fenster:
   - Scrollen Sie nach unten zu **"Manuell einen Bereich hinzufügen"** (Manually add a scope)
   - Oder suchen Sie nach **"contacts"** in der Suchleiste

4. Fügen Sie diesen Scope hinzu:
   ```
   https://www.googleapis.com/auth/contacts.readonly
   ```
   
   **So fügen Sie ihn hinzu:**
   - Klicken Sie auf **"Manuell einen Bereich hinzufügen"** (Manually add a scope)
   - Geben Sie ein: `https://www.googleapis.com/auth/contacts.readonly`
   - Klicken Sie auf **"Zum Tabelle hinzufügen"** (Add to table)
   - Der Scope sollte jetzt in der Liste erscheinen

5. Klicken Sie auf **"AKTUALISIEREN"** (Update) oder **"SPEICHERN"** (Save)

6. Klicken Sie auf **"SPEICHERN UND WEITER"** (Save and Continue)

### Schritt 4: Testbenutzer hinzufügen (wichtig für Tests)

1. Auf der Seite **"Testbenutzer"** (Test users):
   - Klicken Sie auf **"+ TESTBENUTZER HINZUFÜGEN"** (+ ADD USERS)
   - Geben Sie Ihre Google-E-Mail-Adresse ein
   - Klicken Sie auf **"HINZUFÜGEN"** (Add)
   - Klicken Sie auf **"SPEICHERN UND WEITER"** (Save and Continue)

2. Auf der Seite **"Zusammenfassung"** (Summary):
   - Überprüfen Sie alle Einstellungen
   - Klicken Sie auf **"ZURÜCK ZUM DASHBOARD"** (Back to Dashboard)

## 📍 Wo finde ich die Scopes? (Visuelle Anleitung)

### Option 1: Über OAuth-Einwilligungsbildschirm

```
Google Cloud Console
  └─ APIs & Dienste (APIs & Services)
      └─ OAuth-Einwilligungsbildschirm (OAuth consent screen)
          └─ Scopes (im linken Menü)
              └─ "+ BEREICH HINZUFÜGEN ODER ENTFERNEN"
```

### Option 2: Direkter Link

Wenn Sie bereits im OAuth-Einwilligungsbildschirm sind:
- Klicken Sie auf **"Scopes"** im linken Menü
- Sie sehen eine Tabelle mit allen konfigurierten Scopes
- Klicken Sie auf **"+ BEREICH HINZUFÜGEN ODER ENTFERNEN"**

## 🔍 Screenshot-Beschreibung (was Sie sehen sollten)

### Auf der Scopes-Seite sehen Sie:

1. **Oben**: Eine Tabelle mit bereits konfigurierten Scopes
   - z.B. `email`, `profile`, `openid`

2. **Button**: **"+ BEREICH HINZUFÜGEN ODER ENTFERNEN"** (grün/blau)

3. **Nach dem Klick**: Ein Popup-Fenster mit:
   - Suchleiste oben
   - Liste von verfügbaren Scopes
   - Unten: **"Manuell einen Bereich hinzufügen"** (Manually add a scope)

### Was Sie eingeben müssen:

Im Feld **"Manuell einen Bereich hinzufügen"** geben Sie ein:
```
https://www.googleapis.com/auth/contacts.readonly
```

Dann klicken Sie auf **"Zum Tabelle hinzufügen"** oder **"Hinzufügen"**.

## ✅ Überprüfung

Nach dem Hinzufügen sollten Sie in der Scopes-Tabelle sehen:

| Bereich | Beschreibung |
|---------|--------------|
| `.../auth/userinfo.email` | E-Mail-Adresse |
| `.../auth/userinfo.profile` | Profilinformationen |
| `.../auth/contacts.readonly` | **Kontakte lesen** ← Dieser sollte jetzt da sein! |

## 🧪 Testen

1. **People API aktivieren** ✅ (Schritt 1)
2. **Scope hinzufügen** ✅ (Schritt 3)
3. **App neu starten:**
   ```bash
   flutter run --dart-define-from-file=env.json
   ```
4. **Mit Google anmelden**
   - Die App fragt jetzt nach Kontakt-Berechtigung
   - Klicken Sie auf **"Zulassen"** (Allow)
5. **Kontakte-Tab öffnen**
   - Ihre Google Kontakte sollten jetzt angezeigt werden!

## 🐛 Fehlerbehebung

### "Scope nicht gefunden"
- **Ursache:** Scope wurde nicht richtig hinzugefügt
- **Lösung:** 
  1. Gehen Sie zurück zu OAuth-Einwilligungsbildschirm → Scopes
  2. Überprüfen Sie, ob `contacts.readonly` in der Liste ist
  3. Falls nicht, fügen Sie ihn erneut hinzu

### "403 Forbidden" oder "People API nicht aktiviert"
- **Ursache:** People API nicht aktiviert
- **Lösung:**
  1. Gehen Sie zu APIs & Dienste → Bibliothek
  2. Suchen Sie nach "People API"
  3. Klicken Sie auf "AKTIVIEREN"

### "Berechtigung verweigert"
- **Ursache:** Scope nicht in OAuth-Einwilligungsbildschirm
- **Lösung:**
  1. Fügen Sie den Scope hinzu (siehe Schritt 3)
  2. Melden Sie sich ab und wieder an
  3. Erteilen Sie die Berechtigung erneut

## 📝 Zusammenfassung - Schnellreferenz

1. ✅ **People API aktivieren**
   - APIs & Dienste → Bibliothek → "People API" → AKTIVIEREN

2. ✅ **OAuth-Einwilligungsbildschirm öffnen**
   - APIs & Dienste → OAuth-Einwilligungsbildschirm

3. ✅ **Scope hinzufügen**
   - Scopes → "+ BEREICH HINZUFÜGEN"
   - Eingeben: `https://www.googleapis.com/auth/contacts.readonly`
   - Speichern

4. ✅ **Testbenutzer hinzufügen** (Ihre E-Mail)

5. ✅ **App testen**

## 💡 Tipp

Falls Sie die Scopes-Seite nicht finden:
- Stellen Sie sicher, dass Sie **"Extern"** (External) als Benutzertyp gewählt haben
- Der OAuth-Einwilligungsbildschirm muss mindestens einmal konfiguriert worden sein
- Falls nicht, folgen Sie Schritt 2 vollständig

## 🔐 Datenschutz

- ✅ Kontakte werden nur in Ihrer Supabase-Datenbank gespeichert
- ✅ Nur Sie können Ihre Kontakte sehen
- ✅ Die App verwendet nur Leseberechtigung (`readonly`)
- ✅ Keine Kontakte werden an Dritte weitergegeben
- ✅ Die App kann keine Kontakte in Google ändern oder löschen

