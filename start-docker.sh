#!/bin/bash
# PDFSiegel Docker Startup Script für verschiedene Umgebungen

set -e

echo "🐳 PDFSiegel Docker Setup"
echo "========================="

# Farben für bessere Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgabe
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe ob Docker verfügbar ist
if ! command -v docker &> /dev/null; then
    print_error "Docker ist nicht installiert oder nicht im PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose ist nicht installiert oder nicht im PATH"
    exit 1
fi

# Erkenne lokale Server
detect_local_server() {
    local server="none"
    
    # Prüfe MAMP (macOS)
    if [[ -d "/Applications/MAMP" ]]; then
        if pgrep -f "MAMP" > /dev/null; then
            server="mamp"
            print_status "MAMP erkannt und läuft"
        else
            print_warning "MAMP installiert aber nicht gestartet"
        fi
    fi
    
    # Prüfe XAMPP (Linux/Windows/macOS)
    if [[ -d "/opt/lampp" ]] || [[ -d "C:\\xampp" ]] || [[ -d "/Applications/XAMPP" ]]; then
        if pgrep -f "httpd\|apache" > /dev/null; then
            server="xampp"
            print_status "XAMPP erkannt und läuft"
        else
            print_warning "XAMPP installiert aber nicht gestartet"
        fi
    fi
    
    echo $server
}

# Prüfe Port-Konflikte
check_port_conflicts() {
    local ports=("3306" "8888" "8080" "3000")
    local conflicts=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            conflicts+=($port)
        fi
    done
    
    if [[ ${#conflicts[@]} -gt 0 ]]; then
        print_warning "Port-Konflikte erkannt: ${conflicts[*]}"
        print_warning "Docker wird alternative Ports verwenden"
    fi
}

# Hauptfunktion
main() {
    local mode=${1:-"auto"}
    local server=$(detect_local_server)
    
    print_status "Erkannte Umgebung: $server"
    check_port_conflicts
    
    case $mode in
        "auto")
            case $server in
                "mamp")
                    print_status "Starte Docker mit MAMP-Konfiguration"
                    cp .env.mamp .env 2>/dev/null || true
                    docker-compose -f docker-compose.yml -f docker-compose.mamp.yml up -d mysql phpmyadmin mailhog
                    ;;
                "xampp")
                    print_status "Starte Docker mit XAMPP-Konfiguration"
                    cp .env.xampp .env 2>/dev/null || true
                    docker-compose -f docker-compose.yml -f docker-compose.xampp.yml up -d
                    ;;
                *)
                    print_status "Starte Docker standalone"
                    docker-compose up -d
                    ;;
            esac
            ;;
        "mamp")
            print_status "Erzwinge MAMP-Konfiguration"
            cp .env.mamp .env 2>/dev/null || true
            docker-compose -f docker-compose.yml -f docker-compose.mamp.yml up -d mysql phpmyadmin mailhog
            ;;
        "xampp")
            print_status "Erzwinge XAMPP-Konfiguration"
            cp .env.xampp .env 2>/dev/null || true
            docker-compose -f docker-compose.yml -f docker-compose.xampp.yml up -d
            ;;
        "standalone")
            print_status "Erzwinge Standalone-Modus"
            docker-compose up -d
            ;;
        "stop")
            print_status "Stoppe alle Container"
            docker-compose down
            ;;
        "clean")
            print_status "Stoppe Container und lösche Volumes"
            docker-compose down -v
            ;;
        "help"|*)
            echo "Usage: $0 [auto|mamp|xampp|standalone|stop|clean|help]"
            echo ""
            echo "auto       - Automatische Erkennung (Standard)"
            echo "mamp       - MAMP-Integration (nur MySQL + Tools)"
            echo "xampp      - XAMPP-Integration"
            echo "standalone - Docker standalone"
            echo "stop       - Alle Container stoppen"
            echo "clean      - Container stoppen und Volumes löschen"
            echo "help       - Diese Hilfe anzeigen"
            exit 0
            ;;
    esac
    
    if [[ $mode != "stop" && $mode != "clean" && $mode != "help" ]]; then
        echo ""
        print_status "Services gestartet!"
        print_status "Verfügbare URLs:"
        
        case $mode in
            "mamp"|"auto")
                if [[ $server == "mamp" ]]; then
                    echo "  Frontend: http://localhost:3000 (npm start im frontend/ Ordner)"
                    echo "  Backend:  http://localhost:8888 (MAMP)"
                    echo "  MySQL:    localhost:3307 (Docker)"
                    echo "  PHPMyAdmin: http://localhost:8080 (Docker)"
                    echo "  Mailhog:  http://localhost:8025 (E-Mail Testing)"
                    echo ""
                    echo "  MAMP Backend nutzen:"
                    echo "  - Frontend Proxy: http://localhost:8888"
                    echo "  - API-Datei: /Applications/MAMP/htdocs/auth.php"
                fi
                ;;
            "xampp")
                echo "  Frontend: http://localhost:3001"
                echo "  Backend:  http://localhost:8891"
                echo "  MySQL:    localhost:3308"
                echo "  PHPMyAdmin: http://localhost:8081"
                echo "  Redis:    localhost:6379"
                ;;
            *)
                echo "  Frontend: http://localhost:3001"
                echo "  Backend:  http://localhost:8890"
                echo "  MySQL:    localhost:3307"
                echo "  PHPMyAdmin: http://localhost:8080"
                ;;
        esac
        
        echo ""
        print_status "Logs anzeigen: docker-compose logs -f"
        print_status "Container stoppen: $0 stop"
    fi
}

# Starte mit Parametern
main "$@"
