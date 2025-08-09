<?php
// Test database connection and basic functionality
header('Content-Type: text/plain');

echo "=== Database Connection Test ===\n";

try {
    $host = 'localhost';
    $db_name = 'u179479756_newomar';
    $username = 'u179479756_newomarapp';
    $password = '#sS9ei3lK+';
    
    echo "Attempting connection...\n";
    
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
    
    echo "✅ Connection successful!\n\n";
    
    // Test each table
    $tables = ['workers', 'storage_items', 'expenses', 'sales', 'salary_deductions'];
    
    foreach ($tables as $table) {
        try {
            echo "Testing table: $table\n";
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM $table LIMIT 1");
            $stmt->execute();
            $result = $stmt->fetch();
            echo "✅ $table: {$result['count']} records\n";
        } catch (Exception $e) {
            echo "❌ $table: Error - " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n=== Testing API Endpoints Manually ===\n";
    
    // Test expenses endpoint manually
    echo "Testing expenses API...\n";
    try {
        $query = "SELECT * FROM expenses ORDER BY created_at DESC LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if ($expenses) {
            echo "✅ Expenses query works. Sample: " . print_r($expenses[0], true) . "\n";
        } else {
            echo "⚠️ Expenses table is empty\n";
        }
    } catch (Exception $e) {
        echo "❌ Expenses query failed: " . $e->getMessage() . "\n";
    }
    
    // Test sales endpoint manually
    echo "Testing sales API...\n";
    try {
        $query = "SELECT * FROM sales ORDER BY created_at DESC LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if ($sales) {
            echo "✅ Sales query works. Sample: " . print_r($sales[0], true) . "\n";
        } else {
            echo "⚠️ Sales table is empty\n";
        }
    } catch (Exception $e) {
        echo "❌ Sales query failed: " . $e->getMessage() . "\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ General error: " . $e->getMessage() . "\n";
}

echo "\n=== PHP Info ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "PDO Available: " . (extension_loaded('pdo') ? 'Yes' : 'No') . "\n";
echo "PDO MySQL: " . (extension_loaded('pdo_mysql') ? 'Yes' : 'No') . "\n";
echo "Error Reporting: " . error_reporting() . "\n";
?>