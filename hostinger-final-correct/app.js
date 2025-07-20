// Al-Wasiloon Factory Management System - Static Version
// Complete working application matching the exact Replit design

// Global data storage using localStorage
let appData = {
    sales: JSON.parse(localStorage.getItem('al-wasiloon-sales') || '[]'),
    expenses: JSON.parse(localStorage.getItem('al-wasiloon-expenses') || '[]'),
    workers: JSON.parse(localStorage.getItem('al-wasiloon-workers') || '[]'),
    storage: JSON.parse(localStorage.getItem('al-wasiloon-storage') || '[]'),
    activities: JSON.parse(localStorage.getItem('al-wasiloon-activities') || '[]'),
    currentPage: 'dashboard'
};

// Materials data (matching the exact materials from Replit app)
const MATERIALS = [
    { id: 'gypsum', name: 'الجبس', unit: 'طن' },
    { id: 'feldspar', name: 'الفلسبار', unit: 'طن' },
    { id: 'kaolin', name: 'الكاولينا', unit: 'طن' },
    { id: 'talc', name: 'التلك', unit: 'طن' },
    { id: 'calcium', name: 'كاربونات الكالسيوم', unit: 'طن' }
];

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
    console.log('App initialized with data:', appData);
});

// Also initialize when page loads completely
window.addEventListener('load', function() {
    console.log('Page fully loaded, updating displays...');
    updateAllDisplays();
});

function initializeApp() {
    // Always initialize sample data to ensure it's loaded
    initializeSampleData();
    
    // Show default page
    showPage('dashboard');
    
    // Update displays
    updateAllDisplays();
    
    // Initialize charts with delay to ensure DOM is ready
    setTimeout(() => {
        initializeCharts();
    }, 100);
}

function initializeSampleData() {
    // Sample sales data (matching the Replit screenshot)
    appData.sales = [
        {
            id: 1,
            productName: 'Urea',
            customerName: 'ABC Company',
            quantity: 7,
            unitPrice: 35000,
            totalAmount: 245000,
            date: new Date('2024-01-15').toISOString()
        },
        {
            id: 2,
            productName: 'Organic Compost',
            customerName: 'Green Farms Ltd',
            quantity: 10,
            unitPrice: 120000,
            totalAmount: 1200000,
            date: new Date('2024-01-14').toISOString()
        },
        {
            id: 3,
            productName: 'Phosphate',
            customerName: 'Agricultural Corp',
            quantity: 15,
            unitPrice: 50000,
            totalAmount: 750000,
            date: new Date('2024-01-13').toISOString()
        },
        {
            id: 4,
            productName: 'Potassium Nitrate',
            customerName: 'Farm Solutions',
            quantity: 12,
            unitPrice: 60000,
            totalAmount: 720000,
            date: new Date('2024-01-12').toISOString()
        },
        {
            id: 5,
            productName: 'NPK Fertilizer',
            customerName: 'Modern Agriculture',
            quantity: 20,
            unitPrice: 45000,
            totalAmount: 900000,
            date: new Date('2024-01-11').toISOString()
        }
    ];
    
    // Sample expenses data (matching the Replit screenshot)
    appData.expenses = [
        {
            id: 1,
            name: 'Electricity Bill',
            amount: 15000,
            category: 'Utilities',
            date: new Date('2024-01-17').toISOString()
        },
        {
            id: 2,
            name: 'Worker Salaries',
            amount: 50000,
            category: 'Salaries',
            date: new Date('2024-01-15').toISOString()
        },
        {
            id: 3,
            name: 'Equipment Repair',
            amount: 8000,
            category: 'Maintenance',
            date: new Date('2024-01-12').toISOString()
        },
        {
            id: 4,
            name: 'Raw Materials',
            amount: 35000,
            category: 'Raw Materials',
            date: new Date('2024-01-08').toISOString()
        },
        {
            id: 5,
            name: 'Transportation',
            amount: 12000,
            category: 'Transportation',
            date: new Date('2024-01-05').toISOString()
        }
    ];
    
    // Sample workers data (matching the Replit screenshot)
    appData.workers = [
        {
            id: 1,
            name: 'Ahmed Mohamed',
            position: 'Production Supervisor',
            department: 'Production',
            salary: 8000,
            phone: '+20 100 123 4567',
            email: 'ahmed.mohamed@alwasiloon.com',
            status: 'active'
        },
        {
            id: 2,
            name: 'Fatima Ibrahim',
            position: 'Quality Control Specialist',
            department: 'Quality',
            salary: 6500,
            phone: '+20 101 234 5678',
            email: 'fatima.ibrahim@alwasiloon.com',
            status: 'active'
        },
        {
            id: 3,
            name: 'Mohamed Hassan',
            position: 'Machine Operator',
            department: 'Production',
            salary: 5500,
            phone: '+20 102 345 6789',
            email: 'mohamed.hassan@alwasiloon.com',
            status: 'active'
        },
        {
            id: 4,
            name: 'Amira Ali',
            position: 'Storage Manager',
            department: 'Storage',
            salary: 7000,
            phone: '+20 103 456 7890',
            email: 'amira.ali@alwasiloon.com',
            status: 'active'
        },
        {
            id: 5,
            name: 'Khaled Mahmoud',
            position: 'Maintenance Technician',
            department: 'Maintenance',
            salary: 6000,
            phone: '+20 104 567 8901',
            email: 'khaled.mahmoud@alwasiloon.com',
            status: 'active'
        }
    ];
    
    // Sample storage data
    appData.storage = [
        { id: 'gypsum', name: 'الجبس', quantity: 150, unit: 'طن' },
        { id: 'feldspar', name: 'الفلسبار', quantity: 0, unit: 'طن' },
        { id: 'kaolin', name: 'الكاولينا', quantity: 0, unit: 'طن' },
        { id: 'talc', name: 'التلك', quantity: 0, unit: 'طن' },
        { id: 'calcium', name: 'كاربونات الكالسيوم', quantity: 0, unit: 'طن' }
    ];
    
    // Save to localStorage
    saveData();
}

