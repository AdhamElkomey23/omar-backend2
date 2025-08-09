<?php
// Database connection test script for Hostinger deployment
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Include database configuration
require_once 'config/database.php';

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'
    ],
    'database' => [
        'status' => 'unknown',
        'error' => null,
        'connection_test' => false
    ],
    'files' => [
        'config_exists' => file_exists('config/database.php'),
        'htaccess_exists' => file_exists('.htaccess'),
        'api_files' => []
    ]
];

// Test database connection
try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        $response['database']['status'] = 'connected';
        $response['database']['connection_test'] = true;
        
        // Test if tables exist
        $tables = ['workers', 'worker_attendance', 'salary_deductions', 'sales', 'expenses'];
        $existing_tables = [];
        
        foreach ($tables as $table) {
            $stmt = $db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            if ($stmt->fetch()) {
                $existing_tables[] = $table;
            }
        }
        
        $response['database']['tables'] = $existing_tables;
        $response['database']['tables_count'] = count($existing_tables);
    } else {
        $response['database']['status'] = 'failed';
        $response['database']['error'] = 'Failed to create PDO connection';
    }
} catch (Exception $e) {
    $response['database']['status'] = 'error';
    $response['database']['error'] = $e->getMessage();
}

// Check API files
$api_files = ['workers.php', 'attendance.php', 'salary-deductions.php', 'sales.php', 'expenses.php', 'dashboard.php'];
foreach ($api_files as $file) {
    $response['files']['api_files'][$file] = file_exists("api/$file");
}

// Test a simple API endpoint
if ($response['database']['connection_test']) {
    try {
        // Test dashboard endpoint
        $db = $database->getConnection();
        $stmt = $db->query("SELECT COUNT(*) as count FROM workers");
        $workers_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $response['api_test'] = [
            'dashboard_accessible' => true,
            'workers_count' => $workers_count
        ];
    } catch (Exception $e) {
        $response['api_test'] = [
            'dashboard_accessible' => false,
            'error' => $e->getMessage()
        ];
    }
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>