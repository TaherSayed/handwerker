# Google OAuth: App-Name statt Supabase-URL anzeigen

## Problem
Im Google Login-Dialog wird die Supabase-URL (`ckargfikgicnflsqbbld.supabase.co`) angezeigt statt des App-Namens.

## Lösung: OAuth Consent Screen in Google Cloud Console konfigurieren

### Schritt 1: Google Cloud Console öffnen
1. Gehe zu https://console.cloud.google.com
2. Wähle dein Projekt aus (z.B. "OnSite Production")

### Schritt 2: OAuth Consent Screen bearbeiten
1. Navigiere zu **APIs & Services** > **OAuth consent screen**
2. Klicke auf **EDIT APP** (oder erstelle einen neuen, falls noch nicht vorhanden)

### Schritt 3: App-Informationen konfigurieren
1. **App name:** 
   ```
   OnSite Handwerker App
   ```
   ⚠️ **Dieser Name wird im Login-Dialog angezeigt!**

2. **User support email:** 
   - Deine Support-E-Mail-Adresse

3. **App logo:** 
   - Optional, aber empfohlen
   - Logo hochladen (quadratisch, mind. 120x120px)
   - Verbessert das professionelle Erscheinungsbild

4. **App domain:** 
   ```
   hw.sata26.cloud
   ```

5. **Application home page:**
   ```
   https://hw.sata26.cloud
   ```

6. **Application privacy policy:**
   ```
   https://hw.sata26.cloud/datenschutz
   ```

7. **Application terms of service:**
   ```
   https://hw.sata26.cloud/impressum
   ```

8. **Developer contact information:**
   - Deine E-Mail-Adresse

### Schritt 4: Speichern und Verifizieren
1. Klicke **SAVE AND CONTINUE**
2. Gehe durch alle Schritte (Scopes, Test Users, etc.)
3. **Wichtig:** Wenn die App im "Testing" Status ist:
   - Der App-Name wird möglicherweise nicht sofort angezeigt
   - Für Produktion: App zur Verifizierung einreichen

### Schritt 5: App zur Verifizierung einreichen (für Produktion)
1. Im OAuth Consent Screen, klicke **PUBLISH APP**
2. Fülle alle erforderlichen Informationen aus
3. Google wird die App überprüfen (kann einige Tage dauern)
4. Nach der Verifizierung wird der App-Name korrekt angezeigt

### Schritt 6: Testen
1. Warte 2-5 Minuten nach dem Speichern
2. Logge dich aus und wieder ein
3. Im Google Login-Dialog sollte jetzt "OnSite Handwerker App" statt der Supabase-URL angezeigt werden

## Alternative: Custom Domain in Supabase (Kostenpflichtig)
Falls der App-Name weiterhin nicht angezeigt wird:
- Supabase Pro Plan erforderlich
- Custom Domain Add-on kaufen
- Eigene Domain konfigurieren (z.B. `auth.hw.sata26.cloud`)
- Dann wird deine Domain im Dialog angezeigt

## Troubleshooting

### Problem: App-Name wird immer noch nicht angezeigt
**Lösung:**
1. Prüfe, ob der App-Name in Google Cloud Console korrekt gespeichert ist
2. Warte 5-10 Minuten (Google Cache)
3. Logge dich komplett aus (auch aus Google)
4. Versuche es erneut
5. Prüfe, ob die App im "Testing" Status ist - dann kann der Name eingeschränkt angezeigt werden

### Problem: "Unverified App" Warnung
**Lösung:**
- Normal während der Test-Phase
- App zur Verifizierung einreichen für Produktion
- Benutzer können auf "Advanced" > "Go to OnSite Handwerker App (unsafe)" klicken

## Aktuelle Konfiguration prüfen
1. Google Cloud Console > APIs & Services > OAuth consent screen
2. Prüfe den **App name** - sollte "OnSite Handwerker App" sein
3. Prüfe den **Publishing status** - sollte "In production" sein für beste Ergebnisse

