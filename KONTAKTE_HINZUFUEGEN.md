# 📇 Kontakte hinzufügen - Anleitung

## ✅ Was wurde geändert

Die App lädt jetzt **echte Daten** aus Supabase statt Mock-Daten:
- ✅ Dashboard zeigt echte Benutzerdaten
- ✅ Statistiken werden aus der Datenbank geladen
- ✅ Kontakte werden aus Supabase geladen
- ✅ Besuche werden aus der Datenbank geladen

## 📝 Kontakte hinzufügen

### Option 1: Über die App (Empfohlen)

1. **Öffnen Sie die Kontakte-Verwaltung**
   - Klicken Sie auf den **"Kontakte"** Tab (zweiter Tab unten)
   - Oder navigieren Sie zu: **Kontakte** → **Kontakt hinzufügen**

2. **Kontakt manuell hinzufügen**
   - Klicken Sie auf **"Kontakt hinzufügen"** Button
   - Füllen Sie die Felder aus:
     - Name
     - Firma
     - Telefon
     - E-Mail
   - Klicken Sie auf **"Speichern"**

### Option 2: Über Supabase Dashboard

1. **Öffnen Sie Supabase Dashboard**
   - Gehen Sie zu: https://app.supabase.com/
   - Wählen Sie Ihr Projekt aus

2. **Öffnen Sie die Tabelle "contacts"**
   - Klicken Sie auf **Table Editor** (links im Menü)
   - Wählen Sie **"contacts"** aus

3. **Neuen Kontakt hinzufügen**
   - Klicken Sie auf **"Insert"** → **"Insert row"**
   - Füllen Sie die Felder aus:
     - `user_id`: Ihre Benutzer-ID (aus Authentication → Users)
     - `full_name`: Vollständiger Name
     - `company`: Firmenname
     - `phone`: Telefonnummer
     - `email`: E-Mail-Adresse
     - `is_favorite`: false (oder true für Favoriten)
   - Klicken Sie auf **"Save"**

### Option 3: SQL-Befehl in Supabase

1. **Öffnen Sie SQL Editor**
   - Supabase Dashboard → **SQL Editor**

2. **Führen Sie diesen Befehl aus:**
   ```sql
   INSERT INTO contacts (user_id, full_name, company, phone, email, is_favorite)
   VALUES (
     'Ihre-User-ID-hier',  -- Ersetzen Sie mit Ihrer tatsächlichen User-ID
     'Max Mustermann',
     'Mustermann Bau GmbH',
     '+49 123 456789',
     'max@mustermann.de',
     false
   );
   ```

   **Ihre User-ID finden:**
   - Supabase Dashboard → **Authentication** → **Users**
   - Kopieren Sie die **UUID** des Benutzers

## 🔍 Überprüfen ob Kontakte geladen werden

1. **App neu starten**
   ```bash
   flutter run --dart-define-from-file=env.json
   ```

2. **Kontakte-Tab öffnen**
   - Klicken Sie auf den **"Kontakte"** Tab
   - Sie sollten Ihre Kontakte sehen

3. **Falls keine Kontakte angezeigt werden:**
   - Überprüfen Sie die Browser-Konsole (F12) auf Fehler
   - Stellen Sie sicher, dass Sie eingeloggt sind
   - Überprüfen Sie, ob Kontakte in Supabase vorhanden sind

## 📊 Datenbank-Struktur

Die `contacts` Tabelle sollte folgende Spalten haben:

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key zu users)
- `full_name` (Text)
- `company` (Text, optional)
- `phone` (Text, optional)
- `email` (Text, optional)
- `avatar_url` (Text, optional)
- `is_favorite` (Boolean, default: false)
- `last_visit_date` (Date, optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 🐛 Fehlerbehebung

### "Keine Kontakte gefunden"
- **Ursache:** Keine Kontakte in der Datenbank
- **Lösung:** Fügen Sie Kontakte hinzu (siehe oben)

### "Failed to fetch contacts"
- **Ursache:** Datenbankfehler oder fehlende Berechtigungen
- **Lösung:** 
  1. Überprüfen Sie Supabase RLS (Row Level Security) Policies
  2. Stellen Sie sicher, dass der Benutzer berechtigt ist, Kontakte zu lesen

### "Supabase not configured"
- **Ursache:** Supabase ist nicht konfiguriert
- **Lösung:** Starten Sie die App mit:
  ```bash
  flutter run --dart-define-from-file=env.json
  ```

## 💡 Tipp

Wenn Sie viele Kontakte hinzufügen möchten, können Sie:
1. Eine CSV-Datei erstellen
2. Diese in Supabase importieren
3. Oder einen SQL-Befehl mit mehreren INSERT-Statements verwenden

## 📚 Nächste Schritte

Nachdem Sie Kontakte hinzugefügt haben:
1. ✅ Kontakte werden im Dashboard angezeigt
2. ✅ Sie können Besuche für Kontakte erstellen
3. ✅ Sie können Kontakte als Favoriten markieren
4. ✅ Sie können nach Kontakten suchen

