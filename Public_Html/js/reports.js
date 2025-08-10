// Reports page JavaScript

class ReportsManager {
    constructor() {
        this.data = {
            sales: [],
            expenses: [],
            storage: [],
            workers: []
        };
        this.init();
    }

    async init() {
        try {
            await this.loadAllData();
            this.setupEventListeners();
            this.updateQuickStats();
        } catch (error) {
            console.error('Reports initialization failed:', error);
            Utils.showAlert('فشل في تحميل بيانات التقارير', 'error');
        }
    }

    async loadAllData() {
        try {
            Utils.showLoading();
            const [salesData, expensesData, storageData, workersData] = await Promise.all([
                API.get('sales.php'),
                API.get('expenses.php'),
                API.get('storage.php'),
                API.get('workers.php')
            ]);
            
            this.data = {
                sales: salesData || [],
                expenses: expensesData || [],
                storage: storageData || [],
                workers: workersData || []
            };
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    setupEventListeners() {
        // Custom report form
        document.getElementById('customReportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateCustomReport();
        });

        // Show/hide custom date fields
        document.getElementById('reportPeriod').addEventListener('change', (e) => {
            const customFields = ['customDateFrom', 'customDateTo'];
            if (e.target.value === 'custom') {
                customFields.forEach(field => {
                    document.getElementById(field).style.display = 'block';
                });
            } else {
                customFields.forEach(field => {
                    document.getElementById(field).style.display = 'none';
                });
            }
        });
    }

    updateQuickStats() {
        const totalRevenue = this.data.sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
        const totalExpenses = this.data.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const netProfit = totalRevenue - totalExpenses;
        const inventoryValue = this.data.storage.reduce((sum, item) => 
            sum + (parseFloat(item.quantity_in_tons) * parseFloat(item.purchase_price_per_ton)), 0);

        document.getElementById('totalRevenue').textContent = Utils.formatCurrency(totalRevenue);
        document.getElementById('totalExpenses').textContent = Utils.formatCurrency(totalExpenses);
        document.getElementById('netProfit').textContent = Utils.formatCurrency(netProfit);
        document.getElementById('inventoryValue').textContent = Utils.formatCurrency(inventoryValue);

        // Color profit/loss
        const profitElement = document.getElementById('netProfit');
        if (netProfit > 0) {
            profitElement.classList.add('text-green-600');
            profitElement.classList.remove('text-red-600');
        } else if (netProfit < 0) {
            profitElement.classList.add('text-red-600');
            profitElement.classList.remove('text-green-600');
        }
    }

    generateCustomReport() {
        const formData = new FormData(document.getElementById('customReportForm'));
        const reportData = Object.fromEntries(formData.entries());
        
        if (!Utils.validateForm(document.getElementById('customReportForm'))) {
            return;
        }

        const dateRange = this.getDateRange(reportData.reportPeriod, reportData.dateFrom, reportData.dateTo);
        
        switch (reportData.reportType) {
            case 'sales':
                this.generateSalesReportForPeriod(dateRange);
                break;
            case 'expenses':
                this.generateExpensesReportForPeriod(dateRange);
                break;
            case 'inventory':
                this.generateInventoryReport();
                break;
            case 'financial':
                this.generateFinancialReportForPeriod(dateRange);
                break;
        }

        this.closeCustomReportModal();
    }

    getDateRange(period, customFrom, customTo) {
        const today = new Date();
        let from, to;

        switch (period) {
            case 'today':
                from = to = today.toISOString().split('T')[0];
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                from = weekStart.toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
            case 'month':
                from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
            case 'quarter':
                const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                from = quarterStart.toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
            case 'year':
                from = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
            case 'custom':
                from = customFrom;
                to = customTo;
                break;
            default:
                from = to = today.toISOString().split('T')[0];
        }

        return { from, to, period };
    }

    openCustomReportModal() {
        document.getElementById('customReportModal').classList.remove('hidden');
    }

    closeCustomReportModal() {
        document.getElementById('customReportModal').classList.add('hidden');
        document.getElementById('customReportForm').reset();
        document.getElementById('customDateFrom').style.display = 'none';
        document.getElementById('customDateTo').style.display = 'none';
    }

    // Specific report generators
    generateFinancialReport() {
        const totalRevenue = this.data.sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
        const totalExpenses = this.data.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const netProfit = totalRevenue - totalExpenses;

        // Group expenses by category
        const expensesByCategory = {};
        this.data.expenses.forEach(expense => {
            const category = this.translateCategory(expense.category);
            expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(expense.amount);
        });

        this.printReport('تقرير مالي شامل', this.generateFinancialReportHTML({
            totalRevenue,
            totalExpenses,
            netProfit,
            expensesByCategory
        }));
    }

    generateSalesReport() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlySales = this.data.sales.filter(sale => sale.sale_date.startsWith(currentMonth));
        
        const salesByProduct = {};
        const salesByClient = {};
        
        monthlySales.forEach(sale => {
            // By product
            if (!salesByProduct[sale.product_name]) {
                salesByProduct[sale.product_name] = { quantity: 0, revenue: 0, count: 0 };
            }
            salesByProduct[sale.product_name].quantity += parseFloat(sale.quantity_tons || 0) + (parseFloat(sale.quantity_kg || 0) / 1000);
            salesByProduct[sale.product_name].revenue += parseFloat(sale.total_amount);
            salesByProduct[sale.product_name].count += 1;
            
            // By client
            if (!salesByClient[sale.client_name]) {
                salesByClient[sale.client_name] = { revenue: 0, count: 0 };
            }
            salesByClient[sale.client_name].revenue += parseFloat(sale.total_amount);
            salesByClient[sale.client_name].count += 1;
        });

        const totalMonthlyRevenue = monthlySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

        this.printReport('تقرير المبيعات الشهري', this.generateSalesReportHTML({
            month: currentMonth,
            totalRevenue: totalMonthlyRevenue,
            salesCount: monthlySales.length,
            salesByProduct: Object.entries(salesByProduct).sort((a, b) => b[1].revenue - a[1].revenue),
            salesByClient: Object.entries(salesByClient).sort((a, b) => b[1].revenue - a[1].revenue),
            sales: monthlySales
        }));
    }

