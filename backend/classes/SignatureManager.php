<?php
require_once '../config/config.php';
require_once '../config/database.php';

class SignatureManager {
    private $conn;
    private $table_name = "signatures";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function createSignature($data) {
        try {
            // Prüfen ob PDF bereits signiert wurde
            $existingSignature = $this->getSignatureByFilename($data['filename']);
            
            if ($existingSignature) {
                // Bestehende Signatur aktualisieren
                return $this->addSignatureToExisting($existingSignature['check_number'], $data);
            } else {
                // Neue Signatur erstellen
                return $this->createNewSignature($data);
            }
        } catch (Exception $e) {
            error_log("Signature creation error: " . $e->getMessage());
            return false;
        }
    }
    
    private function createNewSignature($data) {
        $checkNumber = generateCheckNumber($data);
        
        $query = "INSERT INTO " . $this->table_name . " 
                 (check_number, filename, username, firstname, lastname, signature_count, created_at, is_downloaded) 
                 VALUES (?, ?, ?, ?, ?, 1, NOW(), 0)";
        
        $stmt = $this->conn->prepare($query);
        
        if ($stmt->execute([
            $checkNumber,
            $data['filename'],
            $data['username'],
            $data['firstname'],
            $data['lastname']
        ])) {
            return [
                'id' => $this->conn->lastInsertId(),
                'check_number' => $checkNumber,
                'signature_count' => 1
            ];
        }
        
        return false;
    }
    
    private function addSignatureToExisting($checkNumber, $data) {
        // Signaturanzahl erhöhen
        $query = "UPDATE " . $this->table_name . " 
                 SET signature_count = signature_count + 1,
                     updated_at = NOW()
                 WHERE check_number = ?";
        
        $stmt = $this->conn->prepare($query);
        
        if ($stmt->execute([$checkNumber])) {
            // Aktuelle Daten abrufen
            $current = $this->getSignatureByCheckNumber($checkNumber);
            return [
                'id' => $current['id'],
                'check_number' => $checkNumber,
                'signature_count' => $current['signature_count']
            ];
        }
        
        return false;
    }
    
    public function getSignatureByCheckNumber($checkNumber) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE check_number = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$checkNumber]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getSignatureByFilename($filename) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE filename = ? ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$filename]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function markAsDownloaded($checkNumber) {
        $query = "UPDATE " . $this->table_name . " 
                 SET is_downloaded = 1, downloaded_at = NOW() 
                 WHERE check_number = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$checkNumber]);
    }
    
    public function deleteSignature($id, $username) {
        // Nur löschbar wenn noch nicht heruntergeladen und vom selben Benutzer
        $query = "DELETE FROM " . $this->table_name . " 
                 WHERE id = ? AND username = ? AND is_downloaded = 0";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id, $username]);
    }
    
    public function getSignatureHistory($checkNumber) {
        $query = "SELECT username, firstname, lastname, filename, created_at, signature_count 
                 FROM " . $this->table_name . " 
                 WHERE check_number = ? 
                 ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$checkNumber]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getAllSignatures($username = null) {
        $query = "SELECT * FROM " . $this->table_name;
        $params = [];
        
        if ($username) {
            $query .= " WHERE username = ?";
            $params[] = $username;
        }
        
        $query .= " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
