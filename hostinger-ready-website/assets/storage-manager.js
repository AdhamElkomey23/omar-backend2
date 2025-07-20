// Storage Manager for Al-Wasiloon Factory Management
// Handles all data persistence using localStorage

class StorageManager {
    constructor() {
        this.initializeData();
    }

    // Initialize default data if not exists
    initializeData() {
        if (!this.getData('products')) {
            this.setData('products', [
                {
                    id: 1,
                    name: "سماد NPK",
                    unitPrice: 2500,
                    stockQuantity: 150,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "يوريا",
                    unitPrice: 1800,
                    stockQuantity: 200,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: "سوبر فوسفات",
                    unitPrice: 2200,
                    stockQuantity: 100,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    name: "كبريتات الأمونيوم",
                    unitPrice: 1600,
                    stockQuantity: 75,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 5,
                    name: "سماد مركب 20-20-20",
                    unitPrice: 3000,
                    stockQuantity: 80,
                    createdAt: new Date().toISOString()
                }
            ]);
        }

        if (!this.getData('sales')) {
            this.setData('sales', [
                {
                    id: 1,
                    productName: "سماد NPK",
                    quantity: 50,
                    totalAmount: 125000,
                    saleDate: "2025-07-15",
                    clientName: "مزرعة الخير",
                    clientContact: "0123456789",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    productName: "يوريا",
                    quantity: 100,
                    totalAmount: 180000,
                    saleDate: "2025-07-18",
                    clientName: "الشركة الزراعية المتقدمة",
                    clientContact: "0198765432",
                    createdAt: new Date().toISOString()
                }
            ]);
        }

        if (!this.getData('expenses')) {
            this.setData('expenses', [
                {
                    id: 1,
                    name: "فاتورة الكهرباء",
                    amount: 15000,
                    category: "Utilities",
                    expenseDate: "2025-07-10",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "رواتب العمال - شهر يوليو",
                    amount: 80000,
                    category: "Salaries",
                    expenseDate: "2025-07-01",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: "صيانة المعدات",
                    amount: 25000,
                    category: "Maintenance",
                    expenseDate: "2025-07-12",
                    createdAt: new Date().toISOString()
                }
            ]);
        }

        if (!this.getData('workers')) {
            this.setData('workers', [
                {
                    id: 1,
                    name: "أحمد محمد",
                    role: "مشرف الإنتاج",
                    department: "الإنتاج",
                    salary: 12000,
                    hireDate: "2024-01-15",
                    email: "ahmed@alwasiloon.com",
                    phone: "0123456789",
                    status: "active",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "فاطمة علي",
                    role: "مديرة المبيعات",
                    department: "المبيعات",
                    salary: 15000,
                    hireDate: "2023-08-20",
                    email: "fatima@alwasiloon.com",
                    phone: "0198765432",
                    status: "active",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: "محمود حسن",
                    role: "عامل مخزن",
                    department: "المخزون",
                    salary: 8000,
                    hireDate: "2024-03-10",
                    email: "mahmoud@alwasiloon.com",
                    phone: "0111223344",
                    status: "active",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    name: "سارة إبراهيم",
                    role: "محاسبة",
                    department: "المالية",
                    salary: 10000,
                    hireDate: "2023-12-01",
                    email: "sara@alwasiloon.com",
                    phone: "0555666777",
                    status: "active",
                    createdAt: new Date().toISOString()
                }
            ]);
        }

        if (!this.getData('attendance')) {
            this.setData('attendance', []);
        }

        if (!this.getData('activities')) {
            this.setData('activities', [
                {
                    id: 1,
                    title: "بيع جديد",
                    description: "تم بيع 50 كيس من سماد NPK لمزرعة الخير",
                    logDate: new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "إضافة عامل جديد",
                    description: "تم إضافة محمود حسن كعامل مخزن",
                    logDate: new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString()
                }
            ]);
        }

        // Initialize counters if they don't exist
        if (!this.getData('counters')) {
            this.setData('counters', {
                products: 5,
                sales: 2,
                expenses: 3,
                workers: 4,
                activities: 2,
                attendance: 0
            });
        }
    }

