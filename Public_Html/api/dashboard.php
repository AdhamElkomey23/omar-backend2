<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

// Try to get database connection, fall back to mock data if fails
$db = DatabaseConfig::getConnection();

try {
    if ($db === null) {
        // Use mock data when database is not available
        $mockData = DatabaseConfig::getMockData('dashboard');
        echo json_encode($mockData);
        exit();
    }
    
    // Get total income from sales
    $salesQuery = "SELECT COALESCE(SUM(total_amount), 0) as total_income FROM sales";
    $salesStmt = $db->prepare($salesQuery);
    $salesStmt->execute();
    $totalIncome = $salesStmt->fetch(PDO::FETCH_ASSOC)['total_income'];
    
    // Get total expenses
    $expensesQuery = "SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses";
    $expensesStmt = $db->prepare($expensesQuery);
    $expensesStmt->execute();
    $totalExpenses = $expensesStmt->fetch(PDO::FETCH_ASSOC)['total_expenses'];
    
    // Get recent sales (last 5)
    $recentSalesQuery = "SELECT * FROM sales ORDER BY created_at DESC LIMIT 5";
    $recentSalesStmt = $db->prepare($recentSalesQuery);
    $recentSalesStmt->execute();
    $recentSales = $recentSalesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get recent expenses (last 5)
    $recentExpensesQuery = "SELECT * FROM expenses ORDER BY created_at DESC LIMIT 5";
    $recentExpensesStmt = $db->prepare($recentExpensesQuery);
    $recentExpensesStmt->execute();
    $recentExpenses = $recentExpensesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total workers count
    $workersQuery = "SELECT COUNT(*) as total_workers FROM workers WHERE status = 'active'";
    $workersStmt = $db->prepare($workersQuery);
    $workersStmt->execute();
    $totalWorkers = $workersStmt->fetch(PDO::FETCH_ASSOC)['total_workers'];
    
    // Get monthly sales trend (last 6 months) - simplified for PostgreSQL
    $monthlySalesQuery = "SELECT 
        TO_CHAR(sale_date, 'YYYY-MM') as month,
        SUM(total_amount) as total
        FROM sales 
        WHERE sale_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
        ORDER BY month";
    $monthlySalesStmt = $db->prepare($monthlySalesQuery);
    $monthlySalesStmt->execute();
    $monthlySales = $monthlySalesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format recent sales for frontend (convert to camelCase)
    $formattedRecentSales = array_map(function($sale) {
        return [
            'id' => (int)$sale['id'],
            'customerName' => $sale['customer_name'] ?? $sale['client_name'] ?? '',
            'product' => $sale['product'] ?? $sale['product_name'] ?? '',
            'quantity' => (float)$sale['quantity'],
            'unitPrice' => (float)($sale['unit_price'] ?? ($sale['total_amount'] / $sale['quantity'])),
            'totalAmount' => (float)$sale['total_amount'],
            'saleDate' => $sale['sale_date'],
            'notes' => $sale['notes'] ?? '',
            'createdAt' => $sale['created_at']
        ];
    }, $recentSales);
    
    // Format recent expenses for frontend (convert to camelCase)
    $formattedRecentExpenses = array_map(function($expense) {
        return [
            'id' => (int)$expense['id'],
            'description' => $expense['description'] ?? $expense['name'] ?? '',
            'category' => $expense['category'],
            'amount' => (float)$expense['amount'],
            'expenseDate' => $expense['expense_date'],
            'notes' => $expense['notes'] ?? '',
            'createdAt' => $expense['created_at']
        ];
    }, $recentExpenses);
    
    // Format monthly sales for chart
    $formattedMonthlySales = array_map(function($item) {
        return [
            'month' => $item['month'],
            'sales' => (float)$item['total']
        ];
    }, $monthlySales);
    
    // Combine recent transactions for activity feed
    $recentTransactions = [];
    foreach ($formattedRecentSales as $sale) {
        $recentTransactions[] = [
            'type' => 'sale',
            'description' => "Sale: {$sale['product']} to {$sale['customerName']}",
            'amount' => $sale['totalAmount'],
            'date' => $sale['saleDate']
        ];
    }
    foreach ($formattedRecentExpenses as $expense) {
        $recentTransactions[] = [
            'type' => 'expense',
            'description' => "Expense: {$expense['description']} ({$expense['category']})",
            'amount' => $expense['amount'],
            'date' => $expense['expenseDate']
        ];
    }
    
    // Sort by date descending
    usort($recentTransactions, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });
    
    $response = [
        'totalIncome' => (float)$totalIncome,
        'totalExpenses' => (float)$totalExpenses,
        'netProfit' => (float)($totalIncome - $totalExpenses),
        'totalWorkers' => (int)($totalWorkers ?? 0),
        'recentSales' => $formattedRecentSales,
        'recentExpenses' => $formattedRecentExpenses,
        'recentTransactions' => array_slice($recentTransactions, 0, 10),
        'monthlySales' => $formattedMonthlySales
    ];
    
    echo json_encode($response);
    
} catch(Exception $e) {
    error_log("Dashboard API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error occurred']);
}
?>