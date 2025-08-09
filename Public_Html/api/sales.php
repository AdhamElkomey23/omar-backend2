<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

// Try to get database connection, fall back to mock data if fails
$db = DatabaseConfig::getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if ($db === null) {
                // Use mock data when database is not available
                $sales = DatabaseConfig::getMockData('sales');
                echo json_encode($sales);
                exit();
            }
            
            // Get all sales
            $query = "SELECT * FROM sales ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to camelCase for frontend, matching actual database schema
            $formattedSales = array_map(function($sale) {
                return [
                    'id' => (int)$sale['id'],
                    'productName' => $sale['product'],
                    'quantity' => (float)$sale['quantity'], // Allow decimal quantities
                    'unitPrice' => (float)$sale['unit_price'],
                    'totalAmount' => (float)$sale['total_amount'],
                    'saleDate' => $sale['sale_date'],
                    'clientName' => $sale['customer_name'],
                    'clientContact' => $sale['notes'] ?? '',
                    'createdAt' => $sale['created_at']
                ];
            }, $sales);
            
            echo json_encode($formattedSales);
            break;
            
        case 'POST':
            if ($db === null) {
                http_response_code(503);
                echo json_encode(['error' => 'Database not available. This is demo mode.']);
                exit();
            }
            
            // Add new sale
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'No input data received']);
                exit();
            }
            
            // Validate required fields - support both frontend field names
            $required = ['productName', 'quantity', 'totalAmount'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || (is_string($input[$field]) && trim($input[$field]) === '')) {
                    http_response_code(400);
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit();
                }
            }
            
            // Check for client name (support both clientName and buyerName for compatibility)
            $clientName = $input['clientName'] ?? $input['buyerName'] ?? '';
            if (empty(trim($clientName))) {
                http_response_code(400);
                echo json_encode(['error' => 'Client name is required']);
                exit();
            }
            
            // Validate numeric fields - allow floating point quantities
            if (!is_numeric($input['quantity']) || $input['quantity'] <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Quantity must be a positive number']);
                exit();
            }
            
            if (!is_numeric($input['totalAmount']) || $input['totalAmount'] <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Total amount must be a positive number']);
                exit();
            }
            
            // Insert with proper error handling
            try {
                // First check if sales table exists and create if not
                $checkTable = "SHOW TABLES LIKE 'sales'";
                $stmt = $db->prepare($checkTable);
                $stmt->execute();
                
                if ($stmt->rowCount() == 0) {
                    // Create sales table if it doesn't exist matching the schema
                    $createTable = "CREATE TABLE sales (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_name VARCHAR(255) NOT NULL,
                        product VARCHAR(255) NOT NULL,
                        quantity DECIMAL(10,2) NOT NULL,
                        unit_price DECIMAL(10,2) NOT NULL,
                        total_amount DECIMAL(12,2) NOT NULL,
                        sale_date DATE NOT NULL,
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )";
                    $db->exec($createTable);
                }
                
                // INVENTORY MANAGEMENT: Check and update storage before recording sale
                
                // 1. Find matching product in storage by name
                $storageCheckQuery = "SELECT id, item_name, quantity_in_tons FROM storage_items WHERE item_name = ?";
                $storageStmt = $db->prepare($storageCheckQuery);
                $storageStmt->execute([$input['productName']]);
                $storageItem = $storageStmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$storageItem) {
                    http_response_code(400);
                    echo json_encode([
                        'error' => 'Product "' . $input['productName'] . '" not found in storage. Please add it to storage first.',
                        'product_not_found' => true
                    ]);
                    exit();
                }
                
                // 2. Convert sold quantity to tons (assuming input quantity is in the same unit as storage)
                // For fertilizer factory, typically storage is in tons and sales could be in tons too
                $soldQuantityInTons = (float)$input['quantity'];
                $currentStorageQuantity = (float)$storageItem['quantity_in_tons'];
                
                // 3. Check if there's enough quantity in storage
                if ($currentStorageQuantity < $soldQuantityInTons) {
                    http_response_code(400);
                    echo json_encode([
                        'error' => 'Insufficient stock! Available: ' . $currentStorageQuantity . ' tons, Requested: ' . $soldQuantityInTons . ' tons',
                        'insufficient_stock' => true,
                        'available_quantity' => $currentStorageQuantity,
                        'requested_quantity' => $soldQuantityInTons
                    ]);
                    exit();
                }
                
                // 4. Start database transaction to ensure data consistency
                $db->beginTransaction();
                
                try {
                    // 5. Update storage quantity (reduce by sold amount)
                    $newStorageQuantity = $currentStorageQuantity - $soldQuantityInTons;
                    $updateStorageQuery = "UPDATE storage_items SET quantity_in_tons = ? WHERE id = ?";
                    $updateStorageStmt = $db->prepare($updateStorageQuery);
                    $storageUpdateResult = $updateStorageStmt->execute([$newStorageQuantity, $storageItem['id']]);
                    
                    if (!$storageUpdateResult) {
                        throw new Exception('Failed to update storage quantity');
                    }
                    
                    // 6. Calculate unit price from total amount and quantity
                    $unitPrice = (float)$input['totalAmount'] / (float)$input['quantity'];
                    
                    // 7. Record the sale
                    $query = "INSERT INTO sales (customer_name, product, quantity, unit_price, total_amount, sale_date, notes) 
                             VALUES (?, ?, ?, ?, ?, ?, ?)";
                    
                    $stmt = $db->prepare($query);
                    $result = $stmt->execute([
                        $clientName, // customer_name
                        $input['productName'], // product
                        (float)$input['quantity'], // Allow decimal quantities
                        $unitPrice, // calculated unit_price
                        (float)$input['totalAmount'],
                        $input['saleDate'] ?? date('Y-m-d'),
                        $input['clientContact'] ?? '' // notes field for contact info
                    ]);
                    
                    if (!$result) {
                        throw new Exception('Failed to record sale');
                    }
                    
                    // 8. Commit transaction - both storage update and sale recording succeeded
                    $db->commit();
                    
                    $newId = $db->lastInsertId();
                    echo json_encode([
                        'success' => true,
                        'id' => (int)$newId,
                        'message' => 'Sale recorded successfully! Storage updated: ' . $currentStorageQuantity . ' tons → ' . $newStorageQuantity . ' tons',
                        'storage_updated' => true,
                        'previous_storage_quantity' => $currentStorageQuantity,
                        'new_storage_quantity' => $newStorageQuantity,
                        'sold_quantity' => $soldQuantityInTons
                    ]);
                    
                } catch (Exception $e) {
                    // 9. Rollback transaction if anything fails
                    $db->rollback();
                    throw new Exception('Transaction failed: ' . $e->getMessage());
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
                exit();
            }
            break;
            
        case 'PUT':
            // Update sale
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing sale ID']);
                exit();
            }
            
            $query = "UPDATE sales SET 
                     product_name = :product_name, quantity = :quantity, total_amount = :total_amount,
                     sale_date = :sale_date, client_name = :client_name, client_contact = :client_contact
                     WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                ':id' => $input['id'],
                ':product_name' => $input['productName'],
                ':quantity' => $input['quantity'],
                ':total_amount' => $input['totalAmount'],
                ':sale_date' => $input['saleDate'],
                ':client_name' => $input['clientName'],
                ':client_contact' => $input['clientContact'] ?? ''
            ]);
            
            if ($result) {
                echo json_encode(['message' => 'Sale updated successfully']);
            } else {
                throw new Exception('Failed to update sale');
            }
            break;
            
        case 'DELETE':
            // Delete sale
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
                echo json_encode(['error' => 'Missing sale ID']);
                exit();
            }
            
            $saleId = $input['id'];
            
            // Check if record exists
            $checkStmt = $db->prepare("SELECT id FROM sales WHERE id = ?");
            $checkStmt->execute([$saleId]);
            
            if ($checkStmt->rowCount() == 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Sale not found']);
                exit();
            }
            
            // Perform delete
            $stmt = $db->prepare("DELETE FROM sales WHERE id = ?");
            $result = $stmt->execute([$saleId]);
            
            if ($result && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Sale deleted successfully']);
            } else {
                throw new Exception('Failed to delete sale - no rows affected');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(Exception $e) {
    error_log("Sales API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
?>