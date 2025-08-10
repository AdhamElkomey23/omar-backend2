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
    error_log("Storage API error: " . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function handleGet() {
    $db = Database::getInstance();
    
    if (isset($_GET['id'])) {
        // Get single storage item
        $id = (int)$_GET['id'];
        $item = $db->fetch("SELECT * FROM storage_items WHERE id = ?", [$id]);
        
        if (!$item) {
            jsonResponse(['error' => 'Storage item not found'], 404);
        }
        
        jsonResponse($item);
    } else {
        // Get all storage items
        $items = $db->fetchAll("SELECT * FROM storage_items ORDER BY created_at DESC");
        jsonResponse($items);
    }
}

function handlePost() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(['error' => 'Invalid JSON data'], 400);
    }
    
    // Validate required fields
    $required = ['itemName', 'quantityInTons', 'purchasePricePerTon', 'dealerName', 'purchaseDate'];
    $missing = validateRequired($input, $required);
    
    if (!empty($missing)) {
        jsonResponse(['error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
    }
    
    // Sanitize input
    $data = sanitizeInput($input);
    
    // Validate numeric fields
    if (!is_numeric($data['quantityInTons']) || $data['quantityInTons'] < 0) {
        jsonResponse(['error' => 'Invalid quantity'], 400);
    }
    
    if (!is_numeric($data['purchasePricePerTon']) || $data['purchasePricePerTon'] < 0) {
        jsonResponse(['error' => 'Invalid price'], 400);
    }
    
    $db = Database::getInstance();
    
    // Insert storage item
    $query = "
        INSERT INTO storage_items (
            item_name, quantity_in_tons, purchase_price_per_ton,
            dealer_name, dealer_contact, purchase_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ";
    
    $params = [
        $data['itemName'],
        $data['quantityInTons'],
        $data['purchasePricePerTon'],
        $data['dealerName'],
        $data['dealerContact'] ?? null,
        $data['purchaseDate']
    ];
    
    $db->query($query, $params);
    $itemId = $db->lastInsertId();
    
    // Get the created item
    $item = $db->fetch("SELECT * FROM storage_items WHERE id = ?", [$itemId]);
    
    jsonResponse($item, 201);
}

function handlePut() {
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Storage item ID is required'], 400);
    }
    
    $id = (int)$_GET['id'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        jsonResponse(['error' => 'Invalid JSON data'], 400);
    }
    
    $db = Database::getInstance();
    
    // Check if item exists
    $existingItem = $db->fetch("SELECT * FROM storage_items WHERE id = ?", [$id]);
    if (!$existingItem) {
        jsonResponse(['error' => 'Storage item not found'], 404);
    }
    
    // Sanitize input
    $data = sanitizeInput($input);
    
    // Build update query dynamically
    $updateFields = [];
    $params = [];
    
    if (isset($data['itemName'])) {
        $updateFields[] = 'item_name = ?';
        $params[] = $data['itemName'];
    }
    
    if (isset($data['quantityInTons'])) {
        if (!is_numeric($data['quantityInTons']) || $data['quantityInTons'] < 0) {
            jsonResponse(['error' => 'Invalid quantity'], 400);
        }
        $updateFields[] = 'quantity_in_tons = ?';
        $params[] = $data['quantityInTons'];
    }
    
    if (isset($data['purchasePricePerTon'])) {
        if (!is_numeric($data['purchasePricePerTon']) || $data['purchasePricePerTon'] < 0) {
            jsonResponse(['error' => 'Invalid price'], 400);
        }
        $updateFields[] = 'purchase_price_per_ton = ?';
        $params[] = $data['purchasePricePerTon'];
    }
    
    if (isset($data['dealerName'])) {
        $updateFields[] = 'dealer_name = ?';
        $params[] = $data['dealerName'];
    }
    
    if (isset($data['dealerContact'])) {
        $updateFields[] = 'dealer_contact = ?';
        $params[] = $data['dealerContact'];
    }
    
    if (isset($data['purchaseDate'])) {
        $updateFields[] = 'purchase_date = ?';
        $params[] = $data['purchaseDate'];
    }
    
    if (empty($updateFields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $params[] = $id;
    $query = "UPDATE storage_items SET " . implode(', ', $updateFields) . " WHERE id = ?";
    
    $db->query($query, $params);
    
    // Return updated item
    $item = $db->fetch("SELECT * FROM storage_items WHERE id = ?", [$id]);
    jsonResponse($item);
}

function handleDelete() {
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Storage item ID is required'], 400);
    }
    
    $id = (int)$_GET['id'];
    $db = Database::getInstance();
    
    // Check if item exists
    $item = $db->fetch("SELECT * FROM storage_items WHERE id = ?", [$id]);
    if (!$item) {
        jsonResponse(['error' => 'Storage item not found'], 404);
    }
    
    // Delete item
    $db->query("DELETE FROM storage_items WHERE id = ?", [$id]);
    
    jsonResponse(['message' => 'Storage item deleted successfully']);
}
?>