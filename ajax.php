<?php
session_start();

// Load environment variables
if (file_exists(__DIR__ . '/.env.php')) {
    include_once __DIR__ . '/.env.php';
}

// Handle JSON POST body
$input = json_decode(file_get_contents('php://input'), true);
if (is_array($input)) {
    $_POST = array_merge($_POST, $input);
}

// Spoofing password for now if not defined in .env.php
$correct_pw = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : 'password123';

if (!isset($_POST['p']) || $_POST['p'] !== $correct_pw) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Unauthorized ' . $_POST['p']]);
    exit;
}

$toonsDir = __DIR__ . '/resource/toons';
$toons = [];

if (is_dir($toonsDir)) {
    $items = scandir($toonsDir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $path = $toonsDir . '/' . $item;
        if (is_dir($path)) {
            $files = scandir($path);
            $toonFiles = [];
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                if (is_file($path . '/' . $file)) {
                    $toonFiles[] = $file;
                }
            }
            $toons[$item] = $toonFiles;
        }
    }
}

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'toons' => $toons
]);
