# PDFSiegel - Docker Setup für MAMP & XAMPP

## Übersicht

PDFSiegel unterstützt verschiedene Entwicklungsumgebungen:
- **Docker Standalone** - Komplett in Docker (empfohlen für Produktion)
- **MAMP Integration** - Nur Docker MySQL, Backend/Frontend über MAMP
- **XAMPP Integration** - Flexible Kombination Docker + XAMPP

## Schnellstart

```bash
# Automatische Erkennung und Start
./start-docker.sh

# Spezifische Umgebung
./start-docker.sh mamp    # Für MAMP
./start-docker.sh xampp   # Für XAMPP
./start-docker.sh standalone  # Nur Docker
```

## Konfigurationen

### 1. MAMP Integration (macOS)

**Voraussetzungen:**
- MAMP installiert und gestartet
- MAMP läuft auf Port 8888 (Apache) und 8889 (MySQL)

**Docker Services:**
- MySQL auf Port 3307 (eigene Datenbank)
- PHPMyAdmin auf Port 8080
- Mailhog für E-Mail Testing

**Verwendung:**
```bash
# Docker-Services für MAMP starten
./start-docker.sh mamp

# Frontend entwickeln
cd frontend && npm start
# → http://localhost:3000

# Backend über MAMP
# → http://localhost:8888
```

**Ports:**
- Frontend: 3000 (npm start)
- Backend: 8888 (MAMP)
- MySQL Docker: 3307
- MySQL MAMP: 8889
- PHPMyAdmin: 8080
- Mailhog: 8025

### 2. XAMPP Integration (Windows/Linux/macOS)

**Voraussetzungen:**
- XAMPP installiert
- Standard-XAMPP-Konfiguration

**Docker Services:**
- Vollständiger Stack mit alternativen Ports
- Redis für Session-Management

**Verwendung:**
```bash
# Docker für XAMPP starten
./start-docker.sh xampp

# Services nutzen
# → http://localhost:3001 (Frontend)
# → http://localhost:8891 (Backend)
```

**Ports:**
- Frontend: 3001
- Backend: 8891
- MySQL: 3308
- PHPMyAdmin: 8081
- Redis: 6379

### 3. Docker Standalone

**Verwendung:**
- Kompletter Stack in Docker
- Empfohlen für Produktion

```bash
# Standalone starten
./start-docker.sh standalone

# Oder direkt
docker-compose up -d
```

**Ports:**
- Frontend: 3001
- Backend: 8890
- MySQL: 3307
- PHPMyAdmin: 8080

## Environment-Dateien

### `.env` (Aktive Konfiguration)
Wird automatisch erstellt basierend auf erkannter Umgebung.

### `.env.mamp` (MAMP-Vorlage)
```env
DB_PORT=3306
BACKEND_PORT=disabled
FRONTEND_PORT=disabled
REACT_APP_BACKEND_URL=http://localhost:8888
LOCAL_SERVER=mamp
```

### `.env.xampp` (XAMPP-Vorlage)
```env
DB_PORT=3308
BACKEND_PORT=8891
FRONTEND_PORT=3001
REACT_APP_BACKEND_URL=http://localhost:8891
LOCAL_SERVER=xampp
```

## Docker Compose Dateien

### `docker-compose.yml` (Basis)
- Standard-Konfiguration
- Flexible Ports über Environment-Variablen

### `docker-compose.mamp.yml` (MAMP Override)
- Deaktiviert Backend/Frontend Container
- Nur MySQL, PHPMyAdmin, Mailhog

### `docker-compose.xampp.yml` (XAMPP Override)
- Alternative Ports für alle Services
- Zusätzlicher Redis-Container

## Kommandos

```bash
# Entwicklung
./start-docker.sh                    # Auto-Erkennung
./start-docker.sh mamp              # MAMP-Modus
./start-docker.sh xampp             # XAMPP-Modus
./start-docker.sh standalone        # Docker-Only

# Management
./start-docker.sh stop              # Container stoppen
./start-docker.sh clean             # Container + Volumes löschen
./start-docker.sh help              # Hilfe anzeigen

# Docker-Compose direkt
docker-compose up -d                # Standard
docker-compose -f docker-compose.yml -f docker-compose.mamp.yml up -d
docker-compose logs -f backend      # Logs anzeigen
docker-compose ps                   # Status prüfen
```

## Port-Konflikte vermeiden

Das Skript erkennt automatisch belegte Ports und verwendet Alternativen:

| Service | Standard | MAMP Alt | XAMPP Alt | Beschreibung |
|---------|----------|----------|-----------|--------------|
| MySQL   | 3306     | 3307     | 3308      | Datenbank |
| Backend | 8888     | disabled | 8891      | PHP/Apache |
| Frontend| 3000     | disabled | 3001      | React Dev Server |
| PHPMyAdmin| 8080   | 8080     | 8081      | DB Management |

## Entwickler-Workflows

### MAMP-Entwicklung
1. MAMP starten
2. `./start-docker.sh mamp` - Nur DB-Services
3. `cd frontend && npm start` - Frontend entwickeln  
4. Backend über MAMP: `http://localhost:8888`

### XAMPP-Entwicklung
1. XAMPP starten (optional)
2. `./start-docker.sh xampp` - Alle Services mit Alt-Ports
3. Full-Stack Development möglich

### Reine Docker-Entwicklung
1. `./start-docker.sh standalone`
2. Alles in Docker
3. Produktionsähnliche Umgebung

## Troubleshooting

### Port bereits belegt
```bash
# Prüfe belegte Ports
lsof -i :3306
lsof -i :8888

# Alternative Ports verwenden
./start-docker.sh xampp
```

### Container starten nicht
```bash
# Logs prüfen
docker-compose logs

# Container neu bauen
docker-compose build --no-cache

# Volumes löschen (Achtung: Datenverlust!)
./start-docker.sh clean
```

### MAMP/XAMPP nicht erkannt
```bash
# Manuell erzwingen
./start-docker.sh mamp   # oder xampp
```

### Database Connection Fehler
```bash
# MySQL Container prüfen
docker-compose exec mysql mysql -u root -p

# PHPMyAdmin nutzen
# → http://localhost:8080
```

## Migration

### Von MAMP zu Docker
1. MySQL-Export aus MAMP
2. `./start-docker.sh standalone`
3. Daten in Docker-MySQL importieren

### Von XAMPP zu Docker
1. Backup der XAMPP-Datenbank
2. `./start-docker.sh standalone` 
3. Konfiguration anpassen

## Produktion

Für Produktionsumgebung:
```bash
# Produktions-Setup (separates Repo)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Support

Bei Problemen:
1. `./start-docker.sh help` für verfügbare Optionen
2. `docker-compose logs -f` für detaillierte Logs
3. GitHub Issues für Bug-Reports
