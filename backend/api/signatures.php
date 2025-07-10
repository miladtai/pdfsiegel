<?php
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/SignatureManager.php';
require_once '../classes/PDFStamper.php';

requireAuth();

$database = new Database();
$db = $database->getConnection();
$signatureManager = new SignatureManager($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Neue Signatur erstellen
    try {
        // Detaillierte Validierung
        if (!isset($_FILES['pdf'])) {
            sendJsonResponse(['error' => 'No file uploaded', 'debug' => 'FILES array empty'], 400);
        }
        
        if ($_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
            $errorMsg = 'Upload error: ';
            switch($_FILES['pdf']['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errorMsg .= 'File too large';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errorMsg .= 'File upload incomplete';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errorMsg .= 'No file selected';
                    break;
                default:
                    $errorMsg .= 'Unknown error (' . $_FILES['pdf']['error'] . ')';
            }
            sendJsonResponse(['error' => $errorMsg], 400);
        }
        
        // Datei-Typ prüfen
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $_FILES['pdf']['tmp_name']);
        finfo_close($finfo);
        
        if ($mimeType !== 'application/pdf') {
            sendJsonResponse(['error' => 'Only PDF files allowed', 'detected_type' => $mimeType], 400);
        }
        
        $uploadDir = '../uploads/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                sendJsonResponse(['error' => 'Cannot create upload directory'], 500);
            }
        }
        
        if (!is_writable($uploadDir)) {
            sendJsonResponse(['error' => 'Upload directory not writable'], 500);
        }
        
        $filename = basename($_FILES['pdf']['name']);
        $uploadPath = $uploadDir . uniqid() . '_' . $filename;
        
        if (!move_uploaded_file($_FILES['pdf']['tmp_name'], $uploadPath)) {
            sendJsonResponse(['error' => 'File upload failed', 'target_path' => $uploadPath], 500);
        }
        
        // Stempel-Daten sammeln falls vorhanden
        $stampData = [];
        if (isset($_POST['stamp_x_points'])) {
            $stampData = [
                'stamp_x_points' => $_POST['stamp_x_points'],
                'stamp_y_points' => $_POST['stamp_y_points'],
                'stamp_x_percent' => $_POST['stamp_x_percent'],
                'stamp_y_percent' => $_POST['stamp_y_percent'],
                'stamp_page' => $_POST['stamp_page'],
                'stamp_width' => $_POST['stamp_width'],
                'stamp_height' => $_POST['stamp_height'],
                'stamp_width_points' => $_POST['stamp_width_points'],
                'stamp_height_points' => $_POST['stamp_height_points'],
                'pdf_width' => $_POST['pdf_width'],
                'pdf_height' => $_POST['pdf_height'],
                'canvas_width' => $_POST['canvas_width'],
                'canvas_height' => $_POST['canvas_height'],
                'stamp_name' => $_POST['stamp_name'],
                'stamp_method' => $_POST['stamp_method'],
                'stamp_date' => $_POST['stamp_date'],
                'stamp_user_id' => $_POST['stamp_user_id']
            ];
            
            // Debug-Log für Stempel-Daten
            error_log("Received stamp data: " . json_encode($stampData));
            
            // PDF mit Stempel erstellen
            $stamper = new PDFStamper($uploadPath);
            $stamper->addStamp($stampData);
            $stampResult = $stamper->generate();
            
            if (!$stampResult['success']) {
                sendJsonResponse(['error' => 'Failed to apply stamp: ' . $stampResult['error']], 500);
            }
            
            // Originaldatei durch gestempelte Version ersetzen
            if (file_exists($stamper->getOutputFile())) {
                unlink($uploadPath); // Original löschen
                rename($stamper->getOutputFile(), $uploadPath); // Gestempelte Version verwenden
                error_log("Stamp applied successfully, file replaced");
            }
        }
        
        $userData = $_SESSION['user_data'];
        $signatureData = [
            'filename' => $filename,
            'username' => $userData['username'],
            'firstname' => $userData['firstname'],
            'lastname' => $userData['lastname'],
            'pdf_path' => $uploadPath,
            'stamp_applied' => !empty($stampData)
        ];
        
        $result = $signatureManager->createSignature($signatureData);
        
        if ($result) {
            sendJsonResponse([
                'success' => true,
                'signature' => $result,
                'message' => 'PDF signature created successfully',
                'stamp_applied' => !empty($stampData),
                'debug_stamp_data' => $stampData
            ]);
        } else {
            sendJsonResponse(['error' => 'Failed to create signature in database'], 500);
        }
        
    } catch (Exception $e) {
        error_log("Signature creation error: " . $e->getMessage());
        sendJsonResponse([
            'error' => 'Internal server error',
            'debug_message' => $e->getMessage(),
            'debug_trace' => $e->getTraceAsString()
        ], 500);
    }
}

if ($method === 'GET') {
    if (isset($_GET['check_number'])) {
        // Signatur anhand Prüfnummer abrufen
        $checkNumber = $_GET['check_number'];
        $signature = $signatureManager->getSignatureByCheckNumber($checkNumber);
        
        if ($signature) {
            sendJsonResponse(['signature' => $signature]);
        } else {
            sendJsonResponse(['error' => 'Signature not found'], 404);
        }
    } else {
        // Alle Signaturen des Benutzers abrufen
        $userData = $_SESSION['user_data'];
        $signatures = $signatureManager->getAllSignatures($userData['username']);
        sendJsonResponse(['signatures' => $signatures]);
    }
}

if ($method === 'PUT') {
    // Signatur als heruntergeladen markieren
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['check_number'])) {
        sendJsonResponse(['error' => 'Check number required'], 400);
    }
    
    $success = $signatureManager->markAsDownloaded($data['check_number']);
    
    if ($success) {
        sendJsonResponse(['message' => 'Signature marked as downloaded']);
    } else {
        sendJsonResponse(['error' => 'Failed to update signature'], 500);
    }
}

if ($method === 'DELETE') {
    // Signatur löschen (nur wenn nicht heruntergeladen)
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        sendJsonResponse(['error' => 'Signature ID required'], 400);
    }
    
    $userData = $_SESSION['user_data'];
    $success = $signatureManager->deleteSignature($data['id'], $userData['username']);
    
    if ($success) {
        sendJsonResponse(['message' => 'Signature deleted successfully']);
    } else {
        sendJsonResponse(['error' => 'Failed to delete signature or signature already downloaded'], 400);
    }
}

sendJsonResponse(['error' => 'Method not allowed'], 405);
?>
