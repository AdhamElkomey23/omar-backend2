// Expenses page JavaScript

class ExpensesManager {
    constructor() {
        this.expenses = [];
        this.filteredExpenses = [];
        this.currentExpense = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderExpenses();
            this.updateStatistics();
        } catch (error) {
            console.error('Expenses initialization failed:', error);
            Utils.showAlert('فشل في تحميل بيانات المصروفات', 'error');
        }
    }

    async loadData() {
        try {
            this.expenses = await API.get('expenses.php') || [];
            this.filteredExpenses = [...this.expenses];
        } catch (error) {
            console.error('Failed to load expenses data:', error);
            this.expenses = [];
            this.filteredExpenses = [];
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });

        // Filters
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateFromFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateToFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', Utils.debounce(() => this.applyFilters(), 300));

        // Set current date as default expense date
        document.getElementById('expenseDate').value = Utils.getCurrentDate();
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const dateFrom = document.getElementById('dateFromFilter').value;
        const dateTo = document.getElementById('dateToFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredExpenses = this.expenses.filter(expense => {
            const matchesCategory = !categoryFilter || expense.category === categoryFilter;
            const matchesDateFrom = !dateFrom || new Date(expense.expense_date) >= new Date(dateFrom);
            const matchesDateTo = !dateTo || new Date(expense.expense_date) <= new Date(dateTo);
            const matchesSearch = !searchTerm || 
                expense.name.toLowerCase().includes(searchTerm) ||
                (expense.description && expense.description.toLowerCase().includes(searchTerm)) ||
                (expense.vendor && expense.vendor.toLowerCase().includes(searchTerm));

            return matchesCategory && matchesDateFrom && matchesDateTo && matchesSearch;
        });

        this.renderExpenses();
    }

    renderExpenses() {
        const tbody = document.getElementById('expensesTableBody');
        
        if (this.filteredExpenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-gray-500">
                            <i class="fas fa-receipt text-4xl mb-2"></i>
                            <p>لا توجد مصروفات مسجلة</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const expensesHTML = this.filteredExpenses.map((expense, index) => `
            <tr>
                <td class="font-medium">${index + 1}</td>
                <td class="font-medium">${expense.name}</td>
                <td class="font-semibold text-red-600">${Utils.formatCurrency(expense.amount)}</td>
                <td>
                    <span class="badge badge-${this.getCategoryColor(expense.category)}">${this.translateCategory(expense.category)}</span>
                </td>
                <td>${Utils.formatDate(expense.expense_date)}</td>
                <td>
                    ${expense.description ? 
                        `<span class="text-sm text-gray-600" title="${expense.description}">
                            ${expense.description.length > 50 ? expense.description.substring(0, 50) + '...' : expense.description}
                        </span>` 
                        : '<span class="text-gray-400">-</span>'
                    }
                </td>
                <td>
                    <div class="flex items-center space-x-reverse space-x-2">
                        <button onclick="expensesManager.editExpense(${expense.id})" class="text-blue-600 hover:text-blue-700" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="expensesManager.deleteExpense(${expense.id})" class="text-red-600 hover:text-red-700 delete-btn" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = expensesHTML;
    }

    updateStatistics() {
        const totalExpenses = this.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        
        // Calculate monthly expenses (current month)
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const monthlyExpenses = this.expenses
            .filter(expense => expense.expense_date.startsWith(currentMonth))
            .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        
        // Calculate daily average (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentExpenses = this.expenses
            .filter(expense => new Date(expense.expense_date) >= thirtyDaysAgo)
            .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const dailyAverage = recentExpenses / 30;
        
        // Count unique categories
        const categories = new Set(this.expenses.map(expense => expense.category)).size;

        document.getElementById('totalExpenses').textContent = Utils.formatCurrency(totalExpenses);
        document.getElementById('monthlyExpenses').textContent = Utils.formatCurrency(monthlyExpenses);
        document.getElementById('dailyAverage').textContent = Utils.formatCurrency(dailyAverage);
        document.getElementById('categoryCount').textContent = Utils.formatNumber(categories);
    }

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

    getCategoryColor(category) {
        const colors = {
            'Utilities': 'info',
            'Salaries': 'success',
            'Maintenance': 'warning',
            'RawMaterials': 'info',
            'Transportation': 'gray',
            'Administrative': 'gray',
            'Other': 'gray'
        };
        return colors[category] || 'gray';
    }

    async handleExpenseSubmit() {
        const formData = new FormData(document.getElementById('expenseForm'));
        const expenseData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!Utils.validateForm(document.getElementById('expenseForm'))) {
            return;
        }
        
        // Convert numeric fields
        expenseData.amount = parseFloat(expenseData.amount) || 0;

        try {
            Utils.showLoading();
            
            if (expenseData.id) {
                // Update existing expense
                await API.put(`expenses.php?id=${expenseData.id}`, expenseData);
                Utils.showAlert('تم تحديث المصروف بنجاح', 'success');
            } else {
                // Create new expense
                await API.post('expenses.php', expenseData);
                Utils.showAlert('تم إضافة المصروف بنجاح', 'success');
            }
            
            // Refresh data
            await this.loadData();
            this.renderExpenses();
            this.updateStatistics();
            this.closeExpenseModal();
            
        } catch (error) {
            console.error('Expense submission failed:', error);
            Utils.showAlert('فشل في حفظ المصروف. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    openAddExpenseModal() {
        this.currentExpense = null;
        document.getElementById('expenseModalTitle').textContent = 'إضافة مصروف جديد';
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseId').value = '';
        document.getElementById('expenseDate').value = Utils.getCurrentDate();
        document.getElementById('expenseModal').classList.remove('hidden');
    }

    editExpense(expenseId) {
        const expense = this.expenses.find(e => e.id === expenseId);
        if (!expense) return;
        
        this.currentExpense = expense;
        document.getElementById('expenseModalTitle').textContent = 'تعديل المصروف';
        
        // Fill form
        document.getElementById('expenseId').value = expense.id;
        document.getElementById('expenseName').value = expense.name;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('expenseDate').value = expense.expense_date;
        document.getElementById('description').value = expense.description || '';
        document.getElementById('receiptNumber').value = expense.receipt_number || '';
        document.getElementById('vendor').value = expense.vendor || '';
        
        document.getElementById('expenseModal').classList.remove('hidden');
    }

    closeExpenseModal() {
        document.getElementById('expenseModal').classList.add('hidden');
        this.currentExpense = null;
    }

    async deleteExpense(expenseId) {
        const expense = this.expenses.find(e => e.id === expenseId);
        if (!expense) return;
        
        if (!confirm(`هل أنت متأكد من حذف المصروف "${expense.name}"؟`)) {
            return;
        }
        
        try {
            Utils.showLoading();
            await API.delete(`expenses.php?id=${expenseId}`);
            Utils.showAlert('تم حذف المصروف بنجاح', 'success');
            
            // Refresh data
            await this.loadData();
            this.renderExpenses();
            this.updateStatistics();
            
        } catch (error) {
            console.error('Delete expense failed:', error);
            Utils.showAlert('فشل في حذف المصروف. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    // Export expenses data
    exportData() {
        if (this.expenses.length === 0) {
            Utils.showAlert('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        const headers = ['اسم المصروف', 'المبلغ', 'الفئة', 'تاريخ المصروف', 'الوصف', 'رقم الإيصال', 'المورد'];
        const csvData = [
            headers,
            ...this.expenses.map(expense => [
                expense.name,
                expense.amount,
                this.translateCategory(expense.category),
                expense.expense_date,
                expense.description || '',
                expense.receipt_number || '',
                expense.vendor || ''
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `expenses-${Utils.getCurrentDate()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Utils.showAlert('تم تصدير البيانات بنجاح', 'success');
    }

    // Generate expense report by category
    generateCategoryReport() {
        if (this.expenses.length === 0) {
            Utils.showAlert('لا توجد بيانات لإنشاء التقرير', 'warning');
            return;
        }

        const categoryTotals = {};
        this.expenses.forEach(expense => {
            const category = this.translateCategory(expense.category);
            categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
        });

        const reportHTML = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تقرير المصروفات حسب الفئة</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    .header { text-align: center; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; background-color: #e8f4f8; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>الواصلون للتعدين والصناعات الكيماوية</h1>
                    <h2>تقرير المصروفات حسب الفئة</h2>
                    <p>التاريخ: ${Utils.formatDate(new Date().toISOString())}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>الفئة</th>
                            <th>إجمالي المصروف</th>
                            <th>النسبة المئوية</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(categoryTotals).map(([category, total]) => {
                            const totalExpenses = this.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
                            const percentage = ((total / totalExpenses) * 100).toFixed(1);
                            return `
                                <tr>
                                    <td>${category}</td>
                                    <td>${Utils.formatCurrency(total)}</td>
                                    <td>${percentage}%</td>
                                </tr>
                            `;
                        }).join('')}
                        <tr class="total">
                            <td>المجموع الكلي</td>
                            <td>${Utils.formatCurrency(Object.values(categoryTotals).reduce((sum, val) => sum + val, 0))}</td>
                            <td>100%</td>
                        </tr>
                    </tbody>
                </table>
                
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(reportHTML);
        printWindow.document.close();
    }
}

// Global functions for modal
function openAddExpenseModal() {
    window.expensesManager.openAddExpenseModal();
}

function closeExpenseModal() {
    window.expensesManager.closeExpenseModal();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.expensesManager = new ExpensesManager();
});