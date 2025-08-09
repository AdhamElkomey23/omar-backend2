
<?php
// Database migration to update sales quantity field to allow decimals
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
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "Updating sales table to allow decimal quantities...\n";
    
    // Update the quantity column to DECIMAL(10,3) to allow up to 3 decimal places
    $updateQuery = "ALTER TABLE sales MODIFY COLUMN quantity DECIMAL(10,3) NOT NULL";
    $db->exec($updateQuery);
    
    echo "✅ Successfully updated sales.quantity column to DECIMAL(10,3)\n";
    echo "Now you can enter quantities like 4.5, 1.123, etc.\n";
    
} catch(PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
} catch(Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
