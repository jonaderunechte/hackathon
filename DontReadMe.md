# 🚨 SPOILER ALERT! 🚨
# ⚠️ ACHTUNG - NUR FÜR NOTFÄLLE ⚠️
# 🛑 NICHT LESEN WENN DU DIE CHALLENGE SPIELEN WILLST! 🛑

---
---
---
---
---
---
---
---
---
---

# SecureTechBank Hackathon Challenge - Hints & Solutions

Wenn du wirklich nicht weiterkommst, findest du hier Hinweise zu jeder Challenge-Stufe.

---

## 📋 Challenge Übersicht

Die Challenge besteht aus **10 Levels**, die du nacheinander lösen musst um das finale Ziel zu erreichen: **€1.000.000 auf dein Konto transferieren**.

### Ziel: 
Transferiere **€1.000.000** auf deinen Account und erhalte HackCoins basierend auf deiner Zeit!

---

## 🎯 Level 0: Popup schließen

**Challenge:** Das Start-Popup blockiert den Zugang zur Website.

### Hinweise:
1. **Einfachste Lösung:** Öffne die Browser-Konsole (F12)
2. Der Button ist `disabled` - inspiziere das HTML-Element
3. Entferne das `disabled`-Attribut vom Button ODER
4. Lösche das gesamte Popup-Overlay aus dem DOM ODER
5. JavaScript: `document.getElementById('challengePopup').style.display = 'none'`

### Lösung:
```javascript
// Methode 1: Button enablen
document.getElementById('closePopupBtn').disabled = false;

// Methode 2: Popup entfernen
document.getElementById('challengePopup').remove();

// Methode 3: CSS Display ändern
document.getElementById('challengePopup').style.display = 'none';
```

**Checkpoint:** Popup ist geschlossen, du kannst dich registrieren/einloggen.

---

## 🎯 Level 1: Paywall umgehen

**Challenge:** Nach dem Login blockiert eine Paywall den Zugriff aufs Dashboard.

### Hinweise:
1. Die Paywall ist ein einfaches Overlay mit CSS
2. Untersuche das Element im Browser-Inspector
3. Der "Jetzt upgraden" Button funktioniert nicht wirklich
4. Schau dir die CSS-Klassen an: `paywall-overlay`
5. Es gibt eine Console-Funktion die helfen könnte...

### Lösung:
```javascript
// Methode 1: CSS Display ändern
document.getElementById('paywall').style.display = 'none';

// Methode 2: Element entfernen
document.getElementById('paywall').remove();

// Methode 3: Console-Funktion nutzen
window.bypassPaywall();

// Methode 4: SessionStorage setzen und Seite neu laden
sessionStorage.setItem('paywallBypassed', 'true');
location.reload();
```

**Checkpoint:** Paywall ist weg, Dashboard ist zugänglich.

---

## 🎯 Level 2: Verschwommene Texte lesbar machen

**Challenge:** Im Nachrichten-Bereich gibt es einen Artikel über Verschlüsselung, aber der Text ist verschwommen (blurred).

### Hinweise:
1. Navigiere zum "Nachrichten" Tab im Dashboard
2. Finde den Artikel "🔐 Sicherheit im digitalen Zeitalter"
3. Der Text hat die CSS-Klasse `.blurred-text`
4. Untersuche die CSS-Regel für diese Klasse
5. Der Filter `blur(5px)` macht den Text unleserlich
6. Es gibt wieder eine Console-Funktion...

### Lösung:
```javascript
// Methode 1: CSS Filter entfernen (einzeln)
const blurredElements = document.querySelectorAll('.blurred-text p, .blurred-text ul');
blurredElements.forEach(el => {
    el.style.filter = 'none';
    el.style.userSelect = 'auto';
    el.style.pointerEvents = 'auto';
});

// Methode 2: Console-Funktion nutzen
window.removeBlur();

// Methode 3: CSS-Regel im Browser-Inspector deaktivieren
// Rechtsklick auf Element -> Inspect -> Styles -> filter: blur(5px) deaktivieren
```

**Checkpoint:** Der Verschlüsselungsartikel ist jetzt lesbar.

---

## 🎯 Level 3: SHA-256 Hash aus YouTube-Link extrahieren

**Challenge:** Im jetzt lesbaren Artikel gibt es 6 YouTube-Links zu Verschlüsselungsmethoden. Einer davon enthält wichtige Informationen.

### Hinweise:
1. Schau dir alle YouTube-Links im Artikel genau an
2. Die meisten Links sind normale YouTube-Videos
3. **WICHTIG:** Einige Links funktionieren nicht (404 oder Rick Roll 😉)
4. Nur **EINER** der Links hat einen zusätzlichen URL-Parameter: `&vault=...`
5. Der SHA-256 Link hat das Format: `...&vault=[HASH]`
6. Dieser Hash ist ein Teil der Vault-URL!

