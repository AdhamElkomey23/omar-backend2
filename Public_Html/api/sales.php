<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet();
            break;
        case 'POST':
            handlePost();
            break;
        case 'PUT':
            handlePut();
            break;
        case 'DELETE':
            handleDelete();
            break;
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Sales API error: " . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function handleGet() {
    $db = Database::getInstance();
    
    if (isset($_GET['id'])) {
        // Get single sale
        $id = (int)$_GET['id'];
        $sale = $db->fetch("SELECT * FROM sales WHERE id = ?", [$id]);
        
        if (!$sale) {
            jsonResponse(['error' => 'Sale not found'], 404);
        }
        
        jsonResponse($sale);
    } else {
        // Get all sales
        $query = "SELECT * FROM sales ORDER BY sale_date DESC, created_at DESC";
        $params = [];
        
        // Add filters if provided
        if (isset($_GET['product']) && !empty($_GET['product'])) {
            $query = "SELECT * FROM sales WHERE product_name = ? ORDER BY sale_date DESC, created_at DESC";
            $params[] = $_GET['product'];
        }
        
        $sales = $db->fetchAll($query, $params);
        jsonResponse($sales);
    }
}

function handlePost() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(['error' => 'Invalid JSON data'], 400);
    }
    
    // Validate required fields
    $required = ['productName', 'clientName', 'saleDate', 'totalAmount'];
    $missing = validateRequired($input, $required);
    
    if (!empty($missing)) {
        jsonResponse(['error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
    }
    
    // Sanitize input
    $data = sanitizeInput($input);
    
    $db = Database::getInstance();
    
    // Check if product exists in storage and has sufficient quantity
    $totalRequestedQuantity = ($data['quantityTons'] ?? 0) + (($data['quantityKg'] ?? 0) / 1000);
    
    if ($totalRequestedQuantity > 0) {
        $availableQuantity = $db->fetch(
            "SELECT SUM(quantity_in_tons) as total FROM storage_items WHERE item_name = ?",
            [$data['productName']]
        )['total'] ?? 0;
        
        if ($totalRequestedQuantity > $availableQuantity) {
            jsonResponse(['error' => 'Insufficient quantity in storage'], 400);
        }
    }
    
    // Insert sale
    $query = "
        INSERT INTO sales (
            product_name, quantity_tons, quantity_kg, total_amount,
            sale_date, client_name, client_contact, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ";
    
    $params = [
        $data['productName'],
        $data['quantityTons'] ?? 0,
        $data['quantityKg'] ?? 0,
        $data['totalAmount'],
        $data['saleDate'],
        $data['clientName'],
        $data['clientContact'] ?? null
    ];
    
    $db->query($query, $params);
    $saleId = $db->lastInsertId();
    
    // Deduct quantity from storage
    if ($totalRequestedQuantity > 0) {
        deductFromStorage($data['productName'], $totalRequestedQuantity);
    }
    
    // Get the created sale
    $sale = $db->fetch("SELECT * FROM sales WHERE id = ?", [$saleId]);
    
    jsonResponse($sale, 201);
}

function handlePut() {
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Sale ID is required'], 400);
    }
    
    $id = (int)$_GET['id'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(['error' => 'Invalid JSON data'], 400);
    }
    
    $db = Database::getInstance();
    
    // Get existing sale
    $existingSale = $db->fetch("SELECT * FROM sales WHERE id = ?", [$id]);
    if (!$existingSale) {
        jsonResponse(['error' => 'Sale not found'], 404);
    }
    
    // Sanitize input
    $data = sanitizeInput($input);
    
    // Calculate quantity changes
    $oldTotalQuantity = $existingSale['quantity_tons'] + ($existingSale['quantity_kg'] / 1000);
    $newTotalQuantity = ($data['quantityTons'] ?? 0) + (($data['quantityKg'] ?? 0) / 1000);
    $quantityDifference = $newTotalQuantity - $oldTotalQuantity;
    
    // Check storage availability if increasing quantity
    if ($quantityDifference > 0) {
        $availableQuantity = $db->fetch(
            "SELECT SUM(quantity_in_tons) as total FROM storage_items WHERE item_name = ?",
            [$data['productName']]
        )['total'] ?? 0;
        
        if ($quantityDifference > $availableQuantity) {
            jsonResponse(['error' => 'Insufficient quantity in storage'], 400);
        }
    }
    
    // Update sale
    $query = "
        UPDATE sales SET
            product_name = ?, quantity_tons = ?, quantity_kg = ?,
            total_amount = ?, sale_date = ?, client_name = ?, client_contact = ?
        WHERE id = ?
    ";
    
    $params = [
        $data['productName'],
        $data['quantityTons'] ?? 0,
        $data['quantityKg'] ?? 0,
        $data['totalAmount'],
        $data['saleDate'],
        $data['clientName'],
        $data['clientContact'] ?? null,
        $id
    ];
    
    $db->query($query, $params);
    
    // Adjust storage quantity
    if ($quantityDifference != 0) {
        if ($quantityDifference > 0) {
            // Deduct additional quantity
            deductFromStorage($data['productName'], $quantityDifference);
        } else {
            // Add back quantity
            addToStorage($data['productName'], abs($quantityDifference));
        }
    }
    
    // Return updated sale
    $sale = $db->fetch("SELECT * FROM sales WHERE id = ?", [$id]);
    jsonResponse($sale);
}

function handleDelete() {
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Sale ID is required'], 400);
    }
    
    $id = (int)$_GET['id'];
    $db = Database::getInstance();
    
    // Get sale data before deletion
    $sale = $db->fetch("SELECT * FROM sales WHERE id = ?", [$id]);
    if (!$sale) {
        jsonResponse(['error' => 'Sale not found'], 404);
    }
    
    // Delete sale
    $db->query("DELETE FROM sales WHERE id = ?", [$id]);
    
    // Add quantity back to storage
    $totalQuantity = $sale['quantity_tons'] + ($sale['quantity_kg'] / 1000);
    if ($totalQuantity > 0) {
        addToStorage($sale['product_name'], $totalQuantity);
    }
    
    jsonResponse(['message' => 'Sale deleted successfully']);
}

