<?php
// API Testing Script - Test all endpoints are working
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [];

// Test database connection
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
    $results['database_connection'] = 'SUCCESS';
} catch(PDOException $e) {
    $results['database_connection'] = 'FAILED: ' . $e->getMessage();
    echo json_encode($results);
    exit();
}

// Test if sales table exists and check structure
try {
    $stmt = $db->query("SHOW TABLES LIKE 'sales'");
    if ($stmt->rowCount() > 0) {
        $results['sales_table_exists'] = 'YES';
        
        // Get table structure
        $stmt = $db->query("DESCRIBE sales");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $results['sales_table_columns'] = array_column($columns, 'Field');
    } else {
        $results['sales_table_exists'] = 'NO';
    }
} catch(PDOException $e) {
    $results['sales_table_check'] = 'FAILED: ' . $e->getMessage();
}

// Test if expenses table exists
try {
    $stmt = $db->query("SHOW TABLES LIKE 'expenses'");
    if ($stmt->rowCount() > 0) {
        $results['expenses_table_exists'] = 'YES';
        
        // Get table structure
        $stmt = $db->query("DESCRIBE expenses");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $results['expenses_table_columns'] = array_column($columns, 'Field');
    } else {
        $results['expenses_table_exists'] = 'NO';
    }
} catch(PDOException $e) {
    $results['expenses_table_check'] = 'FAILED: ' . $e->getMessage();
}

// Test sample data insertion into sales
try {
    // Try inserting a test sale
    $query = "INSERT INTO sales (customer_name, product, quantity, unit_price, total_amount, sale_date, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    $testResult = $stmt->execute([
        'Test Customer',
        'Test Product',
        1,
        100.00,
        100.00,
        date('Y-m-d'),
        'API Test Entry'
    ]);
    
    if ($testResult) {
        $newId = $db->lastInsertId();
        $results['sales_insert_test'] = 'SUCCESS - ID: ' . $newId;
        
        // Clean up test data
        $db->prepare("DELETE FROM sales WHERE id = ?")->execute([$newId]);
    } else {
        $results['sales_insert_test'] = 'FAILED';
    }
} catch(PDOException $e) {
    $results['sales_insert_test'] = 'FAILED: ' . $e->getMessage();
}

// Test sample data insertion into expenses
try {
    // Try inserting a test expense
    $query = "INSERT INTO expenses (description, amount, category, expense_date, notes) 
             VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    $testResult = $stmt->execute([
        'Test Expense',
        50.00,
        'Testing',
        date('Y-m-d'),
        'API Test Entry'
    ]);
    
    if ($testResult) {
        $newId = $db->lastInsertId();
        $results['expenses_insert_test'] = 'SUCCESS - ID: ' . $newId;
        
        // Clean up test data
        $db->prepare("DELETE FROM expenses WHERE id = ?")->execute([$newId]);
    } else {
        $results['expenses_insert_test'] = 'FAILED';
    }
} catch(PDOException $e) {
    $results['expenses_insert_test'] = 'FAILED: ' . $e->getMessage();
}

$results['timestamp'] = date('Y-m-d H:i:s');
$results['status'] = 'API_DIAGNOSTICS_COMPLETE';

echo json_encode($results, JSON_PRETTY_PRINT);
?>