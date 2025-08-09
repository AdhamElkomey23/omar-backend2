<?php
// Very simple test script
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test database connection only
try {
    $host = 'localhost';
    $db_name = 'u179479756_newomar';
    $username = 'u179479756_newomarapp';
    $password = '#sS9ei3lK+';
    
    $db = new PDO(
        "mysql:host=$host;port=3306;dbname=$db_name;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    // Test a simple query
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM sales");
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database working',
        'sales_count' => $result['count']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>