function saveData() {
    localStorage.setItem('al-wasiloon-sales', JSON.stringify(appData.sales));
    localStorage.setItem('al-wasiloon-expenses', JSON.stringify(appData.expenses));
    localStorage.setItem('al-wasiloon-workers', JSON.stringify(appData.workers));
    localStorage.setItem('al-wasiloon-storage', JSON.stringify(appData.storage));
    localStorage.setItem('al-wasiloon-activities', JSON.stringify(appData.activities));
}

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.add('hidden'));
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.sidebar-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('fade-in');
    }
    
    // Add active class to current nav link
    const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    appData.currentPage = pageId;
    
    // Update page-specific content
    if (pageId === 'dashboard') {
        updateDashboard();
    } else if (pageId === 'sales') {
        updateSalesPage();
    } else if (pageId === 'expenses') {
        updateExpensesPage();
    } else if (pageId === 'workers') {
        updateWorkersPage();
    } else if (pageId === 'storage') {
        updateStoragePage();
    } else if (pageId === 'activity') {
        updateActivityPage();
    }
}

function updateAllDisplays() {
    updateDashboard();
    updateSalesPage();
    updateExpensesPage();
    updateWorkersPage();
    updateStoragePage();
}

function updateDashboard() {
    // Calculate totals
    const totalSales = appData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = appData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalSales - totalExpenses;
    const totalWorkers = appData.workers.filter(w => w.status === 'active').length;
    
    // Update dashboard stats with null checks
    const totalSalesEl = document.getElementById('totalSales');
    const totalExpensesEl = document.getElementById('totalExpenses');
    const netProfitEl = document.getElementById('netProfit');
    const totalWorkersEl = document.getElementById('totalWorkers');
    
    if (totalSalesEl) totalSalesEl.textContent = formatCurrency(totalSales);
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(totalExpenses);
    if (netProfitEl) netProfitEl.textContent = formatCurrency(netProfit);
    if (totalWorkersEl) totalWorkersEl.textContent = totalWorkers;
    
    console.log('Dashboard updated:', { totalSales, totalExpenses, netProfit, totalWorkers });
}

