<?php
// Simple diagnostic script to test each API endpoint
header('Content-Type: text/html; charset=utf-8');
echo "<h1>API Diagnostic Report</h1>";
echo "<style>body{font-family:Arial;} .success{color:green;} .error{color:red;} .info{color:blue;}</style>";

// Test database connection first
echo "<h2>1. Database Connection Test</h2>";
try {
    $host = 'localhost';
    $db_name = 'u179479756_newomar';
    $username = 'u179479756_newomarapp';
    $password = '#sS9ei3lK+';
    
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
    
    echo "<p class='success'>✅ Database connection successful</p>";
    
    // Test each table exists
    $tables = ['workers', 'storage_items', 'salary_deductions', 'expenses', 'sales'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM $table LIMIT 1");
            $stmt->execute();
            $result = $stmt->fetch();
            echo "<p class='success'>✅ Table '$table' exists with {$result['count']} records</p>";
        } catch (Exception $e) {
            echo "<p class='error'>❌ Table '$table' error: " . $e->getMessage() . "</p>";
        }
    }
    
} catch (PDOException $e) {
    echo "<p class='error'>❌ Database connection failed: " . $e->getMessage() . "</p>";
    exit;
}

// Test individual API files
echo "<h2>2. API File Tests</h2>";
$apis = [
    'workers' => 'api/workers.php',
    'storage' => 'api/storage.php',
    'expenses' => 'api/expenses.php',
    'sales' => 'api/sales.php',
    'salary-deductions' => 'api/salary-deductions.php'
];

foreach ($apis as $name => $file) {
    echo "<h3>Testing $name API ($file)</h3>";
    
    if (file_exists($file)) {
        echo "<p class='success'>✅ File exists</p>";
        
        // Test if file has syntax errors
        $output = [];
        $return_code = 0;
        exec("php -l $file 2>&1", $output, $return_code);
        
        if ($return_code === 0) {
            echo "<p class='success'>✅ PHP syntax is valid</p>";
            
            // Test actual API call
            $url = "http://" . $_SERVER['HTTP_HOST'] . "/" . $file;
            echo "<p class='info'>Testing URL: $url</p>";
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => "Content-Type: application/json\r\n",
                    'timeout' => 10
                ]
            ]);
            
            $response = @file_get_contents($url, false, $context);
            
            if ($response !== false) {
                // Check if response is valid JSON
                $json_data = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    echo "<p class='success'>✅ API returned valid JSON (" . strlen($response) . " bytes)</p>";
                    echo "<p class='info'>Sample response: " . htmlspecialchars(substr($response, 0, 100)) . "...</p>";
                } else {
                    echo "<p class='error'>❌ API returned invalid JSON</p>";
                    echo "<p class='error'>Response: " . htmlspecialchars(substr($response, 0, 200)) . "</p>";
                }
            } else {
                echo "<p class='error'>❌ API call failed</p>";
                if (isset($http_response_header)) {
                    foreach ($http_response_header as $header) {
                        echo "<p class='error'>Header: $header</p>";
                    }
                }
            }
        } else {
            echo "<p class='error'>❌ PHP syntax error:</p>";
            foreach ($output as $line) {
                echo "<p class='error'>" . htmlspecialchars($line) . "</p>";
            }
        }
    } else {
        echo "<p class='error'>❌ File does not exist</p>";
    }
    
    echo "<hr>";
}

// Test PHP configuration
echo "<h2>3. PHP Configuration</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>PDO Available: " . (extension_loaded('pdo') ? 'Yes' : 'No') . "</p>";
echo "<p>PDO MySQL Available: " . (extension_loaded('pdo_mysql') ? 'Yes' : 'No') . "</p>";
echo "<p>Error Reporting: " . error_reporting() . "</p>";
echo "<p>Display Errors: " . ini_get('display_errors') . "</p>";
echo "<p>Log Errors: " . ini_get('log_errors') . "</p>";

// Check if error log exists
$error_log = ini_get('error_log');
if ($error_log && file_exists($error_log)) {
    echo "<h2>4. Recent Error Log</h2>";
    $errors = file_get_contents($error_log);
    $recent_errors = array_slice(explode("\n", $errors), -20); // Last 20 lines
    foreach ($recent_errors as $error) {
        if (trim($error)) {
            echo "<p class='error'>" . htmlspecialchars($error) . "</p>";
        }
    }
}

echo "<h2>5. File Permissions</h2>";
foreach ($apis as $name => $file) {
    if (file_exists($file)) {
        $perms = fileperms($file);
        echo "<p>$file: " . substr(sprintf('%o', $perms), -4) . "</p>";
    }
}
?>