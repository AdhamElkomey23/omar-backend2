<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Direct database connection with error handling
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
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            // Get all storage items
            $query = "SELECT * FROM storage_items ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to camelCase for frontend
            $formattedItems = array_map(function($item) {
                return [
                    'id' => (int)$item['id'],
                    'itemName' => $item['item_name'],
                    'quantityInTons' => (float)$item['quantity_in_tons'],
                    'purchasePricePerTon' => (float)$item['purchase_price_per_ton'],
                    'dealerName' => $item['dealer_name'],
                    'dealerContact' => $item['dealer_contact'] ?? '',
                    'purchaseDate' => $item['purchase_date'],
                    'createdAt' => $item['created_at']
                ];
            }, $items);
            
            echo json_encode($formattedItems);
            break;
            
        case 'POST':
            // Add new storage item
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['itemName']) || !isset($input['quantityInTons']) || !isset($input['purchasePricePerTon']) || !isset($input['dealerName'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit();
            }
            
            $query = "INSERT INTO storage_items (item_name, quantity_in_tons, purchase_price_per_ton, dealer_name, dealer_contact, purchase_date) 
                     VALUES (:item_name, :quantity_in_tons, :purchase_price_per_ton, :dealer_name, :dealer_contact, :purchase_date)";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':item_name' => $input['itemName'],
                ':quantity_in_tons' => $input['quantityInTons'],
                ':purchase_price_per_ton' => $input['purchasePricePerTon'],
                ':dealer_name' => $input['dealerName'],
                ':dealer_contact' => $input['dealerContact'] ?? '',
                ':purchase_date' => $input['purchaseDate'] ?? date('Y-m-d')
            ]);
            
            if ($result) {
                $newId = $db->lastInsertId();
                echo json_encode(['id' => $newId, 'message' => 'Storage item added successfully']);
            } else {
                throw new Exception('Failed to add storage item');
            }
            break;
            
        case 'PUT':
            // Update storage item
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing item ID']);
                exit();
            }
            
            $query = "UPDATE storage_items SET 
                     item_name = :item_name, quantity_in_tons = :quantity_in_tons, 
                     purchase_price_per_ton = :purchase_price_per_ton, dealer_name = :dealer_name, 
                     dealer_contact = :dealer_contact, purchase_date = :purchase_date
                     WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':id' => $input['id'],
                ':item_name' => $input['itemName'],
                ':quantity_in_tons' => $input['quantityInTons'],
                ':purchase_price_per_ton' => $input['purchasePricePerTon'],
                ':dealer_name' => $input['dealerName'],
                ':dealer_contact' => $input['dealerContact'] ?? '',
                ':purchase_date' => $input['purchaseDate']
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Storage item updated successfully']);
            } else {
                throw new Exception('Failed to update storage item');
            }
            break;
            
        case 'DELETE':
            // Delete storage item
            $rawInput = file_get_contents('php://input');
            
            if (empty($rawInput)) {
                http_response_code(400);
                echo json_encode(['error' => 'No input data received']);
                exit();
            }
            
            $input = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON data']);
                exit();
            }
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing item ID']);
                exit();
            }
            
            $itemId = $input['id'];
            
            // Check if record exists
            $checkStmt = $db->prepare("SELECT id FROM storage_items WHERE id = ?");
            $checkStmt->execute([$itemId]);
            
            if ($checkStmt->rowCount() == 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Storage item not found']);
                exit();
            }
            
            // Perform delete
            $stmt = $db->prepare("DELETE FROM storage_items WHERE id = ?");
            $result = $stmt->execute([$itemId]);
            
            if ($result && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Storage item deleted successfully']);
            } else {
                throw new Exception('Failed to delete storage item - no rows affected');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(Exception $e) {
    error_log("Storage API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
?>