<?php
// Emergency fix for expenses API with comprehensive error handling
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
            // Get all expenses
            $stmt = $db->query("SELECT * FROM expenses ORDER BY id DESC");
            $expenses = $stmt->fetchAll();
            
            $formattedExpenses = array_map(function($expense) {
                return [
                    'id' => (int)$expense['id'],
                    'name' => $expense['name'],
                    'amount' => (float)$expense['amount'],
                    'category' => $expense['category'],
                    'expenseDate' => $expense['expense_date'],
                    'createdAt' => $expense['created_at'] ?? date('Y-m-d H:i:s')
                ];
            }, $expenses);
            
            echo json_encode($formattedExpenses);
            break;
            
        case 'POST':
            // Add new expense with enhanced error handling
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
            $required = ['name', 'amount', 'category'];
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
            if (!is_numeric($input['amount']) || $input['amount'] <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Amount must be a positive number']);
                exit();
            }
            
            // Insert with error handling
            $query = "INSERT INTO expenses (name, amount, category, expense_date, created_at) 
                     VALUES (?, ?, ?, ?, NOW())";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                $input['name'],
                (float)$input['amount'],
                $input['category'],
                $input['expenseDate'] ?? date('Y-m-d')
            ]);
            
            if ($result) {
                $newId = $db->lastInsertId();
                echo json_encode([
                    'success' => true,
                    'id' => (int)$newId,
                    'message' => 'Expense added successfully'
                ]);
            } else {
                throw new Exception('Failed to insert expense record');
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
                echo json_encode(['error' => 'Missing expense ID']);
                exit();
            }
            
            $stmt = $db->prepare("DELETE FROM expenses WHERE id = ?");
            $result = $stmt->execute([$input['id']]);
            
            if ($result && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Expense deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Expense not found']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch (PDOException $e) {
    error_log("Expenses API Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    error_log("Expenses API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
        'line' => $e->getLine()
    ]);
}
?>