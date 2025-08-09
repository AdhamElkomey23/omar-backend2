<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    echo "=== API Debug Information ===\n\n";
    
    // Test 1: Database Connection
    echo "1. Testing Database Connection...\n";
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        echo "❌ Database connection FAILED\n";
        exit();
    }
    echo "✅ Database connection successful\n";
    
    // Test 2: Check Tables
    echo "\n2. Checking Required Tables...\n";
    $requiredTables = ['workers', 'sales', 'expenses', 'storage_items', 'activity_logs', 'worker_attendance', 'salary_deductions'];
    
    foreach ($requiredTables as $table) {
        try {
            $stmt = $db->prepare("SELECT COUNT(*) FROM $table");
            $stmt->execute();
            $count = $stmt->fetchColumn();
            echo "✅ Table '$table' exists with $count records\n";
        } catch (Exception $e) {
            echo "❌ Table '$table' missing or error: " . $e->getMessage() . "\n";
        }
    }
    
    // Test 3: Test POST to workers
    echo "\n3. Testing Workers API POST...\n";
    try {
        $testData = [
            'name' => 'Test Worker',
            'role' => 'Test Role',
            'department' => 'Test Dept',
            'salary' => 5000
        ];
        
        $query = "INSERT INTO workers (name, role, department, salary, hire_date, email, phone, status) 
                 VALUES (:name, :role, :department, :salary, :hire_date, :email, :phone, :status)";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            ':name' => $testData['name'],
            ':role' => $testData['role'],
            ':department' => $testData['department'],
            ':salary' => $testData['salary'],
            ':hire_date' => date('Y-m-d'),
            ':email' => '',
            ':phone' => '',
            ':status' => 'active'
        ]);
        
        if ($result) {
            $newId = $db->lastInsertId();
            echo "✅ Test worker inserted successfully with ID: $newId\n";
            
            // Clean up test data
            $deleteStmt = $db->prepare("DELETE FROM workers WHERE id = :id");
            $deleteStmt->execute([':id' => $newId]);
            echo "✅ Test worker cleaned up\n";
        } else {
            echo "❌ Failed to insert test worker\n";
        }
    } catch (Exception $e) {
        echo "❌ Error testing workers insert: " . $e->getMessage() . "\n";
    }
    
    // Test 4: Check PHP Error Log
    echo "\n4. PHP Configuration...\n";
    echo "PHP Version: " . phpversion() . "\n";
    echo "Error Reporting: " . error_reporting() . "\n";
    echo "Display Errors: " . ini_get('display_errors') . "\n";
    
    echo "\n=== Debug Complete ===\n";
    
} catch (Exception $e) {
    echo "❌ Critical Error: " . $e->getMessage() . "\n";
    echo "Stack Trace: " . $e->getTraceAsString() . "\n";
}
?>