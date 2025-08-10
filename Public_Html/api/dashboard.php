<?php
require_once 'config.php';

try {
    // Get dashboard statistics
    $dashboard = getDashboardStats();
    jsonResponse($dashboard);
} catch (Exception $e) {
    error_log("Dashboard API error: " . $e->getMessage());
    jsonResponse(['error' => 'Failed to load dashboard data'], 500);
}

function getDashboardStats() {
    $db = Database::getInstance();
    
    // Calculate total income from sales
    $totalIncomeQuery = "SELECT COALESCE(SUM(total_amount), 0) as total FROM sales";
    $totalIncome = $db->fetch($totalIncomeQuery)['total'] ?? 0;
    
    // Calculate total expenses
    $totalExpensesQuery = "SELECT COALESCE(SUM(amount), 0) as total FROM expenses";
    $totalExpenses = $db->fetch($totalExpensesQuery)['total'] ?? 0;
    
    // Calculate profit
    $profit = $totalIncome - $totalExpenses;
    
    // Count storage items
    $storageCountQuery = "SELECT COUNT(*) as count FROM storage_items";
    $storageCount = $db->fetch($storageCountQuery)['count'] ?? 0;
    
    // Get recent sales (last 5)
    $recentSalesQuery = "SELECT * FROM sales ORDER BY sale_date DESC, created_at DESC LIMIT 5";
    $recentSales = $db->fetchAll($recentSalesQuery);
    
    // Get top selling products
    $topProductsQuery = "
        SELECT 
            product_name,
            SUM(quantity_tons + (quantity_kg / 1000)) as total_sold,
            SUM(total_amount) as total_revenue,
            COUNT(*) as sales_count
        FROM sales 
        GROUP BY product_name 
        ORDER BY total_revenue DESC 
        LIMIT 5
    ";
    $topProducts = $db->fetchAll($topProductsQuery);
    
    // Get recent activity
    $recentActivity = [];
    
    // Add recent sales to activity
    foreach ($recentSales as $sale) {
        $recentActivity[] = [
            'type' => 'sale',
            'description' => "تم بيع {$sale['product_name']} للعميل {$sale['client_name']}",
            'date' => $sale['sale_date']
        ];
    }
    
    // Add recent expenses to activity
    $recentExpensesQuery = "SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC LIMIT 3";
    $recentExpenses = $db->fetchAll($recentExpensesQuery);
    
    foreach ($recentExpenses as $expense) {
        $recentActivity[] = [
            'type' => 'expense',
            'description' => "تم إضافة مصروف: {$expense['name']}",
            'date' => $expense['expense_date']
        ];
    }
    
    // Sort recent activity by date
    usort($recentActivity, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });
    
    // Limit to 10 activities
    $recentActivity = array_slice($recentActivity, 0, 10);
    
    return [
        'totalIncome' => (float)$totalIncome,
        'totalExpenses' => (float)$totalExpenses,
        'profit' => (float)$profit,
        'storageItems' => (int)$storageCount,
        'recentSales' => $recentSales,
        'topProducts' => $topProducts,
        'recentActivity' => $recentActivity
    ];
}
?>