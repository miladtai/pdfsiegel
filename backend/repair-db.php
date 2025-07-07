<?php
// Datenbank-Repair-Script
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<h1>🔧 PDFSeal Datenbank-Reparatur</h1>";
    
    // Foreign Key Checks deaktivieren und Tabellen löschen
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    $db->exec("DROP TABLE IF EXISTS signature_audit");
    $db->exec("DROP TABLE IF EXISTS audit_log");
    $db->exec("DROP TABLE IF EXISTS user_sessions");
    $db->exec("DROP TABLE IF EXISTS signatures");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "✅ Alle Tabellen gelöscht<br>";
    
    // Neue Tabelle erstellen
    $sql = "
    CREATE TABLE signatures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        check_number VARCHAR(50) NOT NULL UNIQUE,
        filename VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL,
        firstname VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        signature_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        downloaded_at TIMESTAMP NULL,
        is_downloaded BOOLEAN DEFAULT FALSE,
        pdf_path VARCHAR(500) NULL,
        signature_data TEXT NULL,
        INDEX idx_check_number (check_number),
        INDEX idx_username (username),
        INDEX idx_filename (filename),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB;
    ";
    
    $db->exec($sql);
    echo "✅ Neue Tabelle erstellt<br>";
    
    // Beispieldaten einfügen
    $stmt = $db->prepare("
        INSERT INTO signatures (check_number, filename, username, firstname, lastname, signature_count, is_downloaded) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute(['abc123def4', 'Bescheinigung_WEG.pdf', 'mchairman', 'Milad', 'Chairangoon', 1, 1]);
    $stmt->execute(['xyz789ghi2', 'Vertrag_Muster.pdf', 'admin', 'Admin', 'User', 2, 0]);
    
    echo "✅ Beispieldaten eingefügt<br>";
    
    // Tabellenstruktur prüfen
    $stmt = $db->query("DESCRIBE signatures");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>📋 Neue Tabellenstruktur:</h2>";
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Spalte</th><th>Typ</th><th>Null</th><th>Key</th></tr>";
    foreach($columns as $col) {
        echo "<tr>";
        echo "<td>{$col['Field']}</td>";
        echo "<td>{$col['Type']}</td>";
        echo "<td>{$col['Null']}</td>";
        echo "<td>{$col['Key']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2>🎉 Datenbank erfolgreich repariert!</h2>";
    echo "<p><a href='debug.php'>Debug-Script erneut ausführen</a></p>";
    echo "<p><a href='index.php'>Zurück zur API</a></p>";
    
} catch (Exception $e) {
    echo "<h1>❌ Fehler</h1>";
    echo "<p>Fehler: " . $e->getMessage() . "</p>";
}
?>
