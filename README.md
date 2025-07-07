# PDFSeal - Barrierefreie PDF-Signatur-WebApp

Eine vollständige, barrierefreie Webanwendung zur PDF-Signatur mit React, Bootstrap und AD LDS-Authentifizierung für die Stadt Kaiserslautern.

## 🎯 Hauptfunktionen

### 1. PDF signieren
- Drag & Drop PDF-Upload
- Automatische Prüfnummer-Generierung
- Benutzer-basierte Signaturverfolgung
- Download-Management

### 2. Signaturen prüfen
- Prüfnummer-basierte Verifikation
- Detaillierte Signaturhistorie
- Nachvollziehbare Authentifizierung

## 🚀 Technologie-Stack

### Frontend
- **React 18** mit Hooks
- **Bootstrap 5** für responsive UI
- **React Bootstrap** Komponenten
- **Axios** für API-Kommunikation
- **React Dropzone** für Datei-Upload
- **PDF-lib** für PDF-Verarbeitung

### Backend
- **PHP 8.2** mit Apache
- **MySQL 8.0** Datenbank
- **AD LDS** Integration (Mock + Produktiv)
- **RESTful API** Design

### Entwicklungsumgebung
- **MAMP** (Apache Port 8888, MySQL Port 8889)
- **Docker** für Container-Deployment
- **npm** für Frontend-Dependencies

## 📋 Barrierefreiheit (WCAG 2.1)

- **Semantisches HTML** mit korrekten Rollen
- **Keyboard-Navigation** vollständig unterstützt
- **Screen Reader** optimiert
- **Hochkontrast-Modus** verfügbar
- **Focus-Management** implementiert
- **Skip-Links** für bessere Navigation
- **Aria-Labels** und Beschreibungen

## 🏗️ Installation

### MAMP Setup (Entwicklung)

1. **MAMP starten** (Apache Port 8888, MySQL Port 8889)

2. **Datenbank erstellen:**
   ```bash
   # MySQL-Konsole öffnen und ausführen:
   mysql -u root -p -P 8889 -h localhost < backend/database/schema.sql
   ```

3. **Backend-Verzeichnis:**
   ```bash
   cd /Applications/MAMP/htdocs/pdfsiegel/backend
   # Uploads-Ordner erstellen
   mkdir uploads
   chmod 755 uploads
   ```

4. **Frontend installieren:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Docker Setup (Produktion)

```bash
# Alle Container starten
docker-compose up -d

# Logs verfolgen
docker-compose logs -f

# Container stoppen
docker-compose down
```

## 🔧 Konfiguration

### Backend-Konfiguration

Datei: `backend/config/database.php`
```php
private $host = "localhost";
private $port = "8889"; // MAMP MySQL Port
private $db_name = "pdfsiegel";
private $username = "root";
private $password = "root";
```

### AD LDS-Konfiguration

Datei: `backend/classes/ADLSAuth.php`
```php
// Produktive Einstellungen anpassen:
$this->server = "your-ad-server.com";
$this->port = 389;
$this->baseDn = "DC=yourdomain,DC=com";
```

### Demo-Benutzer

Für Entwicklung und Tests:
- **Username:** admin, mchairman, user1
- **Passwort:** password (für alle)

## 📡 API-Endpunkte

### Authentifizierung
- `POST /api/auth.php` - Anmeldung
- `GET /api/auth.php` - Status prüfen
- `DELETE /api/auth.php` - Abmelden

### Signaturen
- `POST /api/signatures.php` - PDF signieren
- `GET /api/signatures.php` - Benutzer-Signaturen
- `PUT /api/signatures.php` - Als heruntergeladen markieren
- `DELETE /api/signatures.php` - Signatur löschen

### Verifikation
- `GET /api/verify.php?check_number=X` - Signatur prüfen

## 🗃️ Datenbankschema

### Tabelle: signatures
```sql
- id (Auto-Increment)
- check_number (Eindeutige Prüfnummer)
- filename (PDF-Dateiname)
- username, firstname, lastname (Benutzerinfo)
- signature_count (Anzahl Signaturen)
- created_at, updated_at (Zeitstempel)
- is_downloaded (Download-Status)
```

## 🎨 UI/UX Features

### Kaiserslautern Branding
- Rotes Corporate Design (#dc2626)
- Stadt-Logo Integration
- Konsistente Farbpalette

### Responsive Design
- Mobile-first Ansatz
- Tablet-optimiert
- Desktop-Vollansicht

### Benutzerführung
- Klare Schritt-für-Schritt Anleitung
- Visuelles Feedback bei allen Aktionen
- Intuitive Drag & Drop-Funktionalität

## 🔒 Sicherheitsfeatures

### Authentifizierung
- AD LDS Integration
- Session-Management
- Sichere Passwort-Übertragung

### Datenschutz
- Keine persistente Dateispeicherung
- Benutzer-isolierte Daten
- Audit-Log für Nachverfolgung

### Validierung
- Datei-Typ-Prüfung (nur PDF)
- Größen-Beschränkung (5MB)
- Input-Sanitization

## 📱 Browser-Unterstützung

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🧪 Testing

```bash
# Frontend Tests
cd frontend
npm test

# API Tests (mit Postman/curl)
curl -X POST http://localhost:8888/pdfsiegel/backend/api/auth.php \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

## 📊 Performance

### Optimierungen
- Lazy Loading für Komponenten
- Minimierte Bundle-Größe
- Optimierte Bilder und Assets
- Caching-Strategien

### Monitoring
- Error Boundaries für React
- Backend-Logging
- Performance-Metriken

## 🔧 Entwicklung

### Lokale Entwicklung starten:
```bash
# Terminal 1: MAMP starten (oder Docker)
# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Backend ist über MAMP verfügbar
# http://localhost:8888/pdfsiegel/backend/
```

### Code-Struktur:
```
pdfsiegel/
├── backend/                 # PHP Backend
│   ├── api/                # REST-Endpunkte
│   ├── classes/            # PHP-Klassen
│   ├── config/             # Konfiguration
│   └── database/           # SQL-Schema
├── frontend/               # React Frontend
│   ├── public/             # Statische Dateien
│   ├── src/                # React-Quellcode
│   │   ├── components/     # React-Komponenten
│   │   └── index.js        # Einstiegspunkt
└── docker-compose.yml      # Container-Setup
```

## 🆘 Support

**Kontakt:**
- **Tel:** 0631/365-1632
- **E-Mail:** support@kaiserslautern.de

**Entwickler-Support:**
- GitHub Issues für Bugs
- Pull Requests für Features
- Code-Reviews erwünscht

## 📜 Lizenz

© 2025 Stadt Kaiserslautern - Alle Rechte vorbehalten.

---

**Entwickelt für die Stadt Kaiserslautern**  
*Sichere, barrierefreie PDF-Signatur-Lösung*