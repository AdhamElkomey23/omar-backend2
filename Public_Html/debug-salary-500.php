
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "=== SALARY DEDUCTIONS 500 ERROR DEBUG ===\n\n";

try {
    // Test database connection
    $host = 'localhost';
    $db_name = 'u179479756_newomar';
    $username = 'u179479756_newomarapp';
    $password = '#sS9ei3lK+';
    
    echo "1. Testing database connection...\n";
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
    echo "✓ Database connection successful\n\n";
    
    // Check table structure
    echo "2. Checking salary_deductions table structure...\n";
    $stmt = $db->query("DESCRIBE salary_deductions");
    $columns = $stmt->fetchAll();
    
    if (empty($columns)) {
        echo "✗ salary_deductions table does not exist!\n";
        echo "Creating table...\n";
        
        $createTable = "
        CREATE TABLE IF NOT EXISTS salary_deductions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            worker_id INT NOT NULL,
            deduction_month VARCHAR(7) DEFAULT NULL,
            deduction_amount DECIMAL(10,2) NOT NULL,
            deduction_type VARCHAR(50) DEFAULT 'other',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
        )";
        
        $db->exec($createTable);
        echo "✓ Table created successfully\n";
    } else {
        echo "✓ Table exists with columns:\n";
        foreach ($columns as $col) {
            echo "  - {$col['Field']} ({$col['Type']})\n";
        }
    }
    
    echo "\n3. Testing simple SELECT query...\n";
    $stmt = $db->query("SELECT COUNT(*) as count FROM salary_deductions");
    $count = $stmt->fetch()['count'];
    echo "✓ Current deductions count: $count\n";
    
    echo "\n4. Testing JOIN query with workers...\n";
    $stmt = $db->query("
        SELECT sd.*, w.name as worker_name 
        FROM salary_deductions sd 
        LEFT JOIN workers w ON sd.worker_id = w.id 
        LIMIT 1
    ");
    $result = $stmt->fetch();
    if ($result) {
        echo "✓ JOIN query successful\n";
    } else {
        echo "✓ JOIN query works (no data)\n";
    }
    
    echo "\n5. Testing workers table...\n";
    $stmt = $db->query("SELECT COUNT(*) as count FROM workers");
    $workerCount = $stmt->fetch()['count'];
    echo "✓ Workers count: $workerCount\n";
    
    if ($workerCount > 0) {
        echo "\n6. Testing sample insert...\n";
        $stmt = $db->query("SELECT id FROM workers LIMIT 1");
        $workerId = $stmt->fetch()['id'];
        
        $insertStmt = $db->prepare("
            INSERT INTO salary_deductions 
            (worker_id, deduction_month, deduction_amount, deduction_type, description) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $testResult = $insertStmt->execute([
            $workerId, 
            date('Y-m'), 
            50.00, 
            'test', 
            'Debug test insert'
        ]);
        
        if ($testResult) {
            $newId = $db->lastInsertId();
            echo "✓ Insert successful (ID: $newId)\n";
            
            // Clean up
            $deleteStmt = $db->prepare("DELETE FROM salary_deductions WHERE id = ?");
            $deleteStmt->execute([$newId]);
            echo "✓ Cleanup successful\n";
        }
    }
    
    echo "\n=== ALL TESTS PASSED ===\n";
    
} catch(Exception $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
