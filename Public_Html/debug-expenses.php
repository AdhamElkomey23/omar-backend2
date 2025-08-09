<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "Testing Expenses API...\n";

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
    
    // Check if expenses table exists
    $stmt = $db->query("SHOW TABLES LIKE 'expenses'");
    if ($stmt->rowCount() > 0) {
        echo "Expenses table: EXISTS\n";
        
        // Test INSERT
        $stmt = $db->prepare("INSERT INTO expenses (name, amount, category, expense_date) VALUES (?, ?, ?, ?)");
        $result = $stmt->execute(['Debug Test', 100.00, 'Office', date('Y-m-d')]);
        
        if ($result) {
            $id = $db->lastInsertId();
            echo "INSERT test: SUCCESS (ID: $id)\n";
            
            // Clean up
            $stmt = $db->prepare("DELETE FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            echo "Cleanup: SUCCESS\n";
        } else {
            echo "INSERT test: FAILED\n";
        }
        
    } else {
        echo "Expenses table: MISSING\n";
    }
    
} catch(Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>