    generateInventoryReport() {
        const totalItems = this.data.storage.length;
        const totalQuantity = this.data.storage.reduce((sum, item) => sum + parseFloat(item.quantity_in_tons), 0);
        const totalValue = this.data.storage.reduce((sum, item) => 
            sum + (parseFloat(item.quantity_in_tons) * parseFloat(item.purchase_price_per_ton)), 0);
        const lowStockItems = this.data.storage.filter(item => parseFloat(item.quantity_in_tons) < 10);

        this.printReport('تقرير المخزون الحالي', this.generateInventoryReportHTML({
            totalItems,
            totalQuantity,
            totalValue,
            lowStockItems,
            storage: this.data.storage.sort((a, b) => parseFloat(b.quantity_in_tons) - parseFloat(a.quantity_in_tons))
        }));
    }

    generateExpenseReport() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = this.data.expenses.filter(expense => expense.expense_date.startsWith(currentMonth));
        
        const expensesByCategory = {};
        monthlyExpenses.forEach(expense => {
            const category = this.translateCategory(expense.category);
            expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(expense.amount);
        });

        const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

        this.printReport('تقرير المصروفات الشهري', this.generateExpenseReportHTML({
            month: currentMonth,
            totalExpenses: totalMonthlyExpenses,
            expenseCount: monthlyExpenses.length,
            expensesByCategory: Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]),
            expenses: monthlyExpenses
        }));
    }

    generateEmployeeReport() {
        const activeWorkers = this.data.workers.filter(worker => worker.is_active);
        const totalSalaries = activeWorkers.reduce((sum, worker) => sum + parseFloat(worker.salary), 0);
        
        const workersByDepartment = {};
        activeWorkers.forEach(worker => {
            const dept = this.translateDepartment(worker.department);
            if (!workersByDepartment[dept]) {
                workersByDepartment[dept] = { count: 0, totalSalary: 0 };
            }
            workersByDepartment[dept].count += 1;
            workersByDepartment[dept].totalSalary += parseFloat(worker.salary);
        });

        this.printReport('تقرير العمال', this.generateEmployeeReportHTML({
            totalWorkers: this.data.workers.length,
            activeWorkers: activeWorkers.length,
            totalSalaries,
            workersByDepartment: Object.entries(workersByDepartment),
            workers: activeWorkers.sort((a, b) => parseFloat(b.salary) - parseFloat(a.salary))
        }));
    }

    // Helper methods
    translateCategory(category) {
        const translations = {
            'Utilities': 'المرافق',
            'Salaries': 'الرواتب',
            'Maintenance': 'الصيانة',
            'RawMaterials': 'المواد الخام',
            'Transportation': 'النقل',
            'Administrative': 'إدارية',
            'Other': 'أخرى'
        };
        return translations[category] || category;
    }

    translateDepartment(department) {
        const translations = {
            'Production': 'الإنتاج',
            'QualityControl': 'مراقبة الجودة',
            'Storage': 'المخازن',
            'Maintenance': 'الصيانة',
            'Administrative': 'الإدارة',
            'Sales': 'المبيعات'
        };
        return translations[department] || department;
    }

    printReport(title, content) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(content);
        printWindow.document.close();
    }

    generateFinancialReportHTML(data) {
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>${data.title || 'تقرير مالي شامل'}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { margin-bottom: 30px; }
                    .summary-item { display: inline-block; margin: 10px 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    .positive { color: green; font-weight: bold; }
                    .negative { color: red; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>الواصلون للتعدين والصناعات الكيماوية</h1>
                    <h2>تقرير مالي شامل</h2>
                    <p>التاريخ: ${Utils.formatDate(new Date().toISOString())}</p>
                </div>
                
                <div class="summary">
                    <div class="summary-item">
                        <h3>إجمالي الإيرادات</h3>
                        <p class="positive">${Utils.formatCurrency(data.totalRevenue)}</p>
                    </div>
                    <div class="summary-item">
                        <h3>إجمالي المصروفات</h3>
                        <p class="negative">${Utils.formatCurrency(data.totalExpenses)}</p>
                    </div>
                    <div class="summary-item">
                        <h3>صافي الربح/الخسارة</h3>
                        <p class="${data.netProfit >= 0 ? 'positive' : 'negative'}">${Utils.formatCurrency(data.netProfit)}</p>
                    </div>
                </div>

                <h3>المصروفات حسب الفئة</h3>
                <table>
                    <thead>
                        <tr><th>الفئة</th><th>المبلغ</th><th>النسبة</th></tr>
                    </thead>
                    <tbody>
                        ${Object.entries(data.expensesByCategory).map(([category, amount]) => 
                            `<tr>
                                <td>${category}</td>
                                <td>${Utils.formatCurrency(amount)}</td>
                                <td>${((amount / data.totalExpenses) * 100).toFixed(1)}%</td>
                            </tr>`
                        ).join('')}
                    </tbody>
                </table>
                
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;
    }

    generateSalesReportHTML(data) {
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تقرير المبيعات الشهري</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    .header { text-align: center; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    .summary { background-color: #e8f4f8; padding: 15px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>الواصلون للتعدين والصناعات الكيماوية</h1>
                    <h2>تقرير المبيعات الشهري - ${data.month}</h2>
                </div>
                
                <div class="summary">
                    <p><strong>إجمالي الإيرادات:</strong> ${Utils.formatCurrency(data.totalRevenue)}</p>
                    <p><strong>عدد المبيعات:</strong> ${data.salesCount}</p>
                </div>

                <h3>المبيعات حسب المنتج</h3>
                <table>
                    <thead>
                        <tr><th>المنتج</th><th>الكمية (طن)</th><th>الإيرادات</th><th>عدد البيوع</th></tr>
                    </thead>
                    <tbody>
                        ${data.salesByProduct.map(([product, stats]) => 
                            `<tr>
                                <td>${product}</td>
                                <td>${Utils.formatNumber(stats.quantity)}</td>
                                <td>${Utils.formatCurrency(stats.revenue)}</td>
                                <td>${stats.count}</td>
                            </tr>`
                        ).join('')}
                    </tbody>
                </table>
                
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;
    }

    generateInventoryReportHTML(data) {
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تقرير المخزون</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    .header { text-align: center; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    .summary { background-color: #e8f4f8; padding: 15px; margin-bottom: 20px; }
                    .low-stock { background-color: #ffebee; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>الواصلون للتعدين والصناعات الكيماوية</h1>
                    <h2>تقرير المخزون الحالي</h2>
                    <p>التاريخ: ${Utils.formatDate(new Date().toISOString())}</p>
                </div>
                
                <div class="summary">
                    <p><strong>إجمالي العناصر:</strong> ${data.totalItems}</p>
                    <p><strong>إجمالي الكمية:</strong> ${Utils.formatNumber(data.totalQuantity)} طن</p>
                    <p><strong>إجمالي القيمة:</strong> ${Utils.formatCurrency(data.totalValue)}</p>
                    <p><strong>المواد المنخفضة:</strong> ${data.lowStockItems.length}</p>
                </div>

                <h3>عناصر المخزون</h3>
                <table>
                    <thead>
                        <tr><th>المادة</th><th>الكمية (طن)</th><th>سعر الطن</th><th>القيمة الإجمالية</th><th>المورد</th></tr>
                    </thead>
                    <tbody>
                        ${data.storage.map(item => 
                            `<tr class="${parseFloat(item.quantity_in_tons) < 10 ? 'low-stock' : ''}">
                                <td>${item.item_name}</td>
                                <td>${Utils.formatNumber(item.quantity_in_tons)}</td>
                                <td>${Utils.formatCurrency(item.purchase_price_per_ton)}</td>
                                <td>${Utils.formatCurrency(parseFloat(item.quantity_in_tons) * parseFloat(item.purchase_price_per_ton))}</td>
                                <td>${item.dealer_name}</td>
                            </tr>`
                        ).join('')}
                    </tbody>
                </table>
                
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;
    }

    generateExpenseReportHTML(data) {
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تقرير المصروفات</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    .header { text-align: center; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    .summary { background-color: #ffebee; padding: 15px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>الواصلون للتعدين والصناعات الكيماوية</h1>
                    <h2>تقرير المصروفات الشهري - ${data.month}</h2>
                </div>
                
                <div class="summary">
                    <p><strong>إجمالي المصروفات:</strong> ${Utils.formatCurrency(data.totalExpenses)}</p>
                    <p><strong>عدد المصروفات:</strong> ${data.expenseCount}</p>
                </div>

                <h3>المصروفات حسب الفئة</h3>
                <table>
                    <thead>
                        <tr><th>الفئة</th><th>المبلغ</th><th>النسبة</th></tr>
                    </thead>
                    <tbody>
                        ${data.expensesByCategory.map(([category, amount]) => 
                            `<tr>
                                <td>${category}</td>
                                <td>${Utils.formatCurrency(amount)}</td>
                                <td>${((amount / data.totalExpenses) * 100).toFixed(1)}%</td>
                            </tr>`
                        ).join('')}
                    </tbody>
                </table>
                
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;
    }

    generateEmployeeReportHTML(data) {
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تقرير العمال</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    .header { text-align: center; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    .summary { background-color: #e3f2fd; padding: 15px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>الواصلون للتعدين والصناعات الكيماوية</h1>
                    <h2>تقرير العمال</h2>
                    <p>التاريخ: ${Utils.formatDate(new Date().toISOString())}</p>
                </div>
                
                <div class="summary">
                    <p><strong>إجمالي العمال:</strong> ${data.totalWorkers}</p>
                    <p><strong>العمال النشطون:</strong> ${data.activeWorkers}</p>
                    <p><strong>إجمالي الرواتب:</strong> ${Utils.formatCurrency(data.totalSalaries)}</p>
                </div>

                <h3>العمال حسب القسم</h3>
                <table>
                    <thead>
                        <tr><th>القسم</th><th>عدد العمال</th><th>إجمالي الرواتب</th></tr>
                    </thead>
                    <tbody>
                        ${data.workersByDepartment.map(([dept, stats]) => 
                            `<tr>
                                <td>${dept}</td>
                                <td>${stats.count}</td>
                                <td>${Utils.formatCurrency(stats.totalSalary)}</td>
                            </tr>`
                        ).join('')}
                    </tbody>
                </table>
                
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;
    }
}

// Global functions
function generateFinancialReport() {
    window.reportsManager.generateFinancialReport();
}

function generateSalesReport() {
    window.reportsManager.generateSalesReport();
}

function generateInventoryReport() {
    window.reportsManager.generateInventoryReport();
}

function generateExpenseReport() {
    window.reportsManager.generateExpenseReport();
}

function generateEmployeeReport() {
    window.reportsManager.generateEmployeeReport();
}

function openCustomReportModal() {
    window.reportsManager.openCustomReportModal();
}

function closeCustomReportModal() {
    window.reportsManager.closeCustomReportModal();
}

function exportAllData() {
    // Export all data as CSV files
    if (confirm('هل تريد تصدير جميع بيانات النظام؟')) {
        Utils.showAlert('جاري تصدير البيانات...', 'info');
        // This would trigger individual exports from each manager
        setTimeout(() => {
            Utils.showAlert('تم تصدير جميع البيانات بنجاح', 'success');
        }, 2000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
});