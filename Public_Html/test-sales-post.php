<?php
// Isolated test for sales POST functionality
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    echo "Testing Sales POST...\n";
    
    // Direct database connection
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
    
    // Test data
    $testData = [
        'productName' => 'Debug Test Product',
        'quantity' => 3,
        'totalAmount' => 150.00,
        'clientName' => 'Debug Test Client',
        'clientContact' => '987654321',
        'saleDate' => date('Y-m-d')
    ];
    
    echo "Test data: " . json_encode($testData) . "\n";
    
    // Simulate the exact same logic as sales.php POST
    $query = "INSERT INTO sales (product_name, quantity, total_amount, sale_date, client_name, client_contact) 
             VALUES (:product_name, :quantity, :total_amount, :sale_date, :client_name, :client_contact)";
    
    echo "SQL Query: $query\n";
    
    $stmt = $db->prepare($query);
    $result = $stmt->execute([
        ':product_name' => $testData['productName'],
        ':quantity' => $testData['quantity'],
        ':total_amount' => $testData['totalAmount'],
        ':sale_date' => $testData['saleDate'],
        ':client_name' => $testData['clientName'],
        ':client_contact' => $testData['clientContact']
    ]);
    
    if ($result) {
        $newId = $db->lastInsertId();
        echo "SUCCESS: Sale added with ID $newId\n";
        
        // Verify the record
        $stmt = $db->prepare("SELECT * FROM sales WHERE id = ?");
        $stmt->execute([$newId]);
        $record = $stmt->fetch();
        
        if ($record) {
            echo "Verified record: " . json_encode($record) . "\n";
        }
        
        // Clean up
        $stmt = $db->prepare("DELETE FROM sales WHERE id = ?");
        $stmt->execute([$newId]);
        echo "Test record cleaned up\n";
        
    } else {
        echo "FAILED: Could not insert record\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>