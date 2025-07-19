
// Client-side storage manager for Hostinger deployment
class LocalStorageManager {
    constructor() {
        this.keys = {
            workers: 'alwasiloon_workers',
            sales: 'alwasiloon_sales',
            expenses: 'alwasiloon_expenses',
            storage: 'alwasiloon_storage',
            attendance: 'alwasiloon_attendance'
        };
        this.initializeData();
    }
    
    initializeData() {
        // Initialize with sample data if empty
        if (!this.getData('storage').length) {
            this.setData('storage', [
                {
                    id: 1,
                    itemName: "الجبس",
                    quantityInTons: 150,
                    purchasePricePerTon: 120,
                    dealerName: "شركة المعادن المتقدمة",
                    dealerContact: "01234567890",
                    purchaseDate: "2024-01-15"
                },
                {
                    id: 2,
                    itemName: "الفلسبار",
                    quantityInTons: 200,
                    purchasePricePerTon: 180,
                    dealerName: "مؤسسة الصخور المعدنية",
                    dealerContact: "01987654321",
                    purchaseDate: "2024-01-20"
                }
            ]);
        }
        
        if (!this.getData('sales').length) {
            this.setData('sales', [
                {
                    id: 1,
                    productName: "نترات الأمونيوم",
                    quantity: 500,
                    unitPrice: 180,
                    totalPrice: 90000,
                    customerName: "شركة الحقول الخضراء",
                    date: "2024-01-10",
                    status: "completed"
                },
                {
                    id: 2,
                    productName: "سوبر فوسفات",
                    quantity: 300,
                    unitPrice: 200,
                    totalPrice: 60000,
                    customerName: "مؤسسة الزراعة المتقدمة",
                    date: "2024-01-15",
                    status: "completed"
                }
            ]);
        }
        
        if (!this.getData('expenses').length) {
            this.setData('expenses', [
                {
                    id: 1,
                    name: "فاتورة الكهرباء",
                    amount: 15000,
                    category: "utilities",
                    date: "2024-01-01"
                },
                {
                    id: 2,
                    name: "صيانة المعدات",
                    amount: 8000,
                    category: "maintenance",
                    date: "2024-01-05"
                },
                {
                    id: 3,
                    name: "رواتب الموظفين",
                    amount: 45000,
                    category: "salaries",
                    date: "2024-01-01"
                }
            ]);
        }
        
        if (!this.getData('workers').length) {
            this.setData('workers', [
                {
                    id: 1,
                    name: "أدهم وائل",
                    position: "مدير",
                    salary: 25000,
                    phone: "01234567890",
                    email: "adham@alwasiloon.com",
                    address: "القاهرة، مصر",
                    hireDate: "2023-01-01",
                    salaryDeductions: []
                },
                {
                    id: 2,
                    name: "محمد أحمد",
                    position: "مشغل آلات",
                    salary: 18000,
                    phone: "01987654321",
                    email: "mohamed@alwasiloon.com",
                    address: "الجيزة، مصر",
                    hireDate: "2023-02-15",
                    salaryDeductions: []
                }
            ]);
        }
    }
    
    getData(type) {
        try {
            const data = localStorage.getItem(this.keys[type]);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error getting data:', e);
            return [];
        }
    }
    
    setData(type, data) {
        try {
            localStorage.setItem(this.keys[type], JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error setting data:', e);
            return false;
        }
    }
    
    addItem(type, item) {
        const data = this.getData(type);
        const newItem = { ...item, id: Date.now() };
        data.push(newItem);
        this.setData(type, data);
        return newItem;
    }
    
    updateItem(type, id, updatedItem) {
        const data = this.getData(type);
        const index = data.findIndex(item => item.id == id);
        if (index !== -1) {
            data[index] = { ...updatedItem, id };
            this.setData(type, data);
            return data[index];
        }
        return null;
    }
    
    deleteItem(type, id) {
        const data = this.getData(type);
        const filtered = data.filter(item => item.id != id);
        this.setData(type, filtered);
        return true;
    }
    
    // Dashboard summary calculations
    getDashboardSummary() {
        const sales = this.getData('sales');
        const expenses = this.getData('expenses');
        
        const totalIncome = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const netProfit = totalIncome - totalExpenses;
        const salesCount = sales.length;
        
        return {
            totalIncome,
            totalExpenses,
            netProfit,
            salesCount
        };
    }
}

// Global storage instance
window.localStorageManager = new LocalStorageManager();

// Mock fetch function to intercept API calls
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    const method = options.method || 'GET';
    