### Lösung:
Der korrekte Link ist beim **SHA-256** Eintrag:
```
https://www.youtube.com/watch?v=b4b8ktEV4Bg&vault=a7f3c9e2b1d5f8a4c6e9b2d1f5a8c3e7
```

Der Hash ist: `a7f3c9e2b1d5f8a4c6e9b2d1f5a8c3e7`

**Checkpoint:** Du hast den SHA-256 Hash gefunden.

---

## 🎯 Level 4: PersonalData Passwort-Schutz knacken

**Challenge:** Der "Persönliche Daten" Tab ist passwortgeschützt. Hier siehst du deinen Kontostand und deine HackCoins.

### Hinweise:
1. Navigiere zum "Persönliche Daten" Tab
2. Es wird ein Passwort verlangt
3. Das Passwort ist NICHT verschlüsselt!
4. Öffne die `script.js` Datei in den Developer Tools (Sources Tab)
5. Suche nach dem String: `PERSONAL_DATA_PASSWORD`
6. Das Passwort steht direkt im Code (schlechte Praxis! 😱)

### Lösung:
Das Passwort ist: `securebank2026`

Alternativ kannst du es auch im Code finden:
```javascript
const PERSONAL_DATA_PASSWORD = "securebank2026";
```

**Checkpoint:** PersonalData ist entsperrt, du siehst deinen Kontostand (€100).

---

## 🎯 Level 5: Versteckten Vault finden

**Challenge:** Der Vault mit dem großen Geld ist eine versteckte HTML-Seite.

### Hinweise:
1. Die Vault-Seite existiert, ist aber nicht in der Navigation verlinkt
2. Erinnere dich an den SHA-256 Hash aus Level 3
3. Die URL-Struktur ist: `/vault-[HASH].html`
4. Du musst eine neue HTML-Datei erstellen (siehe unten)
5. Console-Tipp: `window.vaultHint()`

### Lösung:
Erstelle eine Datei namens `vault-a7f3c9e2b1d5f8a4c6e9b2d1f5a8c3e7.html` (siehe separate Vault-Datei Anleitung).

Die URL wird sein:
```
/vault-a7f3c9e2b1d5f8a4c6e9b2d1f5a8c3e7.html
```

**Checkpoint:** Du hast den Vault gefunden und die Seite lädt.

---

## 🎯 Level 6: Vault Authentifizierung umgehen

**Challenge:** Der Vault ist durch mehrere Sicherheitsmaßnahmen geschützt.

### Hinweise:
1. Der Vault prüft ob du eingeloggt bist (Firebase Auth)
2. Es gibt einen Timer (nur 60 Sekunden!)
3. Es gibt ein "Sicherheits-Quiz" mit 3 Fragen
4. Untersuche den Vault-Code
5. Die Antworten könnten im Code versteckt sein...

### Lösung:
Die Quiz-Antworten sind (müssen im Code gefunden werden):
1. **Antwort 1:** SHA-256 Hash des Bank-Namens
2. **Antwort 2:** Firebase Project ID
3. **Antwort 3:** Ein versteckter String im CSS

ODER: Manipuliere die JavaScript-Variablen direkt in der Console.

**Checkpoint:** Vault ist entsperrt, du siehst die €1.000.000.

---

## 🎯 Level 7: Transfer-Limit umgehen

**Challenge:** Du willst €1.000.000 transferieren, aber es gibt ein API-Limit von nur €10.000 pro Transfer.

### Hinweise:
1. Das Limit ist in `script.js` definiert
2. Schau dir das `window.api` Objekt an
3. Die Variable `transferLimit` kann verändert werden
4. Oder du machst mehrere Transfers?
5. Oder du nutzt die API-Funktion direkt...

### Lösung:
```javascript
// Methode 1: Limit erhöhen
window.api.transferLimit = 10000000;

// Methode 2: API direkt nutzen um Balance zu erhöhen
window.api.increaseBalance(1000000);

// Methode 3: Firebase direkt manipulieren
firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
    .update({ balance: 1000100 });
```

**Checkpoint:** Dein Kontostand ist jetzt bei €1.000.100 (oder höher).

---

## 🎯 Level 8: Rate Limiting umgehen

**Challenge:** Zu viele Transfer-Versuche lösen ein Rate Limit aus.

### Hinweise:
1. Das Rate Limit ist client-seitig implementiert
2. Es nutzt `sessionStorage` oder `localStorage`
3. Lösche die entsprechenden Keys
4. Oder warte einfach ab (aber Zeit = weniger Punkte!)

