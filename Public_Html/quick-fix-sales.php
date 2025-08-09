<?php
// Emergency fix for sales API with comprehensive error handling
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting but don't display in JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Direct database connection
    $host = 'localhost';
    $db_name = 'u179479756_newomar';
    $username = 'u179479756_newomarapp';
    $password = '#sS9ei3lK+';
    
    $db = new PDO(
        "mysql:host=$host;dbname=$db_name;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch($method) {
        case 'GET':
            // Get all sales
            $stmt = $db->query("SELECT * FROM sales ORDER BY id DESC");
            $sales = $stmt->fetchAll();
            
            $formattedSales = array_map(function($sale) {
                return [
                    'id' => (int)$sale['id'],
                    'productName' => $sale['product_name'],
                    'quantity' => (int)$sale['quantity'],
                    'totalAmount' => (float)$sale['total_amount'],
                    'saleDate' => $sale['sale_date'],
                    'clientName' => $sale['client_name'],
                    'clientContact' => $sale['client_contact'] ?? '',
                    'createdAt' => $sale['created_at'] ?? date('Y-m-d H:i:s')
                ];
            }, $sales);
            
            echo json_encode($formattedSales);
            break;
            
        case 'POST':
            // Add new sale with enhanced error handling
            $rawInput = file_get_contents('php://input');
            
            if (empty($rawInput)) {
                http_response_code(400);
                echo json_encode(['error' => 'No input data received']);
                exit();
            }
            
            $input = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
                exit();
            }
            
            // Validate required fields
            $required = ['productName', 'quantity', 'totalAmount', 'clientName'];
            $missing = [];
            
            foreach ($required as $field) {
                if (!isset($input[$field]) || (is_string($input[$field]) && trim($input[$field]) === '')) {
                    $missing[] = $field;
                }
            }
            
            if (!empty($missing)) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields: ' . implode(', ', $missing)]);
                exit();
            }
            
            // Validate data types
            if (!is_numeric($input['quantity']) || $input['quantity'] <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Quantity must be a positive number']);
                exit();
            }
            
            if (!is_numeric($input['totalAmount']) || $input['totalAmount'] <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Total amount must be a positive number']);
                exit();
            }
            
            // Insert with error handling
            $query = "INSERT INTO sales (product_name, quantity, total_amount, sale_date, client_name, client_contact, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                $input['productName'],
                (int)$input['quantity'],
                (float)$input['totalAmount'],
                $input['saleDate'] ?? date('Y-m-d'),
                $input['clientName'],
                $input['clientContact'] ?? ''
            ]);
            
            if ($result) {
                $newId = $db->lastInsertId();
                echo json_encode([
                    'success' => true,
                    'id' => (int)$newId,
                    'message' => 'Sale added successfully'
                ]);
            } else {
                throw new Exception('Failed to insert sale record');
            }
            break;
            
        case 'DELETE':
            // Delete with validation
            $rawInput = file_get_contents('php://input');
            
            if (empty($rawInput)) {
                http_response_code(400);
                echo json_encode(['error' => 'No input data received']);
                exit();
            }
            
            $input = json_decode($rawInput, true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing sale ID']);
                exit();
            }
            
            $stmt = $db->prepare("DELETE FROM sales WHERE id = ?");
            $result = $stmt->execute([$input['id']]);
            
            if ($result && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Sale deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Sale not found']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch (PDOException $e) {
    error_log("Sales API Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    error_log("Sales API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
        'line' => $e->getLine()
    ]);
}
?>