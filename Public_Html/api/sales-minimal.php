<?php
// Minimal sales API for testing
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Direct database connection 
    $db = new PDO(
        "mysql:host=localhost;port=3306;dbname=u179479756_newomar;charset=utf8mb4",
        'u179479756_newomarapp',
        '#sS9ei3lK+',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Simple GET request
        $stmt = $db->prepare("SELECT * FROM sales ORDER BY created_at DESC");
        $stmt->execute();
        $sales = $stmt->fetchAll();
        
        $formatted = array_map(function($sale) {
            return [
                'id' => (int)$sale['id'],
                'productName' => $sale['product_name'],
                'quantity' => (int)$sale['quantity'],
                'totalAmount' => (float)$sale['total_amount'],
                'saleDate' => $sale['sale_date'],
                'clientName' => $sale['client_name'],
                'clientContact' => $sale['client_contact'] ?? '',
                'createdAt' => $sale['created_at']
            ];
        }, $sales);
        
        echo json_encode($formatted);
    } else {
        echo json_encode(['error' => 'Method not supported in minimal version']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>