### Lösung:
```javascript
// Alle Session-Daten löschen
sessionStorage.clear();
localStorage.clear();

// Spezifisch:
sessionStorage.removeItem('lastTransferTime');
sessionStorage.removeItem('transferCount');
```

**Checkpoint:** Du kannst wieder Transfers durchführen.

---

## 🎯 Level 9: Admin-Rechte erlangen

**Challenge:** Manche Funktionen benötigen Admin-Rechte.

### Hinweise:
1. User-Rolle ist in Firebase Firestore gespeichert
2. Oder in `localStorage` als Session-Daten
3. Manipuliere die Daten direkt
4. Setze `role: "admin"` in deinem User-Dokument

### Lösung:
```javascript
// Firebase manipulieren
firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
    .update({ 
        role: 'admin',
        permissions: ['read', 'write', 'transfer', 'vault']
    });

// Oder localStorage
localStorage.setItem('userRole', 'admin');
```

**Checkpoint:** Du hast Admin-Rechte.

---

## 🎯 Level 10: FINALER TRANSFER

**Challenge:** Transferiere exakt €1.000.000 auf dein Konto.

### Lösung:
Nachdem du dein Guthaben auf mindestens €1.000.000 erhöht hast:

1. Gehe zum "Transaktionen" Tab
2. Gib einen beliebigen Empfänger ein (z.B. "Myself")
3. Betrag: `1000000` (exakt 1 Million!)
4. Klicke "Überweisung ausführen"

**ODER** nutze die API:
```javascript
// Direkt Balance setzen
window.api.increaseBalance(1000000);
```

**ODER** manipuliere Firebase direkt:
```javascript
firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
    .update({ balance: 1000100 });
```

Sobald du €1.000.000 transferiert hast, wird die Challenge als abgeschlossen markiert!

---

## 🏆 Challenge Abgeschlossen!

Du erhältst **HackCoins** basierend auf deiner Zeit:

- **Unter 10 Minuten:** 9.900+ HackCoins 🔥
- **10-30 Minuten:** 9.500-9.700 HackCoins ⚡
- **30-60 Minuten:** 8.500-9.500 HackCoins 💪
- **1-2 Stunden:** 7.000-8.500 HackCoins 👍
- **Über 2 Stunden:** 5.000-7.000 HackCoins ✅

---

## 💡 Zusätzliche Tipps

### Browser Developer Tools:
- **F12** oder **Ctrl+Shift+I** öffnet die DevTools
- **Elements Tab:** HTML inspizieren und live ändern
- **Console Tab:** JavaScript ausführen
- **Sources Tab:** JavaScript-Dateien lesen
- **Network Tab:** API-Calls sehen
- **Application Tab:** localStorage/sessionStorage sehen

### Console Commands:
```javascript
// Hilfreiche Commands
window.bypassPaywall()      // Paywall entfernen
window.removeBlur()          // Text-Blur entfernen
window.checkAdmin()          // Admin-Status prüfen
window.vaultHint()          // Vault-Location Hint
window.api.increaseBalance(amount)  // Balance erhöhen
```

### Firebase Console Access:
Du kannst auch direkt auf Firebase zugreifen:
```javascript
// Auth
firebase.auth().currentUser

// Firestore
firebase.firestore().collection('users')

// Dein User-Dokument
firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
```

---

## 🎓 Was du gelernt hast:

1. **Client-Side Security** ist keine echte Security
2. **DOM Manipulation** mit Browser DevTools
3. **CSS Manipulation** zur Umgehung von UI-Sperren
4. **JavaScript Debugging** und Code-Reading
5. **API Manipulation** und Rate Limiting
6. **Firebase Security** (oder fehlende Security 😉)
7. **URL Parameters** und Hidden Routes
8. **Authentication Bypass** Techniken
9. **Business Logic Flaws** ausnutzen
10. **Client-Side Validation** ist umgehbar

---

## ⚠️ Wichtig: Real-World Anwendungen

**NIEMALS** sollten echte Anwendungen solche Schwachstellen haben:

- ❌ Passwörter im Client-Code
- ❌ Wichtige Checks nur im Frontend
- ❌ Balance/Geld im Client speichern
- ❌ API-Limits nur client-seitig
- ❌ Authentifizierung ohne Server
- ❌ Sensitive Daten im localStorage

**Richtige Sicherheit:**
- ✅ Server-seitige Validierung
- ✅ Verschlüsselte Passwörter
- ✅ Backend API mit Auth
- ✅ Rate Limiting auf Server
- ✅ Least Privilege Principle
- ✅ Input Sanitization

---

## 🤝 Feedback & Verbesserungen

Falls du weitere Ideen für Challenges hast oder etwas verbessern möchtest, lass es uns wissen!

**Viel Erfolg beim Hacken! 🚀**
