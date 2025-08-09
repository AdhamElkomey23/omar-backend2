<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

// Try to get database connection, fall back to mock data if fails
$db = DatabaseConfig::getConnection();

try {
    if ($db === null) {
        // Use mock data when database is not available
        $logs = DatabaseConfig::getMockData('activity-logs');
        echo json_encode($logs);
        exit();
    }
    
    // Get all activity logs
    $query = "SELECT * FROM activity_logs ORDER BY log_date DESC LIMIT 20";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($logs);
    
} catch(Exception $e) {
    error_log("Activity Logs API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
?>