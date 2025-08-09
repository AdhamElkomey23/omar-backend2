<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "Testing Salary Deductions API...\n";

try {
    // Test database connection
    $host = 'localhost';
    $db_name = 'u179479756_newomar';
    $username = 'u179479756_newomarapp';
    $password = '#sS9ei3lK+';
    
    $db = new PDO(
        "mysql:host=$host;dbname=$db_name;charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "Database connection: OK\n";
    
    // Check if salary_deductions table exists
    $stmt = $db->query("SHOW TABLES LIKE 'salary_deductions'");
    if ($stmt->rowCount() > 0) {
        echo "Salary_deductions table: EXISTS\n";
        
        // Check if we have workers to reference
        $stmt = $db->query("SELECT COUNT(*) as count FROM workers");
        $workerCount = $stmt->fetch()['count'];
        echo "Workers available: $workerCount\n";
        
        if ($workerCount > 0) {
            // Get first worker ID
            $stmt = $db->query("SELECT id FROM workers LIMIT 1");
            $workerId = $stmt->fetch()['id'];
            
            // Test INSERT
            $stmt = $db->prepare("INSERT INTO salary_deductions (worker_id, deduction_month, deduction_amount, deduction_type, description) VALUES (?, ?, ?, ?, ?)");
            $result = $stmt->execute([$workerId, date('Y-m'), 50.00, 'Test', 'Debug test']);
            
            if ($result) {
                $id = $db->lastInsertId();
                echo "INSERT test: SUCCESS (ID: $id)\n";
                
                // Clean up
                $stmt = $db->prepare("DELETE FROM salary_deductions WHERE id = ?");
                $stmt->execute([$id]);
                echo "Cleanup: SUCCESS\n";
            } else {
                echo "INSERT test: FAILED\n";
            }
        } else {
            echo "No workers found - cannot test salary deductions\n";
        }
        
    } else {
        echo "Salary_deductions table: MISSING\n";
    }
    
} catch(Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>