#!/bin/bash

echo "🔧 PDFSeal Datenbank-Setup"
echo "=========================="

# MAMP MySQL-Verbindung testen
echo "📡 Teste MySQL-Verbindung..."

# Standard MAMP-Konfiguration
MYSQL_HOST="localhost"
MYSQL_PORT="8889"
MYSQL_USER="root"
MYSQL_PASS="root"
DB_NAME="pdfsiegel"

# MySQL-Verbindung testen
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ MySQL-Verbindung erfolgreich"
else
    echo "❌ MySQL-Verbindung fehlgeschlagen"
    echo "   Bitte prüfen Sie:"
    echo "   - MAMP ist gestartet"
    echo "   - MySQL Port ist 8889"
    echo "   - Benutzername: root, Passwort: root"
    exit 1
fi

# Datenbank erstellen
echo "🗄️  Erstelle Datenbank '$DB_NAME'..."
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo "✅ Datenbank erstellt/verfügbar"
else
    echo "❌ Fehler beim Erstellen der Datenbank"
    exit 1
fi

# Schema laden
echo "📋 Lade Datenbankschema..."
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS $DB_NAME < backend/database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema erfolgreich geladen"
else
    echo "❌ Fehler beim Laden des Schemas"
    exit 1
fi

# Uploads-Verzeichnis erstellen
echo "📁 Erstelle Uploads-Verzeichnis..."
mkdir -p backend/uploads
chmod 755 backend/uploads

if [ -d "backend/uploads" ]; then
    echo "✅ Uploads-Verzeichnis bereit"
else
    echo "❌ Konnte Uploads-Verzeichnis nicht erstellen"
fi

# Berechtigungen prüfen
echo "🔐 Prüfe Berechtigungen..."
if [ -w "backend/uploads" ]; then
    echo "✅ Uploads-Verzeichnis beschreibbar"
else
    echo "❌ Uploads-Verzeichnis nicht beschreibbar"
    echo "   Führen Sie aus: chmod 755 backend/uploads"
fi

echo ""
echo "🎉 Setup abgeschlossen!"
echo ""
echo "🧪 Test das Backend:"
echo "   http://localhost:8888/pdfsiegel/backend/debug.php"
echo ""
echo "🚀 Starte das Frontend:"
echo "   cd frontend && npm install && npm start"
