<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "=== Testing DELETE Functionality ===\n\n";

try {
    // Database connection
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
    
    echo "Database connection: OK\n\n";
    
    // Test DELETE for each table
    $tables = ['sales', 'expenses', 'storage_items'];
    
    foreach ($tables as $table) {
        echo "Testing DELETE for $table table:\n";
        
        // Check if table exists
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() == 0) {
            echo "  ❌ Table '$table' does not exist\n\n";
            continue;
        }
        
        echo "  ✅ Table exists\n";
        
        // Check current record count
        $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
        $count = $stmt->fetch()['count'];
        echo "  Current records: $count\n";
        
        if ($count > 0) {
            // Get first record ID
            $stmt = $db->query("SELECT id FROM $table LIMIT 1");
            $record = $stmt->fetch();
            if ($record) {
                $testId = $record['id'];
                echo "  Test ID to delete: $testId\n";
                
                // Test DELETE query
                $deleteQuery = "DELETE FROM $table WHERE id = ?";
                echo "  SQL Query: $deleteQuery\n";
                
                try {
                    $stmt = $db->prepare($deleteQuery);
                    $result = $stmt->execute([$testId]);
                    
                    if ($result) {
                        $rowsAffected = $stmt->rowCount();
                        echo "  ✅ DELETE executed successfully\n";
                        echo "  Rows affected: $rowsAffected\n";
                        
                        // Check if record was actually deleted
                        $stmt = $db->prepare("SELECT COUNT(*) as count FROM $table WHERE id = ?");
                        $stmt->execute([$testId]);
                        $remainingCount = $stmt->fetch()['count'];
                        
                        if ($remainingCount == 0) {
                            echo "  ✅ Record successfully deleted\n";
                        } else {
                            echo "  ❌ Record still exists after delete\n";
                        }
                    } else {
                        echo "  ❌ DELETE failed\n";
                    }
                } catch (Exception $e) {
                    echo "  ❌ DELETE error: " . $e->getMessage() . "\n";
                }
            } else {
                echo "  ❌ No records found to test\n";
            }
        } else {
            echo "  ⚠️ No records to test delete\n";
            
            // Create a test record to delete
            echo "  Creating test record...\n";
            try {
                if ($table == 'sales') {
                    $stmt = $db->prepare("INSERT INTO sales (product_name, quantity, total_amount, sale_date, client_name) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute(['Test Product', 1, 100.00, date('Y-m-d'), 'Test Client']);
                } elseif ($table == 'expenses') {
                    $stmt = $db->prepare("INSERT INTO expenses (name, amount, category, expense_date) VALUES (?, ?, ?, ?)");
                    $stmt->execute(['Test Expense', 50.00, 'Test', date('Y-m-d')]);
                } elseif ($table == 'storage_items') {
                    $stmt = $db->prepare("INSERT INTO storage_items (item_name, quantity_in_tons, purchase_price_per_ton, dealer_name, purchase_date) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute(['Test Item', 1.0, 100.00, 'Test Dealer', date('Y-m-d')]);
                }
                
                $testId = $db->lastInsertId();
                echo "  Test record created with ID: $testId\n";
                
                // Now test delete
                $stmt = $db->prepare("DELETE FROM $table WHERE id = ?");
                $result = $stmt->execute([$testId]);
                
                if ($result && $stmt->rowCount() > 0) {
                    echo "  ✅ DELETE test successful\n";
                } else {
                    echo "  ❌ DELETE test failed\n";
                }
                
            } catch (Exception $e) {
                echo "  ❌ Test record creation failed: " . $e->getMessage() . "\n";
            }
        }
        
        echo "\n";
    }
    
    echo "=== Testing API Delete Endpoints ===\n\n";
    
    // Test actual API calls
    $apis = [
        'sales' => 'api/sales.php',
        'expenses' => 'api/expenses.php', 
        'storage' => 'api/storage.php'
    ];
    
    foreach ($apis as $name => $endpoint) {
        echo "Testing $name API DELETE:\n";
        
        // Check if API file exists
        if (file_exists($endpoint)) {
            echo "  ✅ API file exists\n";
            
            // Simulate DELETE request
            $testData = json_encode(['id' => 999]); // Use non-existent ID
            
            // Save original request method
            $originalMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
            $_SERVER['REQUEST_METHOD'] = 'DELETE';
            
            // Capture output
            ob_start();
            
            // Mock php://input
            $GLOBALS['test_delete_input'] = $testData;
            
            // Include the API file
            try {
                include $endpoint;
                $output = ob_get_clean();
                
                echo "  API Response: " . trim($output) . "\n";
                
                $response = json_decode($output, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    if (isset($response['error'])) {
                        echo "  ⚠️ Expected error for non-existent ID: " . $response['error'] . "\n";
                    } else {
                        echo "  ✅ DELETE endpoint working\n";
                    }
                } else {
                    echo "  ❌ Invalid JSON response\n";
                }
                
            } catch (Exception $e) {
                ob_end_clean();
                echo "  ❌ API Error: " . $e->getMessage() . "\n";
            }
            
            // Restore original request method
            $_SERVER['REQUEST_METHOD'] = $originalMethod;
            
        } else {
            echo "  ❌ API file missing\n";
        }
        
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "=== Debug Complete ===\n";
?>