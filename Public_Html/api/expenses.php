<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

// Try to get database connection, fall back to mock data if fails
$db = DatabaseConfig::getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if ($db === null) {
                // Use mock data when database is not available
                $expenses = DatabaseConfig::getMockData('expenses');
                echo json_encode($expenses);
                exit();
            }
            
            // Get all expenses
            $query = "SELECT * FROM expenses ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to camelCase for frontend, mapping schema fields
            $formattedExpenses = array_map(function($expense) {
                return [
                    'id' => (int)$expense['id'],
                    'name' => $expense['description'], // mapping description -> name for frontend
                    'amount' => (float)$expense['amount'],
                    'category' => $expense['category'],
                    'expenseDate' => $expense['expense_date'],
                    'notes' => $expense['notes'] ?? '',
                    'createdAt' => $expense['created_at']
                ];
            }, $expenses);
            
            echo json_encode($formattedExpenses);
            break;
            
        case 'POST':
            // Add new expense
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'No input data received']);
                exit();
            }
            
            // Validate required fields
            $required = ['name', 'amount', 'category'];
            foreach ($required as $field) {
                if (!isset($input[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
                if (is_string($input[$field]) && trim($input[$field]) === '') {
                    http_response_code(400);
                    echo json_encode(['error' => "Field $field cannot be empty"]);
                    exit();
                }
            }
            
            // Validate numeric fields
            if (!is_numeric($input['amount']) || $input['amount'] <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Amount must be a positive number']);
                exit();
            }
            
            // Insert with proper error handling
            try {
                // First check if expenses table exists and create if not
                $checkTable = "SHOW TABLES LIKE 'expenses'";
                $stmt = $db->prepare($checkTable);
                $stmt->execute();
                
                if ($stmt->rowCount() == 0) {
                    // Create expenses table if it doesn't exist matching the schema
                    $createTable = "CREATE TABLE expenses (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        description VARCHAR(255) NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        amount DECIMAL(10,2) NOT NULL,
                        expense_date DATE NOT NULL,
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )";
                    $db->exec($createTable);
                }
                
                // Use 'description' field as in schema, but map from 'name' input
                $query = "INSERT INTO expenses (description, amount, category, expense_date, notes) 
                         VALUES (?, ?, ?, ?, ?)";
                
                $stmt = $db->prepare($query);
                $result = $stmt->execute([
                    $input['name'], // mapping name -> description
                    (float)$input['amount'],
                    $input['category'],
                    $input['expenseDate'] ?? date('Y-m-d'),
                    $input['notes'] ?? ''
                ]);
                
                if ($result) {
                    $newId = $db->lastInsertId();
                    echo json_encode([
                        'success' => true,
                        'id' => (int)$newId,
                        'message' => 'Expense added successfully'
                    ]);
                } else {
                    throw new Exception('Insert operation failed');
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
                exit();
            }
            break;
            
        case 'PUT':
            // Update expense
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing expense ID']);
                exit();
            }
            
            $query = "UPDATE expenses SET 
                     name = :name, amount = :amount, category = :category, expense_date = :expense_date
                     WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':id' => $input['id'],
                ':name' => $input['name'],
                ':amount' => $input['amount'],
                ':category' => $input['category'],
                ':expense_date' => $input['expenseDate']
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Expense updated successfully']);
            } else {
                throw new Exception('Failed to update expense');
            }
            break;
            
        case 'DELETE':
            // Delete expense
            $rawInput = file_get_contents('php://input');
            
            if (empty($rawInput)) {
                http_response_code(400);
                echo json_encode(['error' => 'No input data received']);
                exit();
            }
            
            $input = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON data']);
                exit();
            }
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing expense ID']);
                exit();
            }
            
            $expenseId = $input['id'];
            
            // Check if record exists
            $checkStmt = $db->prepare("SELECT id FROM expenses WHERE id = ?");
            $checkStmt->execute([$expenseId]);
            
            if ($checkStmt->rowCount() == 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Expense not found']);
                exit();
            }
            
            // Perform delete
            $stmt = $db->prepare("DELETE FROM expenses WHERE id = ?");
            $result = $stmt->execute([$expenseId]);
            
            if ($result && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Expense deleted successfully']);
            } else {
                throw new Exception('Failed to delete expense - no rows affected');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(Exception $e) {
    error_log("Expenses API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
?>