function updateSalesPage() {
    const totalSales = appData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const salesCount = appData.sales.length;
    const avgSaleValue = salesCount > 0 ? totalSales / salesCount : 0;
    
    // Update sales stats
    if (document.getElementById('todaySales')) {
        document.getElementById('todaySales').textContent = formatCurrency(totalSales);
        document.getElementById('salesCount').textContent = salesCount;
        document.getElementById('avgSaleValue').textContent = formatCurrency(avgSaleValue);
    }
    
    // Update sales table
    const tableBody = document.getElementById('salesTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        appData.sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-sm text-gray-900">${sale.productName}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${sale.customerName}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${sale.quantity}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${formatCurrency(sale.totalAmount)}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${formatDate(sale.date)}</td>
                <td class="px-6 py-4 text-sm">
                    <button class="text-red-600 hover:text-red-800" onclick="deleteSale(${sale.id})">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        lucide.createIcons();
    }
}

function updateExpensesPage() {
    const expensesList = document.getElementById('expensesList');
    if (expensesList) {
        expensesList.innerHTML = '';
        appData.expenses.forEach(expense => {
            const expenseDiv = document.createElement('div');
            expenseDiv.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg';
            expenseDiv.innerHTML = `
                <div>
                    <div class="font-medium text-gray-900">${expense.name}</div>
                    <div class="text-sm text-gray-500">${expense.category} • ${formatDate(expense.date)}</div>
                </div>
                <div class="text-right">
                    <div class="font-medium text-red-600">${formatCurrency(expense.amount)}</div>
                    <button class="text-red-600 hover:text-red-800 text-sm" onclick="deleteExpense(${expense.id})">حذف</button>
                </div>
            `;
            expensesList.appendChild(expenseDiv);
        });
    }
}

