<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet();
            break;
        case 'POST':
            handlePost();
            break;
        case 'PUT':
            handlePut();
            break;
        case 'DELETE':
            handleDelete();
            break;
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Expenses API error: " . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function handleGet() {
    $db = Database::getInstance();
    
    if (isset($_GET['id'])) {
        // Get single expense
        $id = (int)$_GET['id'];
        $expense = $db->fetch("SELECT * FROM expenses WHERE id = ?", [$id]);
        
        if (!$expense) {
            jsonResponse(['error' => 'Expense not found'], 404);
        }
        
        jsonResponse($expense);
    } else {
        // Get all expenses with optional filtering
        $query = "SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC";
        $params = [];
        
        // Add filters if provided
        $conditions = [];
        
        if (isset($_GET['category']) && !empty($_GET['category'])) {
            $conditions[] = "category = ?";
            $params[] = $_GET['category'];
        }
        
        if (isset($_GET['date_from']) && !empty($_GET['date_from'])) {
            $conditions[] = "expense_date >= ?";
            $params[] = $_GET['date_from'];
        }
        
        if (isset($_GET['date_to']) && !empty($_GET['date_to'])) {
            $conditions[] = "expense_date <= ?";
            $params[] = $_GET['date_to'];
        }
        
        if (!empty($conditions)) {
            $query = "SELECT * FROM expenses WHERE " . implode(' AND ', $conditions) . " ORDER BY expense_date DESC, created_at DESC";
        }
        
        $expenses = $db->fetchAll($query, $params);
        jsonResponse($expenses);
    }
}

function handlePost() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(['error' => 'Invalid JSON data'], 400);
    }
    
    // Validate required fields
    $required = ['name', 'amount', 'category', 'expenseDate'];
    $missing = validateRequired($input, $required);
    
    if (!empty($missing)) {
        jsonResponse(['error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
    }
    
    // Sanitize input
    $data = sanitizeInput($input);
    
    // Validate numeric fields
    if (!is_numeric($data['amount']) || $data['amount'] < 0) {
        jsonResponse(['error' => 'Invalid amount'], 400);
    }
    
    // Validate category
    $validCategories = ['Utilities', 'Salaries', 'Maintenance', 'RawMaterials', 'Transportation', 'Administrative', 'Other'];
    if (!in_array($data['category'], $validCategories)) {
        jsonResponse(['error' => 'Invalid category'], 400);
    }
    
    $db = Database::getInstance();
    
    // Insert expense
    $query = "
        INSERT INTO expenses (
            name, amount, category, expense_date, description,
            receipt_number, vendor, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ";
    
    $params = [
        $data['name'],
        $data['amount'],
        $data['category'],
        $data['expenseDate'],
        $data['description'] ?? null,
        $data['receiptNumber'] ?? null,
        $data['vendor'] ?? null
    ];
    
    $db->query($query, $params);
    $expenseId = $db->lastInsertId();
    
    // Get the created expense
    $expense = $db->fetch("SELECT * FROM expenses WHERE id = ?", [$expenseId]);
    
    jsonResponse($expense, 201);
}

function handlePut() {
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Expense ID is required'], 400);
    }
    
    $id = (int)$_GET['id'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(['error' => 'Invalid JSON data'], 400);
    }
    
    $db = Database::getInstance();
    
    // Check if expense exists
    $existingExpense = $db->fetch("SELECT * FROM expenses WHERE id = ?", [$id]);
    if (!$existingExpense) {
        jsonResponse(['error' => 'Expense not found'], 404);
    }
    
    // Sanitize input
    $data = sanitizeInput($input);
    
    // Build update query dynamically
    $updateFields = [];
    $params = [];
    
    if (isset($data['name'])) {
        $updateFields[] = 'name = ?';
        $params[] = $data['name'];
    }
    
    if (isset($data['amount'])) {
        if (!is_numeric($data['amount']) || $data['amount'] < 0) {
            jsonResponse(['error' => 'Invalid amount'], 400);
        }
        $updateFields[] = 'amount = ?';
        $params[] = $data['amount'];
    }
    
    if (isset($data['category'])) {
        $validCategories = ['Utilities', 'Salaries', 'Maintenance', 'RawMaterials', 'Transportation', 'Administrative', 'Other'];
        if (!in_array($data['category'], $validCategories)) {
            jsonResponse(['error' => 'Invalid category'], 400);
        }
        $updateFields[] = 'category = ?';
        $params[] = $data['category'];
    }
    
    if (isset($data['expenseDate'])) {
        $updateFields[] = 'expense_date = ?';
        $params[] = $data['expenseDate'];
    }
    
    if (isset($data['description'])) {
        $updateFields[] = 'description = ?';
        $params[] = $data['description'];
    }
    
    if (isset($data['receiptNumber'])) {
        $updateFields[] = 'receipt_number = ?';
        $params[] = $data['receiptNumber'];
    }
    
    if (isset($data['vendor'])) {
        $updateFields[] = 'vendor = ?';
        $params[] = $data['vendor'];
    }
    
    if (empty($updateFields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $params[] = $id;
    $query = "UPDATE expenses SET " . implode(', ', $updateFields) . " WHERE id = ?";
    
    $db->query($query, $params);
    
    // Return updated expense
    $expense = $db->fetch("SELECT * FROM expenses WHERE id = ?", [$id]);
    jsonResponse($expense);
}

function handleDelete() {
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Expense ID is required'], 400);
    }
    
    $id = (int)$_GET['id'];
    $db = Database::getInstance();
    
    // Check if expense exists
    $expense = $db->fetch("SELECT * FROM expenses WHERE id = ?", [$id]);
    if (!$expense) {
        jsonResponse(['error' => 'Expense not found'], 404);
    }
    
    // Delete expense
    $db->query("DELETE FROM expenses WHERE id = ?", [$id]);
    
    jsonResponse(['message' => 'Expense deleted successfully']);
}
?>