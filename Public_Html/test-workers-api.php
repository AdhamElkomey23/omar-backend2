<?php
// Test the workers API specifically
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Simulate POST request to add worker
$_SERVER['REQUEST_METHOD'] = 'POST';

// Simulate input data
$testInput = [
    'name' => 'Test Worker',
    'role' => 'Test Role', 
    'department' => 'Test Department',
    'salary' => 5000,
    'email' => 'test@test.com',
    'phone' => '123456789'
];

// Override php://input for testing
$GLOBALS['test_input'] = json_encode($testInput);

function file_get_contents_override($filename) {
    if ($filename === 'php://input') {
        return $GLOBALS['test_input'];
    }
    return file_get_contents($filename);
}

echo "Testing Workers API...\n";

try {
    require_once 'config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    echo "Database connected successfully\n";
    
    // Test the actual logic from workers.php
    $input = json_decode($GLOBALS['test_input'], true);
    
    if (!$input || !isset($input['name']) || !isset($input['role']) || !isset($input['department']) || !isset($input['salary'])) {
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    
    $query = "INSERT INTO workers (name, role, department, salary, hire_date, email, phone, status) 
             VALUES (:name, :role, :department, :salary, :hire_date, :email, :phone, :status)";
    
    $stmt = $db->prepare($query);
    $result = $stmt->execute([
        ':name' => $input['name'],
        ':role' => $input['role'],
        ':department' => $input['department'],
        ':salary' => $input['salary'],
        ':hire_date' => date('Y-m-d'),
        ':email' => $input['email'] ?? '',
        ':phone' => $input['phone'] ?? '',
        ':status' => 'active'
    ]);
    
    if ($result) {
        $newId = $db->lastInsertId();
        echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Worker added successfully']);
        
        // Clean up
        $deleteStmt = $db->prepare("DELETE FROM workers WHERE id = :id");
        $deleteStmt->execute([':id' => $newId]);
    } else {
        echo json_encode(['error' => 'Failed to add worker']);
    }
    
} catch(Exception $e) {
    echo json_encode(['error' => 'Exception: ' . $e->getMessage(), 'line' => $e->getLine(), 'file' => $e->getFile()]);
}
?>