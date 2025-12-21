# 🔧 Fixed Port Setup für Flutter Web

## 🔴 Problem

Der Port ändert sich bei jedem Start (z.B. `localhost:64367`, `localhost:55463`, etc.), was bedeutet, dass die Supabase Redirect URLs nicht mehr funktionieren.

## ✅ Lösung: Fester Port verwenden

### Schritt 1: App mit festem Port starten

Verwenden Sie den `--web-port` Parameter:

```bash
flutter run --dart-define-from-file=env.json --web-port=8080
```

**Oder verwenden Sie die Start-Skripte:**
- Windows: `START_APP.bat` (verwendet bereits Port 8080)
- PowerShell: `START_APP.ps1` (verwendet bereits Port 8080)

### Schritt 2: Supabase Redirect URLs konfigurieren

1. Gehen Sie zu Supabase Dashboard → **Authentication** → **URL Configuration**
2. Fügen Sie hinzu:
   ```
   http://localhost:8080/**
   ```
3. Klicken Sie auf **"Save"**

**Das `/**` am Ende ist wichtig!** Es bedeutet, dass alle Pfade unter diesem Port akzeptiert werden.

### Schritt 3: Testen

1. Starten Sie die App mit:
   ```bash
   flutter run --dart-define-from-file=env.json --web-port=8080
   ```
2. Die App sollte jetzt immer auf `http://localhost:8080` laufen
3. Google OAuth sollte jetzt funktionieren!

---

## 📝 Alternative: Wildcard-Pattern verwenden

Wenn Sie keinen festen Port verwenden möchten, können Sie ein Wildcard-Pattern in Supabase verwenden:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Fügen Sie hinzu:
   ```
   http://localhost:*/**
   ```
3. Das `*` akzeptiert jeden Port

**⚠️ HINWEIS:** Wildcard-Patterns funktionieren nicht immer zuverlässig. Ein fester Port ist empfohlen.

---

## 🔍 Port bereits belegt?

Wenn Port 8080 bereits belegt ist:

### Option 1: Anderen Port verwenden

```bash
flutter run --dart-define-from-file=env.json --web-port=8081
```

Dann in Supabase: `http://localhost:8081/**` hinzufügen

### Option 2: Port 8080 freigeben

**Windows:**
```powershell
# Port 8080 belegte Prozesse finden
netstat -ano | findstr :8080

# Prozess beenden (ersetzen Sie PID mit der tatsächlichen Prozess-ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Port 8080 belegte Prozesse finden
lsof -i :8080

# Prozess beenden (ersetzen Sie PID mit der tatsächlichen Prozess-ID)
kill -9 <PID>
```

---

## ✅ Checkliste

- [ ] App mit `--web-port=8080` gestartet
- [ ] Supabase Redirect URL hinzugefügt: `http://localhost:8080/**`
- [ ] App läuft auf `http://localhost:8080`
- [ ] Google OAuth funktioniert

---

## 🆘 Immer noch Probleme?

### Problem 1: Port ändert sich trotzdem

**Lösung:**
- Stellen Sie sicher, dass Sie `--web-port=8080` verwenden
- Prüfen Sie, ob ein anderer Prozess Port 8080 verwendet
- Verwenden Sie einen anderen Port (z.B. 8081, 8082)

### Problem 2: Supabase akzeptiert die URL nicht

**Lösung:**
- Stellen Sie sicher, dass `/**` am Ende steht
- Verwenden Sie `http://` (nicht `https://`) für localhost
- Warten Sie 2-3 Minuten nach dem Hinzufügen

### Problem 3: App startet nicht auf Port 8080

**Lösung:**
- Prüfen Sie, ob Port 8080 frei ist
- Verwenden Sie einen anderen Port
- Starten Sie die App mit `--web-port=8081` (oder einem anderen Port)

---

## 📞 Weitere Hilfe

Wenn nichts funktioniert:
1. **Screenshot** der Supabase Redirect URLs
2. **Port-Nummer**, die Sie verwenden
3. **Fehlermeldung** (falls vorhanden)

Mit diesen Informationen kann Ihnen besser geholfen werden.

