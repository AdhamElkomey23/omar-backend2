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
    error_log("Workers API error: " . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function handleGet() {
    $db = Database::getInstance();
    
    if (isset($_GET['id'])) {
        // Get single worker
        $id = (int)$_GET['id'];
        $worker = $db->fetch("SELECT * FROM workers WHERE id = ?", [$id]);
        
        if (!$worker) {
            jsonResponse(['error' => 'Worker not found'], 404);
        }
        
        // Convert is_active to boolean
        $worker['is_active'] = (bool)$worker['is_active'];
        
        jsonResponse($worker);
    } else {
        // Get all workers
        $query = "SELECT * FROM workers ORDER BY name ASC";
        $params = [];
        
        // Add filters if provided
        if (isset($_GET['department']) && !empty($_GET['department'])) {
            $query = "SELECT * FROM workers WHERE department = ? ORDER BY name ASC";
            $params[] = $_GET['department'];
        }
        
        $workers = $db->fetchAll($query, $params);
        
        // Convert is_active to boolean for all workers
        foreach ($workers as &$worker) {
            $worker['is_active'] = (bool)$worker['is_active'];
        }
        
        jsonResponse($workers);
    }
}

function handlePost() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(['error' => 'Invalid JSON data'], 400);
    }
    
    // Validate required fields
    $required = ['name', 'position', 'department', 'salary', 'hireDate'];
    $missing = validateRequired($input, $required);
    
    if (!empty($missing)) {
        jsonResponse(['error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
    }
    
    // Sanitize input
    $data = sanitizeInput($input);
    
    // Validate numeric fields
    if (!is_numeric($data['salary']) || $data['salary'] < 0) {
        jsonResponse(['error' => 'Invalid salary amount'], 400);
    }
    
    // Validate department
    $validDepartments = ['Production', 'QualityControl', 'Storage', 'Maintenance', 'Administrative', 'Sales'];
    if (!in_array($data['department'], $validDepartments)) {
        jsonResponse(['error' => 'Invalid department'], 400);
    }
    
    $db = Database::getInstance();
    
    // Insert worker
    $query = "
        INSERT INTO workers (
            name, position, department, salary, phone, email,
            address, hire_date, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ";
    
    $params = [
        $data['name'],
        $data['position'],
        $data['department'],
        $data['salary'],
        $data['phone'] ?? null,
        $data['email'] ?? null,
        $data['address'] ?? null,
        $data['hireDate'],
        isset($data['isActive']) ? (bool)$data['isActive'] : true
    ];
    
    $db->query($query, $params);
    $workerId = $db->lastInsertId();
    
    // Get the created worker
    $worker = $db->fetch("SELECT * FROM workers WHERE id = ?", [$workerId]);
    $worker['is_active'] = (bool)$worker['is_active'];
    
    jsonResponse($worker, 201);
}

function handlePut() {
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Worker ID is required'], 400);
    }
    
    $id = (int)$_GET['id'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(['error' => 'Invalid JSON data'], 400);
    }
    
    $db = Database::getInstance();
    
    // Check if worker exists
    $existingWorker = $db->fetch("SELECT * FROM workers WHERE id = ?", [$id]);
    if (!$existingWorker) {
        jsonResponse(['error' => 'Worker not found'], 404);
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
    
    if (isset($data['position'])) {
        $updateFields[] = 'position = ?';
        $params[] = $data['position'];
    }
    
    if (isset($data['department'])) {
        $validDepartments = ['Production', 'QualityControl', 'Storage', 'Maintenance', 'Administrative', 'Sales'];
        if (!in_array($data['department'], $validDepartments)) {
            jsonResponse(['error' => 'Invalid department'], 400);
        }
        $updateFields[] = 'department = ?';
        $params[] = $data['department'];
    }
    
    if (isset($data['salary'])) {
        if (!is_numeric($data['salary']) || $data['salary'] < 0) {
            jsonResponse(['error' => 'Invalid salary amount'], 400);
        }
        $updateFields[] = 'salary = ?';
        $params[] = $data['salary'];
    }
    
    if (isset($data['phone'])) {
        $updateFields[] = 'phone = ?';
        $params[] = $data['phone'];
    }
    
    if (isset($data['email'])) {
        $updateFields[] = 'email = ?';
        $params[] = $data['email'];
    }
    
    if (isset($data['address'])) {
        $updateFields[] = 'address = ?';
        $params[] = $data['address'];
    }
    
    if (isset($data['hireDate'])) {
        $updateFields[] = 'hire_date = ?';
        $params[] = $data['hireDate'];
    }
    
    if (isset($data['isActive'])) {
        $updateFields[] = 'is_active = ?';
        $params[] = (bool)$data['isActive'];
    }
    
    if (empty($updateFields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $params[] = $id;
    $query = "UPDATE workers SET " . implode(', ', $updateFields) . " WHERE id = ?";
    
    $db->query($query, $params);
    
    // Return updated worker
    $worker = $db->fetch("SELECT * FROM workers WHERE id = ?", [$id]);
    $worker['is_active'] = (bool)$worker['is_active'];
    
    jsonResponse($worker);
}

function handleDelete() {
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Worker ID is required'], 400);
    }
    
    $id = (int)$_GET['id'];
    $db = Database::getInstance();
    
    // Check if worker exists
    $worker = $db->fetch("SELECT * FROM workers WHERE id = ?", [$id]);
    if (!$worker) {
        jsonResponse(['error' => 'Worker not found'], 404);
    }
    
    // Delete worker (this will cascade delete attendance records due to foreign key)
    $db->query("DELETE FROM workers WHERE id = ?", [$id]);
    
    jsonResponse(['message' => 'Worker deleted successfully']);
}
?>