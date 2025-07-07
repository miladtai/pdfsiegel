<?php
// Debug-Script für PDFSeal Backend
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>PDFSeal Backend Debug</h1>";

// 1. PHP-Konfiguration prüfen
echo "<h2>1. PHP-Konfiguration</h2>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Upload Max Filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "Post Max Size: " . ini_get('post_max_size') . "<br>";
echo "Max Execution Time: " . ini_get('max_execution_time') . "<br>";

// 2. Verzeichnisse prüfen
echo "<h2>2. Verzeichnisstruktur</h2>";
$dirs = ['config', 'classes', 'api', 'uploads'];
foreach($dirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    $status = is_dir($path) ? '✅ Existiert' : '❌ Fehlt';
    $writable = is_writable($path) ? ' (beschreibbar)' : ' (nicht beschreibbar)';
    echo "$dir: $status$writable<br>";
}

// 3. Uploads-Verzeichnis erstellen falls nötig
if (!is_dir(__DIR__ . '/uploads')) {
    if (mkdir(__DIR__ . '/uploads', 0755, true)) {
        echo "✅ Uploads-Verzeichnis erstellt<br>";
    } else {
        echo "❌ Konnte Uploads-Verzeichnis nicht erstellen<br>";
    }
}

// 4. Datenbankverbindung testen
echo "<h2>3. Datenbankverbindung</h2>";
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "✅ Datenbankverbindung erfolgreich<br>";
        
        // Tabellen prüfen
        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (in_array('signatures', $tables)) {
            echo "✅ Tabelle 'signatures' existiert<br>";
            
            // Tabellenstruktur prüfen
            $stmt = $db->query("DESCRIBE signatures");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "📋 Spalten: " . implode(', ', array_column($columns, 'Field')) . "<br>";
        } else {
            echo "❌ Tabelle 'signatures' fehlt<br>";
            echo "<strong>Lösung:</strong> Führen Sie database/schema.sql aus<br>";
        }
    } else {
        echo "❌ Datenbankverbindung fehlgeschlagen<br>";
    }
} catch (Exception $e) {
    echo "❌ Datenbankfehler: " . $e->getMessage() . "<br>";
}

// 5. API-Endpunkte testen
echo "<h2>4. API-Endpunkte</h2>";
$apis = ['auth.php', 'signatures.php', 'verify.php'];
foreach($apis as $api) {
    $path = __DIR__ . '/api/' . $api;
    $status = file_exists($path) ? '✅ Existiert' : '❌ Fehlt';
    echo "api/$api: $status<br>";
}

// 6. Session-Test
echo "<h2>5. Session-Funktionalität</h2>";
session_start();
$_SESSION['test'] = 'working';
echo "Session-Test: " . ($_SESSION['test'] === 'working' ? '✅ Funktioniert' : '❌ Fehler') . "<br>";

// 7. Erweiterte PHP-Erweiterungen
echo "<h2>6. PHP-Erweiterungen</h2>";
$required_extensions = ['pdo', 'pdo_mysql', 'json', 'session'];
foreach($required_extensions as $ext) {
    $status = extension_loaded($ext) ? '✅' : '❌';
    echo "$ext: $status<br>";
}

echo "<h2>7. Lösungsvorschläge</h2>";
echo "<div style='background: #f0f0f0; padding: 15px; margin: 10px 0;'>";
echo "<strong>Falls Fehler auftreten:</strong><br>";
echo "1. MAMP Apache & MySQL starten (Ports 8888/8889)<br>";
echo "2. Datenbank erstellen: mysql -u root -proot -P 8889 -h localhost < database/schema.sql<br>";
echo "3. Uploads-Verzeichnis: chmod 755 uploads/<br>";
echo "4. .htaccess prüfen und CORS-Header aktivieren<br>";
echo "</div>";
?>

<script>
console.log('PDFSeal Backend Debug completed');
</script>
