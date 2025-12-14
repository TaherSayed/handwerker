# 🔧 Flutter DevTools Crash beheben

## 🔴 Problem
```
WipError -32000 Cannot find context with specified id
```

Dieser Fehler tritt auf, wenn Flutter DevTools die Verbindung zu Chrome verliert.

## ✅ Lösung

### Methode 1: Browser-Prozesse beenden (Empfohlen)

1. **Alle Chrome/Edge-Instanzen schließen**
   - Schließen Sie alle Browser-Fenster
   - Oder verwenden Sie Task Manager (Strg+Shift+Esc) und beenden Sie alle Chrome/Edge-Prozesse

2. **Flutter Clean ausführen**
   ```bash
   flutter clean
   flutter pub get
   ```

3. **App neu starten**
   ```bash
   flutter run --dart-define-from-file=env.json
   ```

### Methode 2: Ohne Debugging starten

Wenn das Problem weiterhin besteht, starten Sie die App ohne Debugging:

```bash
flutter run --dart-define-from-file=env.json --no-debug
```

### Methode 3: Anderen Browser verwenden

Wenn Chrome Probleme macht, verwenden Sie Edge:

```bash
flutter run --dart-define-from-file=env.json -d edge
```

### Methode 4: DevTools deaktivieren

Falls nichts hilft, deaktivieren Sie DevTools temporär:

```bash
flutter run --dart-define-from-file=env.json --no-debug --no-pub
```

## 🔍 Ursachen

Dieser Fehler kann auftreten, wenn:
- ✅ Browser-Tab während des Debuggings geschlossen wurde
- ✅ Netzwerkverbindung unterbrochen wurde
- ✅ Chrome DevTools die Verbindung verloren hat
- ✅ Mehrere Flutter-Instanzen gleichzeitig laufen
- ✅ Browser-Cache korrupt ist

## 🛠️ Prävention

1. **Nur eine Flutter-Instanz gleichzeitig**
   - Stellen Sie sicher, dass keine andere `flutter run` Instanz läuft

2. **Browser-Tab nicht schließen**
   - Lassen Sie den Browser-Tab während des Debuggings geöffnet

3. **Regelmäßig Flutter Clean**
   ```bash
   flutter clean
   flutter pub get
   ```

4. **Browser-Cache leeren**
   - Drücken Sie Strg+Shift+Delete
   - Löschen Sie Cache und Cookies

## 📝 Wenn nichts funktioniert

1. **Computer neu starten**
   - Manchmal hilft ein Neustart

2. **Flutter aktualisieren**
   ```bash
   flutter upgrade
   ```

3. **Chrome aktualisieren**
   - Stellen Sie sicher, dass Chrome auf dem neuesten Stand ist

4. **Anderen Port verwenden**
   ```bash
   flutter run --dart-define-from-file=env.json --web-port=8080
   ```

## ✅ Schnelllösung

Führen Sie diese Befehle nacheinander aus:

```bash
# 1. Browser beenden (falls noch offen)
taskkill /F /IM chrome.exe

# 2. Flutter clean
flutter clean

# 3. Dependencies neu installieren
flutter pub get

# 4. App neu starten
flutter run --dart-define-from-file=env.json
```

Die App sollte jetzt ohne Fehler starten!

