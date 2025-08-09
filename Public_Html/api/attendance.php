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
            // Get all attendance records with worker names
            $query = "SELECT wa.*, w.name as worker_name 
                     FROM worker_attendance wa 
                     JOIN workers w ON wa.worker_id = w.id 
                     ORDER BY wa.attendance_date DESC, w.name";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to camelCase for frontend
            $formattedAttendance = array_map(function($record) {
                return [
                    'id' => (int)$record['id'],
                    'workerId' => (int)$record['worker_id'],
                    'workerName' => $record['worker_name'],
                    'attendanceDate' => $record['attendance_date'],
                    'status' => $record['status'],
                    'clockInTime' => $record['clock_in_time'],
                    'clockOutTime' => $record['clock_out_time'],
                    'notes' => $record['notes'] ?? '',
                    'createdAt' => $record['created_at']
                ];
            }, $attendance);
            
            echo json_encode($formattedAttendance);
            break;
            
        case 'POST':
            // Add new attendance record
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['workerId']) || !isset($input['attendanceDate']) || !isset($input['status'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit();
            }
            
            $query = "INSERT INTO worker_attendance (worker_id, attendance_date, status, clock_in_time, clock_out_time, notes) 
                     VALUES (:worker_id, :attendance_date, :status, :clock_in_time, :clock_out_time, :notes)
                     ON DUPLICATE KEY UPDATE 
                     status = VALUES(status), 
                     clock_in_time = VALUES(clock_in_time), 
                     clock_out_time = VALUES(clock_out_time), 
                     notes = VALUES(notes)";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':worker_id' => $input['workerId'],
                ':attendance_date' => $input['attendanceDate'],
                ':status' => $input['status'],
                ':clock_in_time' => $input['clockInTime'] ?? null,
                ':clock_out_time' => $input['clockOutTime'] ?? null,
                ':notes' => $input['notes'] ?? ''
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Attendance recorded successfully']);
            } else {
                throw new Exception('Failed to record attendance');
            }
            break;
            
        case 'PUT':
            // Update attendance record
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing attendance ID']);
                exit();
            }
            
            $query = "UPDATE worker_attendance SET 
                     status = :status, clock_in_time = :clock_in_time, 
                     clock_out_time = :clock_out_time, notes = :notes
                     WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':id' => $input['id'],
                ':status' => $input['status'],
                ':clock_in_time' => $input['clockInTime'] ?? null,
                ':clock_out_time' => $input['clockOutTime'] ?? null,
                ':notes' => $input['notes'] ?? ''
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Attendance updated successfully']);
            } else {
                throw new Exception('Failed to update attendance');
            }
            break;
            
        case 'DELETE':
            // Delete attendance record
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing attendance ID']);
                exit();
            }
            
            $query = "DELETE FROM worker_attendance WHERE id = :id";
            $stmt = $db->prepare($query);
            $result = $stmt->execute([':id' => $input['id']]);
            
            if ($result) {
                echo json_encode(['message' => 'Attendance record deleted successfully']);
            } else {
                throw new Exception('Failed to delete attendance record');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(Exception $e) {
    error_log("Attendance API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
?>