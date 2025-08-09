<?php
// Isolated test for expenses POST functionality
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    echo "Testing Expenses POST...\n";
    
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
        'name' => 'Debug Test Expense',
        'amount' => 75.50,
        'category' => 'Office Supplies',
        'expenseDate' => date('Y-m-d')
    ];
    
    echo "Test data: " . json_encode($testData) . "\n";
    
    // Simulate the exact same logic as expenses.php POST
    $query = "INSERT INTO expenses (name, amount, category, expense_date) 
             VALUES (:name, :amount, :category, :expense_date)";
    
    echo "SQL Query: $query\n";
    
    $stmt = $db->prepare($query);
    $result = $stmt->execute([
        ':name' => $testData['name'],
        ':amount' => $testData['amount'],
        ':category' => $testData['category'],
        ':expense_date' => $testData['expenseDate']
    ]);
    
    if ($result) {
        $newId = $db->lastInsertId();
        echo "SUCCESS: Expense added with ID $newId\n";
        
        // Verify the record
        $stmt = $db->prepare("SELECT * FROM expenses WHERE id = ?");
        $stmt->execute([$newId]);
        $record = $stmt->fetch();
        
        if ($record) {
            echo "Verified record: " . json_encode($record) . "\n";
        }
        
        // Clean up
        $stmt = $db->prepare("DELETE FROM expenses WHERE id = ?");
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