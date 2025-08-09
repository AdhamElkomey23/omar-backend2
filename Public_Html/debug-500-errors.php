<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "=== Debugging 500 Errors for POST Requests ===\n\n";

try {
    // Test database connection first
    echo "1. Testing Database Connection:\n";
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
    echo "   ✅ Database connection successful\n\n";
    
    // Test each API POST functionality
    $testCases = [
        'sales' => [
            'file' => 'api/sales.php',
            'data' => [
                'productName' => 'Test Product 500',
                'quantity' => 5,
                'totalAmount' => 250.50,
                'clientName' => 'Test Client 500',
                'clientContact' => '123456789',
                'saleDate' => date('Y-m-d')
            ]
        ],
        'expenses' => [
            'file' => 'api/expenses.php', 
            'data' => [
                'name' => 'Test Expense 500',
                'amount' => 100.75,
                'category' => 'Office Supplies',
                'expenseDate' => date('Y-m-d')
            ]
        ]
    ];
    
    foreach ($testCases as $apiName => $testCase) {
        echo "2. Testing $apiName API POST:\n";
        
        if (!file_exists($testCase['file'])) {
            echo "   ❌ API file missing: {$testCase['file']}\n\n";
            continue;
        }
        
        echo "   ✅ API file exists\n";
        
        // Test direct database insert first
        echo "   Testing direct database insert:\n";
        try {
            if ($apiName == 'sales') {
                $stmt = $db->prepare("INSERT INTO sales (product_name, quantity, total_amount, sale_date, client_name, client_contact) VALUES (?, ?, ?, ?, ?, ?)");
                $result = $stmt->execute([
                    $testCase['data']['productName'],
                    $testCase['data']['quantity'], 
                    $testCase['data']['totalAmount'],
                    $testCase['data']['saleDate'],
                    $testCase['data']['clientName'],
                    $testCase['data']['clientContact']
                ]);
            } elseif ($apiName == 'expenses') {
                $stmt = $db->prepare("INSERT INTO expenses (name, amount, category, expense_date) VALUES (?, ?, ?, ?)");
                $result = $stmt->execute([
                    $testCase['data']['name'],
                    $testCase['data']['amount'],
                    $testCase['data']['category'], 
                    $testCase['data']['expenseDate']
                ]);
            }
            
            if ($result) {
                $testId = $db->lastInsertId();
                echo "     ✅ Direct database insert successful (ID: $testId)\n";
                
                // Clean up test record
                $table = ($apiName == 'sales') ? 'sales' : 'expenses';
                $db->prepare("DELETE FROM $table WHERE id = ?")->execute([$testId]);
                echo "     ✅ Test record cleaned up\n";
            } else {
                echo "     ❌ Direct database insert failed\n";
            }
        } catch (Exception $e) {
            echo "     ❌ Database insert error: " . $e->getMessage() . "\n";
        }
        
        // Test API endpoint
        echo "   Testing API endpoint:\n";
        
        // Simulate POST request
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['CONTENT_TYPE'] = 'application/json';
        
        // Mock input data
        $jsonData = json_encode($testCase['data']);
        echo "     Sending JSON: $jsonData\n";
        
        // Capture any output/errors
        ob_start();
        $errorOutput = '';
        
        try {
            // Override file_get_contents for php://input
            $GLOBALS['mock_post_data'] = $jsonData;
            
            // Custom function to override file_get_contents
            function file_get_contents_mock($filename) {
                if ($filename === 'php://input') {
                    return $GLOBALS['mock_post_data'];
                }
                return file_get_contents($filename);
            }
            
            // Include the API file
            include $testCase['file'];
            $output = ob_get_clean();
            
            echo "     API Response: " . trim($output) . "\n";
            
            // Check if it's valid JSON
            $response = json_decode($output, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                if (isset($response['error'])) {
                    echo "     ❌ API Error: " . $response['error'] . "\n";
                } elseif (isset($response['id']) || isset($response['message'])) {
                    echo "     ✅ API Success\n";
                } else {
                    echo "     ⚠️  Unexpected response format\n";
                }
            } else {
                echo "     ❌ Invalid JSON response\n";
            }
            
        } catch (ParseError $e) {
            ob_end_clean();
            echo "     ❌ PHP Parse Error: " . $e->getMessage() . "\n";
            echo "     File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
        } catch (Error $e) {
            ob_end_clean();
            echo "     ❌ PHP Fatal Error: " . $e->getMessage() . "\n";
            echo "     File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
        } catch (Exception $e) {
            ob_end_clean();
            echo "     ❌ Exception: " . $e->getMessage() . "\n";
            echo "     File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
        }
        
        echo "\n";
    }
    
    // Check for common 500 error causes
    echo "3. Checking Common 500 Error Causes:\n";
    
    // Check PHP syntax in API files
    $apiFiles = ['api/sales.php', 'api/expenses.php'];
    foreach ($apiFiles as $file) {
        echo "   Checking syntax of $file:\n";
        $output = shell_exec("php -l $file 2>&1");
        if (strpos($output, 'No syntax errors') !== false) {
            echo "     ✅ Syntax OK\n";
        } else {
            echo "     ❌ Syntax Error: $output\n";
        }
    }
    
    // Check table structure
    echo "   Checking table structures:\n";
    $tables = ['sales', 'expenses'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("DESCRIBE $table");
            $columns = $stmt->fetchAll();
            echo "     $table table columns: ";
            foreach ($columns as $col) {
                echo $col['Field'] . "(" . $col['Type'] . ") ";
            }
            echo "\n";
        } catch (Exception $e) {
            echo "     ❌ Error checking $table: " . $e->getMessage() . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "CRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n=== Debug Complete ===\n";
?>