<?php
// CORS Headers für React Frontend
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Content-Type für JSON
header("Content-Type: application/json; charset=UTF-8");

// Session starten
session_start();

// Autoloader für Klassen
spl_autoload_register(function ($class_name) {
    $paths = [
        'classes/',
        'config/',
        'api/'
    ];
    
    foreach ($paths as $path) {
        $file = __DIR__ . '/' . $path . $class_name . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Utility-Funktionen
function sendJsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit();
}

function generateCheckNumber($data) {
    // Prüfnummer basierend auf Benutzer und Zeitstempel
    $string = $data['username'] . $data['filename'] . date('Y-m-d');
    return substr(md5($string), 0, 10);
}

function isAuthenticated() {
    return isset($_SESSION['user_authenticated']) && $_SESSION['user_authenticated'] === true;
}

function requireAuth() {
    if (!isAuthenticated()) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }
}
?>
