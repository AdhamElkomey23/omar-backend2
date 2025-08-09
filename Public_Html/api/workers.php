<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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
                $workers = DatabaseConfig::getMockData('workers');
                echo json_encode($workers);
                exit();
            }
            
            // Get all workers
            $query = "SELECT * FROM workers ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $workers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to camelCase for frontend
            $formattedWorkers = array_map(function($worker) {
                return [
                    'id' => (int)$worker['id'],
                    'name' => $worker['name'],
                    'role' => $worker['role'],
                    'department' => $worker['department'],
                    'salary' => (int)$worker['salary'],
                    'hireDate' => $worker['hire_date'],
                    'email' => $worker['email'] ?? '',
                    'phone' => $worker['phone'] ?? '',
                    'status' => $worker['status'],
                    'createdAt' => $worker['created_at']
                ];
            }, $workers);
            
            echo json_encode($formattedWorkers);
            break;
            
        case 'POST':
            if ($db === null) {
                http_response_code(503);
                echo json_encode(['error' => 'Database not available. This is demo mode.']);
                exit();
            }
            
            // Add new worker
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['name']) || !isset($input['role']) || !isset($input['department']) || !isset($input['salary'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit();
            }
            
            $query = "INSERT INTO workers (name, role, department, salary, hire_date, email, phone, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                $input['name'],
                $input['role'],
                $input['department'],
                $input['salary'],
                $input['hire_date'] ?? date('Y-m-d'),
                $input['email'] ?? '',
                $input['phone'] ?? '',
                $input['status'] ?? 'active'
            ]);
            
            if ($result) {
                $newId = $db->lastInsertId();
                echo json_encode(['id' => $newId, 'message' => 'Worker added successfully']);
            } else {
                throw new Exception('Failed to add worker');
            }
            break;
            
        case 'PUT':
            // Update worker
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing worker ID']);
                exit();
            }
            
            $query = "UPDATE workers SET 
                     name = :name, role = :role, department = :department, 
                     salary = :salary, email = :email, phone = :phone, status = :status
                     WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':id' => $input['id'],
                ':name' => $input['name'],
                ':role' => $input['role'],
                ':department' => $input['department'],
                ':salary' => $input['salary'],
                ':email' => $input['email'] ?? '',
                ':phone' => $input['phone'] ?? '',
                ':status' => $input['status'] ?? 'active'
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Worker updated successfully']);
            } else {
                throw new Exception('Failed to update worker');
            }
            break;
            
        case 'DELETE':
            if ($db === null) {
                http_response_code(503);
                echo json_encode(['error' => 'Database not available. This is demo mode.']);
                exit();
            }
            
            // Get ID from URL parameter for DELETE requests
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing worker ID']);
                exit();
            }
            
            // Validate worker ID is numeric
            if (!is_numeric($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Worker ID must be numeric']);
                exit();
            }
            
            // Check if worker exists before deleting
            $checkQuery = "SELECT name FROM workers WHERE id = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([':id' => (int)$input['id']]);
            $worker = $checkStmt->fetch();
            
            if (!$worker) {
                http_response_code(404);
                echo json_encode(['error' => 'Worker not found']);
                exit();
            }
            
            // Delete the worker
            $query = "DELETE FROM workers WHERE id = :id";
            $stmt = $db->prepare($query);
            $result = $stmt->execute([':id' => (int)$input['id']]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Worker deleted successfully',
                    'deletedWorker' => $worker['name']
                ]);
            } else {
                throw new Exception('Failed to delete worker');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(Exception $e) {
    error_log("Workers API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
?>