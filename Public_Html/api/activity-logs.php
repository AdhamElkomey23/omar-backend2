<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Direct database connection with error handling
try {
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
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            // Get all activity logs
            $query = "SELECT * FROM activity_logs ORDER BY log_date DESC, created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to camelCase for frontend
            $formattedLogs = array_map(function($log) {
                return [
                    'id' => (int)$log['id'],
                    'title' => $log['title'],
                    'description' => $log['description'],
                    'logDate' => $log['log_date'],
                    'createdAt' => $log['created_at']
                ];
            }, $logs);
            
            echo json_encode($formattedLogs);
            break;
            
        case 'POST':
            // Add new activity log
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['title']) || !isset($input['description'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit();
            }
            
            $query = "INSERT INTO activity_logs (title, description, log_date) 
                     VALUES (:title, :description, :log_date)";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':title' => $input['title'],
                ':description' => $input['description'],
                ':log_date' => $input['logDate'] ?? date('Y-m-d')
            ]);
            
            if ($result) {
                $newId = $db->lastInsertId();
                echo json_encode(['id' => $newId, 'message' => 'Activity log added successfully']);
            } else {
                throw new Exception('Failed to add activity log');
            }
            break;
            
        case 'PUT':
            // Update activity log
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing log ID']);
                exit();
            }
            
            $query = "UPDATE activity_logs SET 
                     title = :title, description = :description, log_date = :log_date
                     WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':id' => $input['id'],
                ':title' => $input['title'],
                ':description' => $input['description'],
                ':log_date' => $input['logDate']
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Activity log updated successfully']);
            } else {
                throw new Exception('Failed to update activity log');
            }
            break;
            
        case 'DELETE':
            // Delete activity log
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing log ID']);
                exit();
            }
            
            $query = "DELETE FROM activity_logs WHERE id = :id";
            $stmt = $db->prepare($query);
            $result = $stmt->execute([':id' => $input['id']]);
            
            if ($result) {
                echo json_encode(['message' => 'Activity log deleted successfully']);
            } else {
                throw new Exception('Failed to delete activity log');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(Exception $e) {
    error_log("Activity Logs API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
?>