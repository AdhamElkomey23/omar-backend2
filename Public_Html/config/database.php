<?php
// Database configuration for development/demo
class DatabaseConfig {
    // For demo purposes, we'll use SQLite or create a mock data layer
    // In production, user will update these with their Hostinger credentials
    
    public static function getConnection() {
        // Try to connect to a local database, if fails, return mock data
        try {
            // For development, try to connect to the Replit PostgreSQL if available
            $host = $_ENV['PGHOST'] ?? 'localhost';
            $dbname = $_ENV['PGDATABASE'] ?? 'main';
            $username = $_ENV['PGUSER'] ?? 'postgres';
            $password = $_ENV['PGPASSWORD'] ?? '';
            $port = $_ENV['PGPORT'] ?? '5432';
            
            $pdo = new PDO(
                "pgsql:host=$host;port=$port;dbname=$dbname",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
            
            // Create tables if they don't exist
            self::initializeTables($pdo);
            return $pdo;
            
        } catch (PDOException $e) {
            // If database connection fails, we'll use mock data
            return null;
        }
    }
    
    private static function initializeTables($pdo) {
        // Create workers table
        $pdo->exec("CREATE TABLE IF NOT EXISTS workers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(100) NOT NULL,
            department VARCHAR(100) NOT NULL,
            salary DECIMAL(10,2) NOT NULL,
            hire_date DATE NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Create sales table
        $pdo->exec("CREATE TABLE IF NOT EXISTS sales (
            id SERIAL PRIMARY KEY,
            customer_name VARCHAR(255) NOT NULL,
            product VARCHAR(255) NOT NULL,
            quantity DECIMAL(10,2) NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            total_amount DECIMAL(12,2) NOT NULL,
            sale_date DATE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Create storage_items table
        $pdo->exec("CREATE TABLE IF NOT EXISTS storage_items (
            id SERIAL PRIMARY KEY,
            item_name VARCHAR(255) NOT NULL,
            quantity_in_tons DECIMAL(10,2) NOT NULL,
            purchase_price_per_ton DECIMAL(10,2) NOT NULL,
            dealer_name VARCHAR(255) NOT NULL,
            dealer_contact VARCHAR(255),
            purchase_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Create expenses table
        $pdo->exec("CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            expense_date DATE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Create activity_logs table
        $pdo->exec("CREATE TABLE IF NOT EXISTS activity_logs (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Insert sample data if tables are empty
        self::insertSampleData($pdo);
    }
    
    private static function insertSampleData($pdo) {
        // Check if we already have data
        $stmt = $pdo->query("SELECT COUNT(*) FROM workers");
        $workerCount = $stmt->fetchColumn();
        
        if ($workerCount == 0) {
            // Insert sample workers
            $workers = [
                ['Ahmed Hassan', 'Production Manager', 'Production', 45000, '2023-01-15', 'ahmed@alwasiloon.com', '+1234567890'],
                ['Fatima Ali', 'Quality Controller', 'Quality', 35000, '2023-02-20', 'fatima@alwasiloon.com', '+1234567891'],
                ['Mohammed Ibrahim', 'Machine Operator', 'Production', 28000, '2023-03-10', 'mohammed@alwasiloon.com', '+1234567892'],
                ['Aisha Mahmoud', 'Accountant', 'Finance', 40000, '2023-01-30', 'aisha@alwasiloon.com', '+1234567893'],
                ['Omar Khalil', 'Warehouse Supervisor', 'Storage', 32000, '2023-02-15', 'omar@alwasiloon.com', '+1234567894']
            ];
            
            foreach ($workers as $worker) {
                $pdo->prepare("INSERT INTO workers (name, role, department, salary, hire_date, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)")
                    ->execute($worker);
            }
            
            // Insert sample sales
            $sales = [
                ['Green Valley Farm', 'NPK Fertilizer', 50.00, 120.00, 6000.00, '2024-01-15', 'Bulk order for spring season'],
                ['Sunrise Agriculture', 'Organic Compost', 25.00, 80.00, 2000.00, '2024-01-20', 'Premium organic fertilizer'],
                ['Desert Bloom Co', 'Phosphate Mix', 30.00, 150.00, 4500.00, '2024-01-25', 'Specialized desert crop fertilizer'],
                ['City Gardens', 'All-Purpose Mix', 15.00, 90.00, 1350.00, '2024-02-01', 'Urban gardening supplies'],
                ['Valley Farms Ltd', 'Potassium Rich', 40.00, 110.00, 4400.00, '2024-02-05', 'High potassium content for fruit trees']
            ];
            
            foreach ($sales as $sale) {
                $pdo->prepare("INSERT INTO sales (customer_name, product, quantity, unit_price, total_amount, sale_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)")
                    ->execute($sale);
            }
            
            // Insert sample storage items
            $storageItems = [
                ['Raw Phosphate Rock', 100.00, 45.00, 'Al-Khobar Mining Co', '+966123456789', '2024-01-01'],
                ['Nitrogen Concentrate', 75.00, 80.00, 'Petrochemical Industries', '+966987654321', '2024-01-10'],
                ['Potassium Chloride', 60.00, 65.00, 'Jordan Potash Company', '+962123456789', '2024-01-15'],
                ['Organic Base Material', 120.00, 35.00, 'Green Earth Suppliers', '+966555123456', '2024-01-20']
            ];
            
            foreach ($storageItems as $item) {
                $pdo->prepare("INSERT INTO storage_items (item_name, quantity_in_tons, purchase_price_per_ton, dealer_name, dealer_contact, purchase_date) VALUES (?, ?, ?, ?, ?, ?)")
                    ->execute($item);
            }
            
            // Insert sample expenses
            $expenses = [
                ['Electricity Bill', 'Utilities', 2500.00, '2024-01-31', 'Monthly factory electricity consumption'],
                ['Worker Salaries', 'Salaries', 18000.00, '2024-01-31', 'Monthly payroll for all workers'],
                ['Equipment Maintenance', 'Maintenance', 3500.00, '2024-01-25', 'Quarterly maintenance of production equipment'],
                ['Raw Material Transport', 'Transportation', 1200.00, '2024-01-20', 'Truck rental for material delivery'],
                ['Safety Equipment', 'Other', 800.00, '2024-01-15', 'Personal protective equipment for workers']
            ];
            
            foreach ($expenses as $expense) {
                $pdo->prepare("INSERT INTO expenses (description, category, amount, expense_date, notes) VALUES (?, ?, ?, ?, ?)")
                    ->execute($expense);
            }
            
            // Insert sample activity logs
            $logs = [
                ['New Worker Added', 'Added Mohammed Ibrahim as Machine Operator', '2024-01-30 10:30:00'],
                ['Large Sale Completed', 'Sold 50 tons NPK Fertilizer to Green Valley Farm', '2024-01-15 14:20:00'],
                ['Storage Updated', 'Received 100 tons Raw Phosphate Rock from supplier', '2024-01-01 09:00:00'],
                ['Expense Recorded', 'Monthly electricity bill payment processed', '2024-01-31 16:45:00'],
                ['Quality Check', 'Completed quality inspection of Batch #2024-001', '2024-01-25 11:15:00']
            ];
            
            foreach ($logs as $log) {
                $pdo->prepare("INSERT INTO activity_logs (title, description, log_date) VALUES (?, ?, ?)")
                    ->execute($log);
            }
        }
    }
    
    // Mock data for when database is not available
    public static function getMockData($type) {
        switch($type) {
            case 'dashboard':
                return [
                    'totalIncome' => 18250.00,
                    'totalExpenses' => 26000.00,
                    'totalWorkers' => 5,
                    'recentTransactions' => [
                        ['type' => 'sale', 'description' => 'Sale: NPK Fertilizer to Green Valley Farm', 'amount' => 6000.00, 'date' => '2024-01-15'],
                        ['type' => 'sale', 'description' => 'Sale: Phosphate Mix to Desert Bloom Co', 'amount' => 4500.00, 'date' => '2024-01-25'],
                        ['type' => 'expense', 'description' => 'Expense: Worker Salaries (Salaries)', 'amount' => 18000.00, 'date' => '2024-01-31'],
                        ['type' => 'sale', 'description' => 'Sale: Potassium Rich to Valley Farms Ltd', 'amount' => 4400.00, 'date' => '2024-02-05'],
                        ['type' => 'expense', 'description' => 'Expense: Equipment Maintenance (Maintenance)', 'amount' => 3500.00, 'date' => '2024-01-25']
                    ]
                ];
                
            case 'workers':
                return [
                    ['id' => 1, 'name' => 'Ahmed Hassan', 'role' => 'Production Manager', 'department' => 'Production', 'salary' => 45000, 'status' => 'active'],
                    ['id' => 2, 'name' => 'Fatima Ali', 'role' => 'Quality Controller', 'department' => 'Quality', 'salary' => 35000, 'status' => 'active'],
                    ['id' => 3, 'name' => 'Mohammed Ibrahim', 'role' => 'Machine Operator', 'department' => 'Production', 'salary' => 28000, 'status' => 'active'],
                    ['id' => 4, 'name' => 'Aisha Mahmoud', 'role' => 'Accountant', 'department' => 'Finance', 'salary' => 40000, 'status' => 'active'],
                    ['id' => 5, 'name' => 'Omar Khalil', 'role' => 'Warehouse Supervisor', 'department' => 'Storage', 'salary' => 32000, 'status' => 'active']
                ];
                
            case 'sales':
                return [
                    ['id' => 1, 'product_name' => 'NPK Fertilizer', 'client_name' => 'Green Valley Farm', 'quantity' => 50, 'total_amount' => 6000.00, 'sale_date' => '2024-01-15'],
                    ['id' => 2, 'product_name' => 'Organic Compost', 'client_name' => 'Sunrise Agriculture', 'quantity' => 25, 'total_amount' => 2000.00, 'sale_date' => '2024-01-20'],
                    ['id' => 3, 'product_name' => 'Phosphate Mix', 'client_name' => 'Desert Bloom Co', 'quantity' => 30, 'total_amount' => 4500.00, 'sale_date' => '2024-01-25'],
                    ['id' => 4, 'product_name' => 'All-Purpose Mix', 'client_name' => 'City Gardens', 'quantity' => 15, 'total_amount' => 1350.00, 'sale_date' => '2024-02-01'],
                    ['id' => 5, 'product_name' => 'Potassium Rich', 'client_name' => 'Valley Farms Ltd', 'quantity' => 40, 'total_amount' => 4400.00, 'sale_date' => '2024-02-05']
                ];
                
            case 'storage':
                return [
                    ['id' => 1, 'item_name' => 'Raw Phosphate Rock', 'quantity_in_tons' => 100.00, 'purchase_price_per_ton' => 45.00, 'dealer_name' => 'Al-Khobar Mining Co', 'purchase_date' => '2024-01-01'],
                    ['id' => 2, 'item_name' => 'Nitrogen Concentrate', 'quantity_in_tons' => 75.00, 'purchase_price_per_ton' => 80.00, 'dealer_name' => 'Petrochemical Industries', 'purchase_date' => '2024-01-10'],
                    ['id' => 3, 'item_name' => 'Potassium Chloride', 'quantity_in_tons' => 60.00, 'purchase_price_per_ton' => 65.00, 'dealer_name' => 'Jordan Potash Company', 'purchase_date' => '2024-01-15'],
                    ['id' => 4, 'item_name' => 'Organic Base Material', 'quantity_in_tons' => 120.00, 'purchase_price_per_ton' => 35.00, 'dealer_name' => 'Green Earth Suppliers', 'purchase_date' => '2024-01-20']
                ];
                
            case 'expenses':
                return [
                    ['id' => 1, 'name' => 'Electricity Bill', 'amount' => 2500.00, 'category' => 'Utilities', 'expense_date' => '2024-01-31'],
                    ['id' => 2, 'name' => 'Worker Salaries', 'amount' => 18000.00, 'category' => 'Salaries', 'expense_date' => '2024-01-31'],
                    ['id' => 3, 'name' => 'Equipment Maintenance', 'amount' => 3500.00, 'category' => 'Maintenance', 'expense_date' => '2024-01-25'],
                    ['id' => 4, 'name' => 'Raw Material Transport', 'amount' => 1200.00, 'category' => 'Transportation', 'expense_date' => '2024-01-20'],
                    ['id' => 5, 'name' => 'Safety Equipment', 'amount' => 800.00, 'category' => 'Other', 'expense_date' => '2024-01-15']
                ];
                
            case 'activity-logs':
                return [
                    ['id' => 1, 'title' => 'New Worker Added', 'description' => 'Added Mohammed Ibrahim as Machine Operator', 'log_date' => '2024-01-30 10:30:00'],
                    ['id' => 2, 'title' => 'Large Sale Completed', 'description' => 'Sold 50 tons NPK Fertilizer to Green Valley Farm', 'log_date' => '2024-01-15 14:20:00'],
                    ['id' => 3, 'title' => 'Storage Updated', 'description' => 'Received 100 tons Raw Phosphate Rock from supplier', 'log_date' => '2024-01-01 09:00:00'],
                    ['id' => 4, 'title' => 'Expense Recorded', 'description' => 'Monthly electricity bill payment processed', 'log_date' => '2024-01-31 16:45:00'],
                    ['id' => 5, 'title' => 'Quality Check', 'description' => 'Completed quality inspection of Batch #2024-001', 'log_date' => '2024-01-25 11:15:00']
                ];
                
            default:
                return [];
        }
    }
}
?>