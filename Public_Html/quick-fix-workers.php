<?php
// Emergency fix for workers API with comprehensive error handling
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't show errors in JSON response
ini_set('log_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Database connection with detailed error handling
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
            // Get all workers
            $stmt = $db->query("SELECT * FROM workers ORDER BY created_at DESC");
            $workers = $stmt->fetchAll();
            
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
            // Add new worker
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('No input data received');
            }
            
            $required = ['name', 'role', 'department', 'salary'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }
            
            $stmt = $db->prepare("INSERT INTO workers (name, role, department, salary, hire_date, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            
            $result = $stmt->execute([
                $input['name'],
                $input['role'],
                $input['department'],
                $input['salary'],
                $input['hireDate'] ?? date('Y-m-d'),
                $input['email'] ?? '',
                $input['phone'] ?? '',
                $input['status'] ?? 'active'
            ]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'id' => $db->lastInsertId(),
                    'message' => 'Worker added successfully'
                ]);
            } else {
                throw new Exception('Failed to execute insert statement');
            }
            break;
            
        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                throw new Exception('Missing worker ID for deletion');
            }
            
            $stmt = $db->prepare("DELETE FROM workers WHERE id = ?");
            $result = $stmt->execute([$input['id']]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Worker deleted successfully']);
            } else {
                throw new Exception('Failed to delete worker');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed: ' . $method]);
            break;
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
        'line' => $e->getLine()
    ]);
}
?>