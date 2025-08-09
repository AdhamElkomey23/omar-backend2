<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "=== Testing All APIs ===\n\n";

// Test database connection first
echo "1. Testing Database Connection...\n";
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
    echo "✅ Database connection successful\n\n";
} catch(Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit();
}

// Test each API endpoint
$apis = [
    'sales' => [
        'url' => '/api/sales.php',
        'test_data' => [
            'productName' => 'Test Product',
            'quantity' => 10,
            'totalAmount' => 1000.50,
            'clientName' => 'Test Client'
        ]
    ],
    'expenses' => [
        'url' => '/api/expenses.php',
        'test_data' => [
            'name' => 'Test Expense',
            'amount' => 500.00,
            'category' => 'Office Supplies'
        ]
    ],
    'salary-deductions' => [
        'url' => '/api/salary-deductions.php',
        'test_data' => [
            'workerId' => 1,
            'deductionAmount' => 100.00,
            'deductionType' => 'Late Arrival'
        ]
    ],
    'activity-logs' => [
        'url' => '/api/activity-logs.php',
        'test_data' => [
            'title' => 'Test Activity',
            'description' => 'Test activity description'
        ]
    ]
];

foreach ($apis as $apiName => $apiInfo) {
    echo "2. Testing $apiName API...\n";
    
    // Test GET request
    echo "   GET Request: ";
    try {
        $response = file_get_contents("http://" . $_SERVER['HTTP_HOST'] . $apiInfo['url']);
        if ($response !== false) {
            $data = json_decode($response, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                echo "✅ GET works - returned " . count($data) . " records\n";
            } else {
                echo "❌ GET failed - invalid JSON: " . $response . "\n";
            }
        } else {
            echo "❌ GET failed - no response\n";
        }
    } catch(Exception $e) {
        echo "❌ GET failed - " . $e->getMessage() . "\n";
    }
    
    // Test POST request (simulate)
    echo "   POST Test: ";
    try {
        // Simulate POST by calling the API file directly
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_POST = $apiInfo['test_data'];
        
        // Capture output
        ob_start();
        include $apiInfo['url'];
        $output = ob_get_clean();
        
        $result = json_decode($output, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (isset($result['error'])) {
                echo "❌ POST failed - " . $result['error'] . "\n";
            } else {
                echo "✅ POST works\n";
            }
        } else {
            echo "❌ POST failed - invalid response: " . $output . "\n";
        }
    } catch(Exception $e) {
        echo "❌ POST failed - " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

echo "=== Test Complete ===\n";
?>