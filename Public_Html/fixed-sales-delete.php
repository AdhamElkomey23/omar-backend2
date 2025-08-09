<?php
// Enhanced sales API with better DELETE handling
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't show in JSON response
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
        case 'DELETE':
            // Enhanced DELETE with better error handling
            
            // Get input data
            $rawInput = file_get_contents('php://input');
            error_log("DELETE Raw input: " . $rawInput);
            
            if (empty($rawInput)) {
                http_response_code(400);
                echo json_encode(['error' => 'No input data received']);
                exit();
            }
            
            $input = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON data: ' . json_last_error_msg()]);
                exit();
            }
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing sale ID', 'received' => $input]);
                exit();
            }
            
            $saleId = $input['id'];
            
            // Validate ID is numeric
            if (!is_numeric($saleId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid sale ID format']);
                exit();
            }
            
            // Check if record exists before deleting
            $checkStmt = $db->prepare("SELECT id FROM sales WHERE id = ?");
            $checkStmt->execute([$saleId]);
            
            if ($checkStmt->rowCount() == 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Sale not found']);
                exit();
            }
            
            // Perform delete
            $deleteStmt = $db->prepare("DELETE FROM sales WHERE id = ?");
            $result = $deleteStmt->execute([$saleId]);
            
            if ($result) {
                $rowsAffected = $deleteStmt->rowCount();
                if ($rowsAffected > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Sale deleted successfully',
                        'deletedId' => $saleId,
                        'rowsAffected' => $rowsAffected
                    ]);
                } else {
                    echo json_encode(['error' => 'No rows were deleted']);
                }
            } else {
                throw new Exception('DELETE query execution failed');
            }
            break;
            
        case 'GET':
            // Get all sales
            $stmt = $db->query("SELECT * FROM sales ORDER BY created_at DESC");
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
                    'createdAt' => $sale['created_at']
                ];
            }, $sales);
            
            echo json_encode($formattedSales);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed: ' . $method]);
            break;
    }
    
} catch (PDOException $e) {
    error_log("Sales API Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Sales API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>