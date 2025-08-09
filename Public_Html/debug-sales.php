<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

echo "Testing Sales API...\n";

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
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "Database connection: OK\n";
    
    // Check if sales table exists
    $stmt = $db->query("SHOW TABLES LIKE 'sales'");
    if ($stmt->rowCount() > 0) {
        echo "Sales table: EXISTS\n";
        
        // Check table structure
        $stmt = $db->query("DESCRIBE sales");
        $columns = $stmt->fetchAll();
        echo "Table columns: ";
        foreach ($columns as $col) {
            echo $col['Field'] . " ";
        }
        echo "\n";
        
        // Test simple SELECT
        $stmt = $db->query("SELECT COUNT(*) as count FROM sales");
        $count = $stmt->fetch()['count'];
        echo "Current records: $count\n";
        
        // Test INSERT
        $testData = [
            'product_name' => 'Debug Test Product',
            'quantity' => 5,
            'total_amount' => 250.00,
            'sale_date' => date('Y-m-d'),
            'client_name' => 'Debug Test Client',
            'client_contact' => ''
        ];
        
        $stmt = $db->prepare("INSERT INTO sales (product_name, quantity, total_amount, sale_date, client_name, client_contact) VALUES (?, ?, ?, ?, ?, ?)");
        $result = $stmt->execute(array_values($testData));
        
        if ($result) {
            $id = $db->lastInsertId();
            echo "INSERT test: SUCCESS (ID: $id)\n";
            
            // Clean up
            $stmt = $db->prepare("DELETE FROM sales WHERE id = ?");
            $stmt->execute([$id]);
            echo "Cleanup: SUCCESS\n";
        } else {
            echo "INSERT test: FAILED\n";
        }
        
    } else {
        echo "Sales table: MISSING\n";
    }
    
} catch(Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}
?>