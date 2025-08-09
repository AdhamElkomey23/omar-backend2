
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database connection
try {
    $host = 'localhost';
    $db_name = 'u179479756_newomar';
    $username = 'u179479756_newomarapp';
    $password = '#sS9ei3lK+';
    
    $db = new PDO(
        "mysql:host=$host;port=3306;dbname=$db_name;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    // Create table if it doesn't exist
    $createTableSQL = "
    CREATE TABLE IF NOT EXISTS salary_deductions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        worker_id INT NOT NULL,
        deduction_month VARCHAR(7) DEFAULT NULL,
        deduction_amount DECIMAL(10,2) NOT NULL,
        deduction_type VARCHAR(50) DEFAULT 'other',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_worker_id (worker_id),
        INDEX idx_deduction_month (deduction_month)
    )";
    $db->exec($createTableSQL);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'details' => $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            // Get all salary deductions with worker names
            $query = "
                SELECT 
                    sd.id,
                    sd.worker_id,
                    sd.deduction_month,
                    sd.deduction_amount,
                    sd.deduction_type,
                    sd.description,
                    sd.created_at,
                    COALESCE(w.name, 'Unknown Worker') as worker_name
                FROM salary_deductions sd 
                LEFT JOIN workers w ON sd.worker_id = w.id 
                ORDER BY sd.created_at DESC
            ";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $deductions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to frontend format
            $formattedDeductions = array_map(function($deduction) {
                return [
                    'id' => (int)$deduction['id'],
                    'workerId' => (int)$deduction['worker_id'],
                    'workerName' => $deduction['worker_name'],
                    'deductionMonth' => $deduction['deduction_month'] ?: date('Y-m'),
                    'deductionAmount' => (float)$deduction['deduction_amount'],
                    'deductionType' => $deduction['deduction_type'] ?: 'other',
                    'description' => $deduction['description'] ?: '',
                    'createdAt' => $deduction['created_at']
                ];
            }, $deductions);
            
            echo json_encode($formattedDeductions);
            break;
            
        case 'POST':
            // Add new salary deduction
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                exit();
            }
            
            // Validate required fields
            if (!isset($input['workerId']) || !isset($input['deductionAmount'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields: workerId, deductionAmount']);
                exit();
            }
            
            // Validate worker exists
            $workerCheck = $db->prepare("SELECT id FROM workers WHERE id = ?");
            $workerCheck->execute([(int)$input['workerId']]);
            if (!$workerCheck->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Worker not found']);
                exit();
            }
            
            $query = "
                INSERT INTO salary_deductions 
                (worker_id, deduction_month, deduction_amount, deduction_type, description) 
                VALUES (?, ?, ?, ?, ?)
            ";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                (int)$input['workerId'],
                $input['deductionMonth'] ?? date('Y-m'),
                (float)$input['deductionAmount'],
                $input['deductionType'] ?? 'other',
                $input['description'] ?? ''
            ]);
            
            if ($result) {
                $newId = $db->lastInsertId();
                echo json_encode([
                    'id' => (int)$newId, 
                    'message' => 'Salary deduction added successfully'
                ]);
            } else {
                throw new Exception('Failed to add salary deduction');
            }
            break;
            
        case 'PUT':
            // Update salary deduction
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing deduction ID']);
                exit();
            }
            
            // Check if deduction exists
            $checkQuery = "SELECT id FROM salary_deductions WHERE id = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([(int)$input['id']]);
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Salary deduction not found']);
                exit();
            }
            
            $query = "
                UPDATE salary_deductions SET 
                    deduction_month = ?, 
                    deduction_amount = ?, 
                    deduction_type = ?, 
                    description = ?
                WHERE id = ?
            ";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                $input['deductionMonth'] ?? date('Y-m'),
                (float)($input['deductionAmount'] ?? 0),
                $input['deductionType'] ?? 'other',
                $input['description'] ?? '',
                (int)$input['id']
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Salary deduction updated successfully']);
            } else {
                throw new Exception('Failed to update salary deduction');
            }
            break;
            
        case 'DELETE':
            // Delete salary deduction
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing deduction ID']);
                exit();
            }
            
            // Check if deduction exists
            $checkQuery = "SELECT id FROM salary_deductions WHERE id = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([(int)$input['id']]);
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Salary deduction not found']);
                exit();
            }
            
            $query = "DELETE FROM salary_deductions WHERE id = ?";
            $stmt = $db->prepare($query);
            $result = $stmt->execute([(int)$input['id']]);
            
            if ($result) {
                echo json_encode(['message' => 'Salary deduction deleted successfully']);
            } else {
                throw new Exception('Failed to delete salary deduction');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(Exception $e) {
    error_log("Salary Deductions API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error occurred',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
