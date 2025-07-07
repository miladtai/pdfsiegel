-- Datenbank für PDF-Signatur-System
CREATE DATABASE IF NOT EXISTS pdfsiegel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pdfsiegel;

-- Tabelle für Signaturen
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

-- Tabelle für Benutzer-Sessions (optional)
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(128) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_session_id (session_id),
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- Tabelle für Audit-Log
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100) NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Beispieldaten einfügen
INSERT INTO signatures (check_number, filename, username, firstname, lastname, signature_count, is_downloaded) VALUES
('abc123def4', 'Bescheinigung_WEG.pdf', 'mchairman', 'Milad', 'Chairangoon', 1, TRUE),
('xyz789ghi2', 'Vertrag_Muster.pdf', 'admin', 'Admin', 'User', 2, FALSE);

-- Audit-Log Beispiele
INSERT INTO audit_log (username, action, resource_type, resource_id, details, ip_address) VALUES
('mchairman', 'SIGN_PDF', 'signature', 'abc123def4', 'PDF erfolgreich signiert', '127.0.0.1'),
('admin', 'LOGIN', 'session', NULL, 'Benutzer angemeldet', '127.0.0.1');