    // Generic data operations
    getData(key) {
        try {
            const data = localStorage.getItem(`alwasiloon_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    }

    setData(key, data) {
        try {
            localStorage.setItem(`alwasiloon_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error setting data:', error);
            return false;
        }
    }

    // Get next ID for a table
    getNextId(table) {
        const counters = this.getData('counters') || {};
        counters[table] = (counters[table] || 0) + 1;
        this.setData('counters', counters);
        return counters[table];
    }

    // Products operations
    getAllProducts() {
        return this.getData('products') || [];
    }

    getProduct(id) {
        const products = this.getAllProducts();
        return products.find(p => p.id === parseInt(id));
    }

    createProduct(productData) {
        const products = this.getAllProducts();
        const newProduct = {
            id: this.getNextId('products'),
            ...productData,
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
        this.setData('products', products);
        return newProduct;
    }

    updateProduct(id, updateData) {
        const products = this.getAllProducts();
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = { ...products[index], ...updateData };
            this.setData('products', products);
            return products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const products = this.getAllProducts();
        const filteredProducts = products.filter(p => p.id !== parseInt(id));
        this.setData('products', filteredProducts);
        return filteredProducts.length !== products.length;
    }

    // Sales operations
    getAllSales() {
        return this.getData('sales') || [];
    }

    getSale(id) {
        const sales = this.getAllSales();
        return sales.find(s => s.id === parseInt(id));
    }

    createSale(saleData) {
        const sales = this.getAllSales();
        const newSale = {
            id: this.getNextId('sales'),
            ...saleData,
            createdAt: new Date().toISOString()
        };
        sales.push(newSale);
        this.setData('sales', sales);
        
        // Add activity log
        this.addActivity(`بيع جديد`, `تم بيع ${saleData.quantity} من ${saleData.productName} للعميل ${saleData.clientName}`);
        
        return newSale;
    }

    updateSale(id, updateData) {
        const sales = this.getAllSales();
        const index = sales.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            sales[index] = { ...sales[index], ...updateData };
            this.setData('sales', sales);
            return sales[index];
        }
        return null;
    }

    deleteSale(id) {
        const sales = this.getAllSales();
        const filteredSales = sales.filter(s => s.id !== parseInt(id));
        this.setData('sales', filteredSales);
        return filteredSales.length !== sales.length;
    }

    // Expenses operations
    getAllExpenses() {
        return this.getData('expenses') || [];
    }

    getExpense(id) {
        const expenses = this.getAllExpenses();
        return expenses.find(e => e.id === parseInt(id));
    }

    createExpense(expenseData) {
        const expenses = this.getAllExpenses();
        const newExpense = {
            id: this.getNextId('expenses'),
            ...expenseData,
            createdAt: new Date().toISOString()
        };
        expenses.push(newExpense);
        this.setData('expenses', expenses);
        
        // Add activity log
        this.addActivity(`مصروف جديد`, `تم إضافة مصروف: ${expenseData.name} بقيمة ${expenseData.amount} ريال`);
        
        return newExpense;
    }

    updateExpense(id, updateData) {
        const expenses = this.getAllExpenses();
        const index = expenses.findIndex(e => e.id === parseInt(id));
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updateData };
            this.setData('expenses', expenses);
            return expenses[index];
        }
        return null;
    }

    deleteExpense(id) {
        const expenses = this.getAllExpenses();
        const filteredExpenses = expenses.filter(e => e.id !== parseInt(id));
        this.setData('expenses', filteredExpenses);
        return filteredExpenses.length !== expenses.length;
    }

    // Workers operations
    getAllWorkers() {
        return this.getData('workers') || [];
    }

    getWorker(id) {
        const workers = this.getAllWorkers();
        return workers.find(w => w.id === parseInt(id));
    }

    createWorker(workerData) {
        const workers = this.getAllWorkers();
        const newWorker = {
            id: this.getNextId('workers'),
            ...workerData,
            status: workerData.status || 'active',
            createdAt: new Date().toISOString()
        };
        workers.push(newWorker);
        this.setData('workers', workers);
        
        // Add activity log
        this.addActivity(`عامل جديد`, `تم إضافة العامل ${workerData.name} في قسم ${workerData.department}`);
        
        return newWorker;
    }

    updateWorker(id, updateData) {
        const workers = this.getAllWorkers();
        const index = workers.findIndex(w => w.id === parseInt(id));
        if (index !== -1) {
            workers[index] = { ...workers[index], ...updateData };
            this.setData('workers', workers);
            return workers[index];
        }
        return null;
    }

    deleteWorker(id) {
        const workers = this.getAllWorkers();
        const filteredWorkers = workers.filter(w => w.id !== parseInt(id));
        this.setData('workers', filteredWorkers);
        return filteredWorkers.length !== workers.length;
    }

    // Attendance operations
    getAttendanceByDate(date) {
        const attendance = this.getData('attendance') || [];
        return attendance.filter(a => a.date === date);
    }

    markAttendance(workerId, date, status) {
        const attendance = this.getData('attendance') || [];
        const existingIndex = attendance.findIndex(a => a.workerId === workerId && a.date === date);
        
        const attendanceRecord = {
            id: existingIndex === -1 ? this.getNextId('attendance') : attendance[existingIndex].id,
            workerId: workerId,
            date: date,
            status: status,
            markedAt: new Date().toISOString()
        };

        if (existingIndex === -1) {
            attendance.push(attendanceRecord);
        } else {
            attendance[existingIndex] = attendanceRecord;
        }

        this.setData('attendance', attendance);
        return attendanceRecord;
    }

    // Activity logs
    addActivity(title, description) {
        const activities = this.getData('activities') || [];
        const newActivity = {
            id: this.getNextId('activities'),
            title: title,
            description: description,
            logDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        activities.unshift(newActivity); // Add to beginning
        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(50);
        }
        this.setData('activities', activities);
        return newActivity;
    }

    getAllActivities() {
        return this.getData('activities') || [];
    }

    getRecentActivities(limit = 10) {
        const activities = this.getAllActivities();
        return activities.slice(0, limit);
    }

    // Dashboard data
    getDashboardData() {
        const sales = this.getAllSales();
        const expenses = this.getAllExpenses();
        const workers = this.getAllWorkers().filter(w => w.status === 'active');
        
        const totalIncome = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const netProfit = totalIncome - totalExpenses;
        const totalWorkers = workers.length;

        return {
            totalIncome,
            totalExpenses,
            netProfit,
            totalWorkers
        };
    }

    // Low stock alerts
    getLowStockAlerts(threshold = 50) {
        const products = this.getAllProducts();
        return products.filter(product => product.stockQuantity < threshold).map(product => ({
            title: `نفاد المخزون`,
            description: `${product.name}: متبقي ${product.stockQuantity} وحدة فقط`,
            productId: product.id,
            quantity: product.stockQuantity
        }));
    }

    // Category translations
    getCategoryName(category) {
        const categories = {
            'Utilities': 'المرافق',
            'Salaries': 'الرواتب',
            'Maintenance': 'الصيانة',
            'RawMaterials': 'المواد الخام',
            'Transportation': 'النقل',
            'Other': 'أخرى'
        };
        return categories[category] || category;
    }

    // Filter operations
    filterSales(filters = {}) {
        let sales = this.getAllSales();
        
        if (filters.date) {
            sales = sales.filter(sale => sale.saleDate === filters.date);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            sales = sales.filter(sale => 
                sale.productName.toLowerCase().includes(searchTerm) ||
                sale.clientName.toLowerCase().includes(searchTerm)
            );
        }
        
        return sales;
    }

    filterExpenses(filters = {}) {
        let expenses = this.getAllExpenses();
        
        if (filters.category) {
            expenses = expenses.filter(expense => expense.category === filters.category);
        }
        
        if (filters.date) {
            expenses = expenses.filter(expense => expense.expenseDate === filters.date);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            expenses = expenses.filter(expense => 
                expense.name.toLowerCase().includes(searchTerm)
            );
        }
        
        return expenses;
    }

    // Reports
    generateReport(startDate, endDate) {
        const sales = this.getAllSales().filter(sale => 
            sale.saleDate >= startDate && sale.saleDate <= endDate
        );
        
        const expenses = this.getAllExpenses().filter(expense => 
            expense.expenseDate >= startDate && expense.expenseDate <= endDate
        );

        const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const netProfit = totalSales - totalExpenses;

        // Sales by product
        const salesByProduct = {};
        sales.forEach(sale => {
            if (!salesByProduct[sale.productName]) {
                salesByProduct[sale.productName] = {
                    quantity: 0,
                    amount: 0
                };
            }
            salesByProduct[sale.productName].quantity += sale.quantity;
            salesByProduct[sale.productName].amount += parseFloat(sale.totalAmount);
        });

        // Expenses by category
        const expensesByCategory = {};
        expenses.forEach(expense => {
            const category = this.getCategoryName(expense.category);
            if (!expensesByCategory[category]) {
                expensesByCategory[category] = 0;
            }
            expensesByCategory[category] += parseFloat(expense.amount);
        });

        return {
            period: { startDate, endDate },
            summary: {
                totalSales,
                totalExpenses,
                netProfit,
                salesCount: sales.length,
                expensesCount: expenses.length
            },
            salesByProduct,
            expensesByCategory,
            sales,
            expenses
        };
    }

    // Clear all data (for testing)
    clearAllData() {
        const keys = ['products', 'sales', 'expenses', 'workers', 'attendance', 'activities', 'counters'];
        keys.forEach(key => {
            localStorage.removeItem(`alwasiloon_${key}`);
        });
        this.initializeData();
    }

    // Export data
    exportData() {
        const data = {
            products: this.getAllProducts(),
            sales: this.getAllSales(),
            expenses: this.getAllExpenses(),
            workers: this.getAllWorkers(),
            attendance: this.getData('attendance'),
            activities: this.getAllActivities(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // Import data
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.products) this.setData('products', data.products);
            if (data.sales) this.setData('sales', data.sales);
            if (data.expenses) this.setData('expenses', data.expenses);
            if (data.workers) this.setData('workers', data.workers);
            if (data.attendance) this.setData('attendance', data.attendance);
            if (data.activities) this.setData('activities', data.activities);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Initialize storage manager
window.storageManager = new StorageManager();