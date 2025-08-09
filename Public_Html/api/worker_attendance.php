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
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';

try {
    switch($method) {
        case 'GET':
            if (strpos($path_info, '/date') !== false) {
                // Get attendance by date
                $date = $_GET['date'] ?? date('Y-m-d');
                
                $query = "SELECT wa.*, w.name as worker_name FROM worker_attendance wa 
                         JOIN workers w ON wa.worker_id = w.id 
                         WHERE wa.attendance_date = ? ORDER BY w.name";
                $stmt = $db->prepare($query);
                $stmt->execute([$date]);
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $result = array_map(function($record) {
                    return [
                        'id' => (int)$record['id'],
                        'workerId' => (int)$record['worker_id'],
                        'workerName' => $record['worker_name'],
                        'attendanceDate' => $record['attendance_date'],
                        'status' => $record['status'],
                        'checkInTime' => $record['check_in_time'],
                        'checkOutTime' => $record['check_out_time'],
                        'hoursWorked' => (float)$record['hours_worked'],
                        'overtimeHours' => (float)$record['overtime_hours'],
                        'notes' => $record['notes'],
                        'createdAt' => $record['created_at']
                    ];
                }, $attendance);
                
                echo json_encode($result);
            } elseif (strpos($path_info, '/summary') !== false) {
                // Get monthly summary for a worker
                $workerId = $_GET['workerId'] ?? null;
                $month = $_GET['month'] ?? date('Y-m');
                
                if (!$workerId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Worker ID is required']);
                    return;
                }
                
                $query = "SELECT 
                    COUNT(CASE WHEN status = 'present' THEN 1 END) as total_days_worked,
                    COUNT(CASE WHEN status = 'absent' THEN 1 END) as total_absent,
                    COUNT(CASE WHEN status = 'late' THEN 1 END) as total_late,
                    SUM(hours_worked) as total_hours,
                    SUM(overtime_hours) as total_overtime
                    FROM worker_attendance 
                    WHERE worker_id = ? AND DATE_FORMAT(attendance_date, '%Y-%m') = ?";
                
                $stmt = $db->prepare($query);
                $stmt->execute([$workerId, $month]);
                $summary = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $result = [
                    'totalDaysWorked' => (int)$summary['total_days_worked'],
                    'totalAbsent' => (int)$summary['total_absent'],
                    'totalLate' => (int)$summary['total_late'],
                    'totalHours' => (float)$summary['total_hours'],
                    'totalOvertime' => (float)$summary['total_overtime']
                ];
                
                echo json_encode($result);
            } else {
                // Get all attendance records
                $query = "SELECT wa.*, w.name as worker_name FROM worker_attendance wa 
                         JOIN workers w ON wa.worker_id = w.id 
                         ORDER BY wa.attendance_date DESC, w.name";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $result = array_map(function($record) {
                    return [
                        'id' => (int)$record['id'],
                        'workerId' => (int)$record['worker_id'],
                        'workerName' => $record['worker_name'],
                        'attendanceDate' => $record['attendance_date'],
                        'status' => $record['status'],
                        'checkInTime' => $record['check_in_time'],
                        'checkOutTime' => $record['check_out_time'],
                        'hoursWorked' => (float)$record['hours_worked'],
                        'overtimeHours' => (float)$record['overtime_hours'],
                        'notes' => $record['notes'],
                        'createdAt' => $record['created_at']
                    ];
                }, $attendance);
                
                echo json_encode($result);
            }
            break;
            
        case 'POST':
            // Create attendance record
            $data = json_decode(file_get_contents('php://input'), true);
            
            $query = "INSERT INTO worker_attendance 
                     (worker_id, attendance_date, status, check_in_time, check_out_time, hours_worked, overtime_hours, notes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            
            $result = $stmt->execute([
                $data['workerId'],
                $data['attendanceDate'],
                $data['status'],
                $data['checkInTime'] ?? null,
                $data['checkOutTime'] ?? null,
                $data['hoursWorked'] ?? 8.0,
                $data['overtimeHours'] ?? 0.0,
                $data['notes'] ?? ''
            ]);
            
            if ($result) {
                $id = $db->lastInsertId();
                $response = array_merge($data, ['id' => (int)$id, 'createdAt' => date('Y-m-d H:i:s')]);
                http_response_code(201);
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create attendance record']);
            }
            break;
            
        case 'PUT':
            // Update attendance record
            $id = ltrim($path_info, '/');
            $data = json_decode(file_get_contents('php://input'), true);
            
            $query = "UPDATE worker_attendance SET 
                     worker_id = ?, attendance_date = ?, status = ?, 
                     check_in_time = ?, check_out_time = ?, hours_worked = ?, 
                     overtime_hours = ?, notes = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            
            $result = $stmt->execute([
                $data['workerId'],
                $data['attendanceDate'],
                $data['status'],
                $data['checkInTime'] ?? null,
                $data['checkOutTime'] ?? null,
                $data['hoursWorked'] ?? 8.0,
                $data['overtimeHours'] ?? 0.0,
                $data['notes'] ?? '',
                $id
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Attendance updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update attendance']);
            }
            break;
            
        case 'DELETE':
            // Delete attendance record
            $id = ltrim($path_info, '/');
            
            $query = "DELETE FROM worker_attendance WHERE id = ?";
            $stmt = $db->prepare($query);
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode(['message' => 'Attendance deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete attendance']);
            }
            break;
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>