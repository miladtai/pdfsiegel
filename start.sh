#!/bin/bash

echo "🚀 PDFSeal - Entwicklungsumgebung starten"
echo "=========================================="

# Prüfen ob MAMP läuft
echo "📡 Prüfe MAMP-Status..."
if ! curl -s "http://localhost:8888" > /dev/null; then
    echo "❌ MAMP Apache ist nicht gestartet"
    echo "   Bitte starten Sie MAMP (Port 8888 für Apache, 8889 für MySQL)"
    exit 1
fi

echo "✅ MAMP Apache läuft erfolgreich"

# Backend-Status prüfen
echo "� Backend-Status prüfen..."
BACKEND_STATUS=$(curl -s "http://localhost:8888/pdfsiegel/backend/")
if [[ $BACKEND_STATUS == *"PDF Signature Backend API"* ]]; then
    echo "✅ Backend API ist bereit"
else
    echo "❌ Backend-Problem erkannt"
    echo "   Führen Sie aus: curl http://localhost:8888/pdfsiegel/backend/debug.php"
    exit 1
fi

# Datenbank prüfen
echo "🗄️  Datenbank-Status prüfen..."
DB_CHECK=$(curl -s "http://localhost:8888/pdfsiegel/backend/debug.php")
if [[ $DB_CHECK == *"Datenbankverbindung erfolgreich"* ]]; then
    echo "✅ Datenbank ist bereit"
else
    echo "❌ Datenbankproblem erkannt"
    echo "   Reparatur: curl http://localhost:8888/pdfsiegel/backend/repair-db.php"
fi

# Frontend starten
echo "⚛️  Frontend-Setup..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   📦 Dependencies installieren..."
    npm install
fi

echo ""
echo "🎉 Setup abgeschlossen!"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8888/pdfsiegel/backend/"
echo "   Debug:    http://localhost:8888/pdfsiegel/backend/debug.php"
echo ""
echo "👤 Demo-Benutzer:"
echo "   admin, mchairman, user1 (Passwort: password)"
echo ""
echo "🚀 Frontend wird gestartet..."
echo ""

# Frontend starten
npm start
