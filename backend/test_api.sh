#!/bin/bash

# Test der API mit einem echten PDF-Upload und Stempel-Daten

PDF_FILE="/Applications/MAMP/htdocs/pdfsiegel/backend/uploads/test.pdf"
API_URL="http://localhost:8888/pdfsiegel/backend/api/signatures.php"

echo "=== PDF-Signatur API Test ==="
echo "PDF-Datei: $PDF_FILE"
echo "API-URL: $API_URL"
echo ""

# Erstelle eine Dummy-Session für den Test (falls keine Login-Session existiert)
COOKIE_JAR="/tmp/test_cookies.txt"

# Prüfe ob PDF existiert
if [ ! -f "$PDF_FILE" ]; then
    echo "FEHLER: PDF-Datei nicht gefunden: $PDF_FILE"
    exit 1
fi

echo "Sende PDF mit Stempel-Daten an API..."

# Sende POST-Request mit PDF und Stempel-Daten
curl -v \
    --cookie-jar "$COOKIE_JAR" \
    --cookie "$COOKIE_JAR" \
    -X POST \
    -F "pdf=@$PDF_FILE" \
    -F "stamp_x_points=150.0" \
    -F "stamp_y_points=200.0" \
    -F "stamp_x_percent=25.0" \
    -F "stamp_y_percent=35.0" \
    -F "stamp_page=1" \
    -F "stamp_width=200" \
    -F "stamp_height=80" \
    -F "stamp_width_points=200.0" \
    -F "stamp_height_points=80.0" \
    -F "pdf_width=595.276" \
    -F "pdf_height=841.89" \
    -F "canvas_width=500" \
    -F "canvas_height=700" \
    -F "stamp_name=API Test User" \
    -F "stamp_method=Signiert mit AD 99999" \
    -F "stamp_date=$(date '+%d.%m.%Y, %H:%M') Uhr" \
    -F "stamp_user_id=99999" \
    "$API_URL"

echo ""
echo "=== Test abgeschlossen ==="
