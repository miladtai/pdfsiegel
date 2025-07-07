<?php
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../classes/SignatureManager.php';

requireAuth();

$database = new Database();
$db = $database->getConnection();
$signatureManager = new SignatureManager($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!isset($_GET['check_number'])) {
        sendJsonResponse(['error' => 'Check number required'], 400);
    }
    
    $checkNumber = $_GET['check_number'];
    $history = $signatureManager->getSignatureHistory($checkNumber);
    
    if (empty($history)) {
        sendJsonResponse(['error' => 'No signatures found for this check number'], 404);
    }
    
    // Zusätzliche Informationen für die Prüfung
    $verificationData = [
        'check_number' => $checkNumber,
        'signatures' => $history,
        'total_signatures' => count($history),
        'first_signature' => $history[count($history) - 1]['created_at'],
        'last_signature' => $history[0]['created_at'],
        'verified_at' => date('Y-m-d H:i:s')
    ];
    
    sendJsonResponse(['verification' => $verificationData]);
}

sendJsonResponse(['error' => 'Method not allowed'], 405);
?>