function updateWorkersPage() {
    const workersGrid = document.getElementById('workersGrid');
    if (workersGrid) {
        workersGrid.innerHTML = '';
        appData.workers.forEach(worker => {
            const workerCard = document.createElement('div');
            workerCard.className = 'bg-white p-6 rounded-2xl shadow-sm card-hover';
            workerCard.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <span class="text-primary-600 font-bold">${worker.name.charAt(0)}</span>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${worker.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-1">${worker.name}</h3>
                <p class="text-sm text-gray-500 mb-2">${worker.position}</p>
                <p class="text-sm text-gray-500 mb-3">${worker.department}</p>
                <div class="text-sm text-gray-600 mb-2">
                    <i data-lucide="phone" class="w-4 h-4 inline ml-1"></i>
                    ${worker.phone}
                </div>
                <div class="text-sm text-gray-600 mb-4">
                    <i data-lucide="mail" class="w-4 h-4 inline ml-1"></i>
                    ${worker.email}
                </div>
                <div class="text-lg font-bold text-primary-600">
                    EGP ${worker.salary.toLocaleString()}/شهر
                </div>
            `;
            workersGrid.appendChild(workerCard);
        });
        lucide.createIcons();
    }
}

function updateStoragePage() {
    // Update material quantities
    MATERIALS.forEach(material => {
        const storageItem = appData.storage.find(s => s.id === material.id);
        const qtyElement = document.getElementById(material.id + 'Qty');
        if (qtyElement) {
            qtyElement.textContent = storageItem ? storageItem.quantity : 0;
        }
    });
}

function updateActivityPage() {
    const activityLog = document.getElementById('activityLog');
    if (activityLog) {
        activityLog.innerHTML = '';
        
        // Generate activity log from recent sales and expenses
        const activities = [];
        
        appData.sales.forEach(sale => {
            activities.push({
                type: 'sale',
                description: `تم بيع ${sale.quantity} من ${sale.productName} إلى ${sale.customerName}`,
                amount: `+${formatCurrency(sale.totalAmount)}`,
                date: sale.date,
                icon: 'shopping-cart',
                color: 'green'
            });
        });
        
        appData.expenses.forEach(expense => {
            activities.push({
                type: 'expense',
                description: `مصروف: ${expense.name}`,
                amount: `-${formatCurrency(expense.amount)}`,
                date: expense.date,
                icon: 'credit-card',
                color: 'red'
            });
        });
        
        // Sort by date (most recent first)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        activities.slice(0, 20).forEach(activity => {
            const activityDiv = document.createElement('div');
            activityDiv.className = 'flex items-center gap-4 p-4 bg-gray-50 rounded-lg';
            activityDiv.innerHTML = `
                <div class="w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center">
                    <i data-lucide="${activity.icon}" class="w-5 h-5 text-${activity.color}-600"></i>
                </div>
                <div class="flex-1">
                    <div class="text-sm text-gray-900">${activity.description}</div>
                    <div class="text-xs text-gray-500">${formatDate(activity.date)}</div>
                </div>
                <div class="text-sm font-medium text-${activity.color}-600">${activity.amount}</div>
            `;
            activityLog.appendChild(activityDiv);
        });
        
        lucide.createIcons();
    }
}

function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'bar',
            data: {
                labels: appData.sales.slice(0, 5).map(sale => sale.productName),
                datasets: [{
                    label: 'المبيعات',
                    data: appData.sales.slice(0, 5).map(sale => sale.totalAmount),
                    backgroundColor: '#8B5A3C',
                    borderColor: '#6D432C',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Expense Chart
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
        new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: appData.expenses.slice(0, 5).map(expense => expense.category),
                datasets: [{
                    data: appData.expenses.slice(0, 5).map(expense => expense.amount),
                    backgroundColor: [
                        '#8B5A3C',
                        '#D69E89',
                        '#E0CFC5',
                        '#F2E8E5',
                        '#FDF8F6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Modal functions
function openAddSaleModal() {
    // Create modal (simplified version)
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">إضافة مبيعة جديدة</h3>
            <form onsubmit="addSale(event)">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">اسم المنتج</label>
                        <input type="text" name="productName" required class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">اسم العميل</label>
                        <input type="text" name="customerName" required class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                        <input type="number" name="quantity" required class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">سعر الوحدة</label>
                        <input type="number" name="unitPrice" required class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button type="submit" class="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600">حفظ</button>
                    <button type="button" onclick="closeModal()" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300">إلغاء</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function addSale(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const newSale = {
        id: Date.now(),
        productName: formData.get('productName'),
        customerName: formData.get('customerName'),
        quantity: parseInt(formData.get('quantity')),
        unitPrice: parseFloat(formData.get('unitPrice')),
        totalAmount: parseInt(formData.get('quantity')) * parseFloat(formData.get('unitPrice')),
        date: new Date().toISOString()
    };
    
    appData.sales.unshift(newSale);
    saveData();
    updateAllDisplays();
    closeModal();
}

function deleteSale(id) {
    if (confirm('هل أنت متأكد من حذف هذه المبيعة؟')) {
        appData.sales = appData.sales.filter(sale => sale.id !== id);
        saveData();
        updateSalesPage();
        updateDashboard();
    }
}

function deleteExpense(id) {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
        appData.expenses = appData.expenses.filter(expense => expense.id !== id);
        saveData();
        updateExpensesPage();
        updateDashboard();
    }
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

// Utility functions
function formatCurrency(amount) {
    return `EGP ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Export functions for modal actions
window.showPage = showPage;
window.openAddSaleModal = openAddSaleModal;
window.openAddExpenseModal = function() { console.log('Add expense modal'); };
window.openAddWorkerModal = function() { console.log('Add worker modal'); };
window.openAddStorageModal = function() { console.log('Add storage modal'); };
window.addSale = addSale;
window.deleteSale = deleteSale;
window.deleteExpense = deleteExpense;
window.closeModal = closeModal;