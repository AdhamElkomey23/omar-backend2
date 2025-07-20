// Al-Wasiloon Factory Management Application
// Main application logic

class FactoryManagementApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.storage = window.storageManager;
        this.init();
    }

    init() {
        this.showLoadingScreen();
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.loadDashboard();
    }

    showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
        }, 2000);
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Mobile menu toggle
        this.setupMobileMenu();
        
        // Modal functionality
        this.setupModals();
        
        // Forms
        this.setupForms();
        
        // Filters and search
        this.setupFilters();
        
        // Date display
        this.updateCurrentDate();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    setupModals() {
        // Modal open buttons
        document.getElementById('add-sale-btn').addEventListener('click', () => {
            this.openModal('add-sale-modal');
        });

        document.getElementById('add-expense-btn').addEventListener('click', () => {
            this.openModal('add-expense-modal');
        });

        document.getElementById('add-worker-btn').addEventListener('click', () => {
            this.openModal('add-worker-modal');
        });

        document.getElementById('add-storage-item-btn').addEventListener('click', () => {
            this.openModal('add-storage-item-modal');
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = btn.getAttribute('data-modal');
                this.closeModal(modalId);
            });
        });

        // Close modal when clicking backdrop
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    setupForms() {
        // Add sale form
        document.getElementById('add-sale-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddSale(new FormData(e.target));
        });

        // Add expense form
        document.getElementById('add-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddExpense(new FormData(e.target));
        });

        // Add worker form
        document.getElementById('add-worker-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddWorker(new FormData(e.target));
        });

        // Add storage item form
        document.getElementById('add-storage-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddStorageItem(new FormData(e.target));
        });

        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sale-date').value = today;
        document.getElementById('expense-date').value = today;
        document.getElementById('attendance-date').value = today;
    }

    setupFilters() {
        // Sales filters
        document.getElementById('sales-date-filter').addEventListener('change', () => {
            this.loadSales();
        });

        document.getElementById('sales-search').addEventListener('input', () => {
            this.loadSales();
        });

        document.getElementById('reset-sales-filter').addEventListener('click', () => {
            document.getElementById('sales-date-filter').value = '';
            document.getElementById('sales-search').value = '';
            this.loadSales();
        });

        // Expenses filters
        document.getElementById('expenses-category-filter').addEventListener('change', () => {
            this.loadExpenses();
        });

        document.getElementById('expenses-date-filter').addEventListener('change', () => {
            this.loadExpenses();
        });

        document.getElementById('expenses-search').addEventListener('input', () => {
            this.loadExpenses();
        });

        document.getElementById('reset-expenses-filter').addEventListener('click', () => {
            document.getElementById('expenses-category-filter').value = '';
            document.getElementById('expenses-date-filter').value = '';
            document.getElementById('expenses-search').value = '';
            this.loadExpenses();
        });

        // Reports
        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateReport();
        });

        // Attendance
        document.getElementById('attendance-date').addEventListener('change', () => {
            this.loadAttendance();
        });

        document.getElementById('mark-all-present').addEventListener('click', () => {
            this.markAllPresent();
        });
    }

    navigateToPage(page) {
        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page-content').forEach(pageContent => {
            pageContent.style.display = 'none';
        });

        // Show selected page
        document.getElementById(`${page}-page`).style.display = 'block';
        this.currentPage = page;

        // Load page data
        this.loadPageData(page);

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
    }

    loadPageData(page) {
        switch(page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'sales':
                this.loadSales();
                break;
            case 'expenses':
                this.loadExpenses();
                break;
            case 'workers':
                this.loadWorkers();
                break;
            case 'attendance':
                this.loadAttendance();
                break;
            case 'storage':
                this.loadStorage();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    // Dashboard
    loadDashboard() {
        const dashboardData = this.storage.getDashboardData();
        
        document.getElementById('total-income').textContent = this.formatCurrency(dashboardData.totalIncome);
        document.getElementById('total-expenses').textContent = this.formatCurrency(dashboardData.totalExpenses);
        document.getElementById('net-profit').textContent = this.formatCurrency(dashboardData.netProfit);
        document.getElementById('total-workers').textContent = dashboardData.totalWorkers;

        // Recent activities
        this.loadRecentActivities();
        
        // Low stock alerts
        this.loadLowStockAlerts();
    }

    loadRecentActivities() {
        const activities = this.storage.getRecentActivities(5);
        const container = document.getElementById('recent-activities');
        
        if (activities.length === 0) {
            container.innerHTML = '<div class="activity-item">لا توجد أنشطة حديثة</div>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${this.formatDate(activity.logDate)}</div>
            </div>
        `).join('');
    }

    loadLowStockAlerts() {
        const alerts = this.storage.getLowStockAlerts();
        const container = document.getElementById('low-stock-alerts');
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="alert-item">جميع المنتجات متوفرة بكميات كافية</div>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-description">${alert.description}</div>
            </div>
        `).join('');
    }

    // Sales
    loadSales() {
        const filters = {
            date: document.getElementById('sales-date-filter').value,
            search: document.getElementById('sales-search').value
        };
        
        const sales = this.storage.filterSales(filters);
        const tbody = document.getElementById('sales-table-body');
        
        tbody.innerHTML = sales.map(sale => `
            <tr>
                <td>${this.formatDate(sale.saleDate)}</td>
                <td>${sale.productName}</td>
                <td>${sale.clientName}</td>
                <td>${sale.quantity}</td>
                <td>${this.formatCurrency(sale.totalAmount)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-danger" onclick="app.deleteSale(${sale.id})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    handleAddSale(formData) {
        const saleData = {
            productName: formData.get('productName'),
            quantity: parseInt(formData.get('quantity')),
            totalAmount: parseFloat(formData.get('totalAmount')),
            saleDate: formData.get('saleDate'),
            clientName: formData.get('clientName'),
            clientContact: formData.get('clientContact') || ''
        };

        this.storage.createSale(saleData);
        this.closeModal('add-sale-modal');
        document.getElementById('add-sale-form').reset();
        this.loadSales();
        
        if (this.currentPage === 'dashboard') {
            this.loadDashboard();
        }
    }

    deleteSale(id) {
        if (confirm('هل أنت متأكد من حذف هذه المبيعة؟')) {
            this.storage.deleteSale(id);
            this.loadSales();
            if (this.currentPage === 'dashboard') {
                this.loadDashboard();
            }
        }
    }

    // Expenses
    loadExpenses() {
        const filters = {
            category: document.getElementById('expenses-category-filter').value,
            date: document.getElementById('expenses-date-filter').value,
            search: document.getElementById('expenses-search').value
        };
        
        const expenses = this.storage.filterExpenses(filters);
        const tbody = document.getElementById('expenses-table-body');
        
        tbody.innerHTML = expenses.map(expense => `
            <tr>
                <td>${this.formatDate(expense.expenseDate)}</td>
                <td>${expense.name}</td>
                <td>${this.storage.getCategoryName(expense.category)}</td>
                <td>${this.formatCurrency(expense.amount)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-danger" onclick="app.deleteExpense(${expense.id})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    handleAddExpense(formData) {
        const expenseData = {
            name: formData.get('name'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            expenseDate: formData.get('expenseDate')
        };

        this.storage.createExpense(expenseData);
        this.closeModal('add-expense-modal');
        document.getElementById('add-expense-form').reset();
        this.loadExpenses();
        
        if (this.currentPage === 'dashboard') {
            this.loadDashboard();
        }
    }

    deleteExpense(id) {
        if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
            this.storage.deleteExpense(id);
            this.loadExpenses();
            if (this.currentPage === 'dashboard') {
                this.loadDashboard();
            }
        }
    }

    // Workers
    loadWorkers() {
        const workers = this.storage.getAllWorkers();
        const container = document.getElementById('workers-grid');
        
        container.innerHTML = workers.map(worker => `
            <div class="worker-card">
                <div class="worker-header">
                    <div class="worker-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="worker-info">
                        <h3>${worker.name}</h3>
                        <div class="worker-role">${worker.role}</div>
                    </div>
                </div>
                <div class="worker-details">
                    <div class="worker-detail">
                        <i class="fas fa-building"></i>
                        <span>${worker.department}</span>
                    </div>
                    <div class="worker-detail">
                        <i class="fas fa-money-bill"></i>
                        <span>${this.formatCurrency(worker.salary)} ريال</span>
                    </div>
                    <div class="worker-detail">
                        <i class="fas fa-calendar"></i>
                        <span>${this.formatDate(worker.hireDate)}</span>
                    </div>
                    ${worker.phone ? `
                        <div class="worker-detail">
                            <i class="fas fa-phone"></i>
                            <span>${worker.phone}</span>
                        </div>
                    ` : ''}
                    ${worker.email ? `
                        <div class="worker-detail">
                            <i class="fas fa-envelope"></i>
                            <span>${worker.email}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="worker-status ${worker.status === 'active' ? 'status-active' : worker.status === 'inactive' ? 'status-inactive' : 'status-terminated'}">
                    ${worker.status === 'active' ? 'نشط' : worker.status === 'inactive' ? 'غير نشط' : 'منتهي'}
                </div>
                <div class="worker-actions">
                    <button class="btn btn-sm btn-danger" onclick="app.deleteWorker(${worker.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `).join('');
    }

    handleAddWorker(formData) {
        const workerData = {
            name: formData.get('name'),
            role: formData.get('role'),
            department: formData.get('department'),
            salary: parseInt(formData.get('salary')),
            hireDate: formData.get('hireDate'),
            email: formData.get('email') || '',
            phone: formData.get('phone') || ''
        };

        this.storage.createWorker(workerData);
        this.closeModal('add-worker-modal');
        document.getElementById('add-worker-form').reset();
        this.loadWorkers();
        
        if (this.currentPage === 'dashboard') {
            this.loadDashboard();
        }
    }

    deleteWorker(id) {
        if (confirm('هل أنت متأكد من حذف هذا العامل؟')) {
            this.storage.deleteWorker(id);
            this.loadWorkers();
            if (this.currentPage === 'dashboard') {
                this.loadDashboard();
            }
        }
    }

    // Attendance
    loadAttendance() {
        const selectedDate = document.getElementById('attendance-date').value;
        const workers = this.storage.getAllWorkers().filter(w => w.status === 'active');
        const attendance = this.storage.getAttendanceByDate(selectedDate);
        const container = document.getElementById('attendance-grid');
        
        container.innerHTML = workers.map(worker => {
            const attendanceRecord = attendance.find(a => a.workerId === worker.id);
            const status = attendanceRecord ? attendanceRecord.status : 'absent';
            
            return `
                <div class="attendance-card">
                    <div class="attendance-header">
                        <div class="attendance-worker">
                            <div class="attendance-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="attendance-name">${worker.name}</div>
                        </div>
                        <div class="attendance-status ${status === 'present' ? 'status-present' : 'status-absent'}">
                            ${status === 'present' ? 'حاضر' : 'غائب'}
                        </div>
                    </div>
                    <div class="attendance-actions">
                        <button class="btn btn-sm ${status === 'present' ? 'btn-secondary' : 'btn-success'}" 
                                onclick="app.markAttendance(${worker.id}, '${selectedDate}', 'present')">
                            <i class="fas fa-check"></i> حاضر
                        </button>
                        <button class="btn btn-sm ${status === 'absent' ? 'btn-secondary' : 'btn-danger'}" 
                                onclick="app.markAttendance(${worker.id}, '${selectedDate}', 'absent')">
                            <i class="fas fa-times"></i> غائب
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    markAttendance(workerId, date, status) {
        this.storage.markAttendance(workerId, date, status);
        this.loadAttendance();
    }

    markAllPresent() {
        const selectedDate = document.getElementById('attendance-date').value;
        const workers = this.storage.getAllWorkers().filter(w => w.status === 'active');
        
        workers.forEach(worker => {
            this.storage.markAttendance(worker.id, selectedDate, 'present');
        });
        
        this.loadAttendance();
    }

    // Storage
    loadStorage() {
        const products = this.storage.getAllProducts();
        const tbody = document.getElementById('storage-table-body');
        
        tbody.innerHTML = products.map(product => {
            const totalValue = product.stockQuantity * product.unitPrice;
            const stockStatus = product.stockQuantity > 50 ? 'good' : product.stockQuantity > 10 ? 'low' : 'out';
            const statusText = stockStatus === 'good' ? 'جيد' : stockStatus === 'low' ? 'قليل' : 'نفد';
            
            return `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.stockQuantity}</td>
                    <td>${this.formatCurrency(product.unitPrice)}</td>
                    <td>${this.formatCurrency(totalValue)}</td>
                    <td>
                        <span class="stock-status stock-${stockStatus}">${statusText}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="app.editProduct(${product.id})">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="app.deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    handleAddStorageItem(formData) {
        const productData = {
            name: formData.get('name'),
            stockQuantity: parseInt(formData.get('stockQuantity')),
            unitPrice: parseFloat(formData.get('unitPrice'))
        };

        this.storage.createProduct(productData);
        this.closeModal('add-storage-item-modal');
        document.getElementById('add-storage-item-form').reset();
        this.loadStorage();
    }

    editProduct(id) {
        // Simple edit functionality - you can expand this
        const newQuantity = prompt('أدخل الكمية الجديدة:');
        if (newQuantity !== null && !isNaN(newQuantity)) {
            this.storage.updateProduct(id, { stockQuantity: parseInt(newQuantity) });
            this.loadStorage();
        }
    }

    deleteProduct(id) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            this.storage.deleteProduct(id);
            this.loadStorage();
        }
    }

    // Reports
    loadReports() {
        // Set default date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        document.getElementById('report-start-date').value = startDate.toISOString().split('T')[0];
        document.getElementById('report-end-date').value = endDate.toISOString().split('T')[0];
    }

    generateReport() {
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;
        
        if (!startDate || !endDate) {
            alert('يرجى اختيار فترة التقرير');
            return;
        }
        
        const reportData = this.storage.generateReport(startDate, endDate);
        this.displayReport(reportData);
    }

    displayReport(reportData) {
        const container = document.getElementById('report-content');
        
        container.innerHTML = `
            <div class="report-section">
                <h3>ملخص التقرير (${this.formatDate(reportData.period.startDate)} - ${this.formatDate(reportData.period.endDate)})</h3>
                <div class="report-stats">
                    <div class="report-stat">
                        <div class="report-stat-value">${this.formatCurrency(reportData.summary.totalSales)}</div>
                        <div class="report-stat-label">إجمالي المبيعات</div>
                    </div>
                    <div class="report-stat">
                        <div class="report-stat-value">${this.formatCurrency(reportData.summary.totalExpenses)}</div>
                        <div class="report-stat-label">إجمالي المصروفات</div>
                    </div>
                    <div class="report-stat">
                        <div class="report-stat-value">${this.formatCurrency(reportData.summary.netProfit)}</div>
                        <div class="report-stat-label">صافي الربح</div>
                    </div>
                    <div class="report-stat">
                        <div class="report-stat-value">${reportData.summary.salesCount}</div>
                        <div class="report-stat-label">عدد المبيعات</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h3>المبيعات حسب المنتج</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الكمية المباعة</th>
                                <th>المبلغ الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(reportData.salesByProduct).map(([product, data]) => `
                                <tr>
                                    <td>${product}</td>
                                    <td>${data.quantity}</td>
                                    <td>${this.formatCurrency(data.amount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="report-section">
                <h3>المصروفات حسب الفئة</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>الفئة</th>
                                <th>المبلغ الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(reportData.expensesByCategory).map(([category, amount]) => `
                                <tr>
                                    <td>${category}</td>
                                    <td>${this.formatCurrency(amount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Modal functions
    openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateCurrentDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('current-date').textContent = dateString;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FactoryManagementApp();
});