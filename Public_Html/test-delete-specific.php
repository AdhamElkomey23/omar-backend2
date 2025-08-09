<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "=== Testing DELETE Request Issues ===\n\n";

// Test 1: Check if php://input works correctly
echo "1. Testing php://input reading:\n";
$testJson = '{"id": 123}';
file_put_contents('php://temp', $testJson);
echo "   Test JSON written\n";

// Test 2: Check $_SERVER variables
echo "\n2. Server variables:\n";
echo "   REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'NOT SET') . "\n";
echo "   CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'NOT SET') . "\n";
echo "   HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'NOT SET') . "\n";

// Test 3: Check if we can simulate DELETE
echo "\n3. Simulating DELETE request:\n";
$_SERVER['REQUEST_METHOD'] = 'DELETE';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Mock input data
$testDeleteData = json_encode(['id' => 999]);
echo "   Test data: $testDeleteData\n";

// Test 4: Direct database delete test
echo "\n4. Direct database DELETE test:\n";
try {
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
    
    // Test each table
    $tables = ['sales', 'expenses', 'storage_items'];
    
    foreach ($tables as $table) {
        echo "   Testing $table:\n";
        
        // Insert a test record
        if ($table == 'sales') {
            $stmt = $db->prepare("INSERT INTO sales (product_name, quantity, total_amount, sale_date, client_name) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['DELETE_TEST', 1, 1.00, date('Y-m-d'), 'DELETE_TEST']);
        } elseif ($table == 'expenses') {
            $stmt = $db->prepare("INSERT INTO expenses (name, amount, category, expense_date) VALUES (?, ?, ?, ?)");
            $stmt->execute(['DELETE_TEST', 1.00, 'DELETE_TEST', date('Y-m-d')]);
        } elseif ($table == 'storage_items') {
            $stmt = $db->prepare("INSERT INTO storage_items (item_name, quantity_in_tons, purchase_price_per_ton, dealer_name, purchase_date) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['DELETE_TEST', 1.0, 1.00, 'DELETE_TEST', date('Y-m-d')]);
        }
        
        $testId = $db->lastInsertId();
        echo "     Created test record ID: $testId\n";
        
        // Try to delete it
        $stmt = $db->prepare("DELETE FROM $table WHERE id = ?");
        $result = $stmt->execute([$testId]);
        $rowsAffected = $stmt->rowCount();
        
        echo "     DELETE result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
        echo "     Rows affected: $rowsAffected\n";
        
        // Verify deletion
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM $table WHERE id = ?");
        $stmt->execute([$testId]);
        $count = $stmt->fetch()['count'];
        echo "     Records remaining: $count\n";
        
        if ($count == 0) {
            echo "     ✅ DELETE working correctly\n";
        } else {
            echo "     ❌ DELETE failed - record still exists\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "   Database error: " . $e->getMessage() . "\n";
}

// Test 5: Check API error handling
echo "\n5. Testing API error handling:\n";
$apis = ['sales', 'expenses', 'storage'];

foreach ($apis as $api) {
    echo "   Testing $api API:\n";
    $apiFile = "api/$api.php";
    
    if (file_exists($apiFile)) {
        echo "     API file exists\n";
        
        // Test with invalid ID
        $_SERVER['REQUEST_METHOD'] = 'DELETE';
        $GLOBALS['mock_input'] = json_encode(['id' => 'invalid']);
        
        // Capture output
        ob_start();
        try {
            // Override file_get_contents for php://input
            function file_get_contents_mock($filename) {
                if ($filename === 'php://input') {
                    return $GLOBALS['mock_input'];
                }
                return file_get_contents($filename);
            }
            
            // Include API (this might show errors)
            include $apiFile;
            $output = ob_get_clean();
            
            echo "     API response: " . trim($output) . "\n";
            
        } catch (Exception $e) {
            ob_end_clean();
            echo "     API error: " . $e->getMessage() . "\n";
        }
    } else {
        echo "     ❌ API file missing\n";
    }
    echo "\n";
}

echo "=== Debug Complete ===\n";
?>