    // Dashboard API
    if (url === '/api/dashboard') {
        const summary = window.localStorageManager.getDashboardSummary();
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(summary)
        });
    }
    
    // Storage API
    if (url === '/api/storage') {
        if (method === 'GET') {
            const data = window.localStorageManager.getData('storage');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('storage', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
    }
    
    if (url.startsWith('/api/storage/')) {
        const id = url.split('/').pop();
        if (method === 'PUT') {
            const body = JSON.parse(options.body);
            const updatedItem = window.localStorageManager.updateItem('storage', id, body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedItem)
            });
        }
        if (method === 'DELETE') {
            window.localStorageManager.deleteItem('storage', id);
            return Promise.resolve({ ok: true });
        }
    }
    
    // Workers API
    if (url === '/api/workers') {
        if (method === 'GET') {
            const data = window.localStorageManager.getData('workers');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('workers', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
    }
    
    // Worker salary deductions API
    if (url.startsWith('/api/workers/') && url.includes('/salary-deductions')) {
        const parts = url.split('/');
        const workerId = parts[3];
        
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const workers = window.localStorageManager.getData('workers');
            const workerIndex = workers.findIndex(w => w.id == workerId);
            
            if (workerIndex !== -1) {
                if (!workers[workerIndex].salaryDeductions) {
                    workers[workerIndex].salaryDeductions = [];
                }
                const newDeduction = { ...body, id: Date.now() };
                workers[workerIndex].salaryDeductions.push(newDeduction);
                window.localStorageManager.setData('workers', workers);
                
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(newDeduction)
                });
            }
        }
        
        if (method === 'GET') {
            const workers = window.localStorageManager.getData('workers');
            const worker = workers.find(w => w.id == workerId);
            const deductions = worker ? (worker.salaryDeductions || []) : [];
            
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(deductions)
            });
        }
    }
    
    if (url.startsWith('/api/workers/')) {
        const id = url.split('/').pop();
        if (method === 'PUT') {
            const body = JSON.parse(options.body);
            const updatedItem = window.localStorageManager.updateItem('workers', id, body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedItem)
            });
        }
        if (method === 'DELETE') {
            window.localStorageManager.deleteItem('workers', id);
            return Promise.resolve({ ok: true });
        }
    }
    
    // Sales API
    if (url === '/api/sales') {
        if (method === 'GET') {
            const data = window.localStorageManager.getData('sales');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('sales', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
    }
    
    if (url.startsWith('/api/sales/')) {
        const id = url.split('/').pop();
        if (method === 'PUT') {
            const body = JSON.parse(options.body);
            const updatedItem = window.localStorageManager.updateItem('sales', id, body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedItem)
            });
        }
        if (method === 'DELETE') {
            window.localStorageManager.deleteItem('sales', id);
            return Promise.resolve({ ok: true });
        }
    }
    
    // Expenses API
    if (url === '/api/expenses') {
        if (method === 'GET') {
            const data = window.localStorageManager.getData('expenses');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('expenses', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
    }
    
    if (url.startsWith('/api/expenses/')) {
        const id = url.split('/').pop();
        if (method === 'PUT') {
            const body = JSON.parse(options.body);
            const updatedItem = window.localStorageManager.updateItem('expenses', id, body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedItem)
            });
        }
        if (method === 'DELETE') {
            window.localStorageManager.deleteItem('expenses', id);
            return Promise.resolve({ ok: true });
        }
    }
    
    // Attendance API
    if (url.startsWith('/api/attendance')) {
        if (url.includes('/date')) {
            const data = window.localStorageManager.getData('attendance');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('attendance', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
        
        const data = window.localStorageManager.getData('attendance');
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(data)
        });
    }
    
    // Reports API
    if (url === '/api/reports/monthly-summary') {
        const sales = window.localStorageManager.getData('sales');
        const expenses = window.localStorageManager.getData('expenses');
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlySales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        });
        
        const monthlyExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
        
        const summary = {
            totalSales: monthlySales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0),
            totalExpenses: monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
            salesCount: monthlySales.length,
            expensesCount: monthlyExpenses.length
        };
        
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(summary)
        });
    }
    
    // Fall back to original fetch for other requests
    return originalFetch.apply(this, arguments);
};

console.log('Client-side storage manager loaded successfully!');
