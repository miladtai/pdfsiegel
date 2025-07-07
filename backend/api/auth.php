<?php
require_once '../config/config.php';
require_once '../classes/ADLSAuth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username']) || !isset($data['password'])) {
        sendJsonResponse(['error' => 'Username and password required'], 400);
    }
    
    $auth = new ADLSAuth();
    $user = $auth->authenticate($data['username'], $data['password']);
    
    if ($user) {
        $_SESSION['user_authenticated'] = true;
        $_SESSION['user_data'] = $user;
        
        sendJsonResponse([
            'success' => true,
            'user' => $user,
            'message' => 'Authentication successful'
        ]);
    } else {
        sendJsonResponse(['error' => 'Invalid credentials'], 401);
    }
}

if ($method === 'GET') {
    // Check authentication status
    if (isAuthenticated()) {
        sendJsonResponse([
            'authenticated' => true,
            'user' => $_SESSION['user_data']
        ]);
    } else {
        sendJsonResponse(['authenticated' => false], 401);
    }
}

if ($method === 'DELETE') {
    // Logout
    session_destroy();
    sendJsonResponse(['message' => 'Logged out successfully']);
}

sendJsonResponse(['error' => 'Method not allowed'], 405);
?>
