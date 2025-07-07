#!/bin/bash

echo "🐳 PDFSeal - Docker-Container starten"
echo "====================================="

# Docker-Compose ausführen
echo "📦 Container werden gestartet..."
docker-compose up -d

echo ""
echo "⏳ Warte auf Container-Start..."
sleep 10

# Status prüfen
echo "📊 Container-Status:"
docker-compose ps

echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8888"
echo "   MySQL:    localhost:3306"
echo ""

# Logs anzeigen
echo "📋 Container-Logs:"
docker-compose logs --tail=20

echo ""
echo "🔍 Logs verfolgen: docker-compose logs -f"
echo "🛑 Container stoppen: docker-compose down"
