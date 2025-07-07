<?php
// Hauptindex-Datei für das Backend
require_once 'config/config.php';

// Einfache API-Übersicht
$routes = [
    'Authentication' => [
        'POST /api/auth.php' => 'Login with AD LDS credentials',
        'GET /api/auth.php' => 'Check authentication status',
        'DELETE /api/auth.php' => 'Logout'
    ],
    'Signatures' => [
        'POST /api/signatures.php' => 'Create new signature (with PDF upload)',
        'GET /api/signatures.php' => 'Get user signatures',
        'GET /api/signatures.php?check_number=X' => 'Get signature by check number',
        'PUT /api/signatures.php' => 'Mark signature as downloaded',
        'DELETE /api/signatures.php' => 'Delete signature (if not downloaded)'
    ],
    'Verification' => [
        'GET /api/verify.php?check_number=X' => 'Verify signature by check number'
    ]
];

sendJsonResponse([
    'message' => 'PDF Signature Backend API',
    'version' => '1.0.0',
    'routes' => $routes
]);
?>