function deductFromStorage($productName, $quantity) {
    $db = Database::getInstance();
    
    // Get storage items for this product, ordered by date (FIFO)
    $storageItems = $db->fetchAll(
        "SELECT * FROM storage_items WHERE item_name = ? AND quantity_in_tons > 0 ORDER BY created_at ASC",
        [$productName]
    );
    
    $remainingToDeduct = $quantity;
    
    foreach ($storageItems as $item) {
        if ($remainingToDeduct <= 0) break;
        
        $availableInItem = $item['quantity_in_tons'];
        $deductFromItem = min($remainingToDeduct, $availableInItem);
        
        // Update storage item
        $newQuantity = $availableInItem - $deductFromItem;
        $db->query(
            "UPDATE storage_items SET quantity_in_tons = ? WHERE id = ?",
            [$newQuantity, $item['id']]
        );
        
        $remainingToDeduct -= $deductFromItem;
    }
    
    // Clean up items with zero quantity
    $db->query("DELETE FROM storage_items WHERE quantity_in_tons <= 0");
}

function addToStorage($productName, $quantity) {
    $db = Database::getInstance();
    
    // Find the most recent storage item for this product
    $recentItem = $db->fetch(
        "SELECT * FROM storage_items WHERE item_name = ? ORDER BY created_at DESC LIMIT 1",
        [$productName]
    );
    
    if ($recentItem) {
        // Add to existing item
        $newQuantity = $recentItem['quantity_in_tons'] + $quantity;
        $db->query(
            "UPDATE storage_items SET quantity_in_tons = ? WHERE id = ?",
            [$newQuantity, $recentItem['id']]
        );
    } else {
        // Create new storage item with default values
        $db->query(
            "INSERT INTO storage_items (
                item_name, quantity_in_tons, purchase_price_per_ton,
                dealer_name, dealer_contact, purchase_date, created_at
            ) VALUES (?, ?, ?, ?, ?, CURDATE(), NOW())",
            [
                $productName,
                $quantity,
                0, // Default price
                'استرداد من مبيعات',
                '',
            ]
        );
    }
}
?>