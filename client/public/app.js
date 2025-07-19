// Al-Wasiloon Fertilizer Factory Management System
// Complete working application with all pages functional and translation support

// Global data storage
let appData = {
    sales: JSON.parse(localStorage.getItem('al-wasiloon-sales') || '[]'),
    expenses: JSON.parse(localStorage.getItem('al-wasiloon-expenses') || '[]'),
    workers: JSON.parse(localStorage.getItem('al-wasiloon-workers') || '[]'),
    storage: JSON.parse(localStorage.getItem('al-wasiloon-storage') || '[]'),
    activities: JSON.parse(localStorage.getItem('al-wasiloon-activities') || '[]'),
    attendance: JSON.parse(localStorage.getItem('al-wasiloon-attendance') || '[]'),
    language: localStorage.getItem('al-wasiloon-language') || 'ar',
    currentTimeFilter: 7 // Default to 7 days
};

// Translation data
const translations = {
    ar: {
        // Navigation
        home: 'الرئيسية',
        dashboard: 'لوحة التحكم',
        sales: 'المبيعات',
        expenses: 'المصروفات',
        workers: 'العمال',
        storage: 'المخزون',
        activityLogs: 'سجل الأنشطة',
        reports: 'التقارير',
        settings: 'الإعدادات',
        
        // Common actions
        add: 'إضافة',
        edit: 'تعديل',
        delete: 'حذف',
        save: 'حفظ',
        cancel: 'إلغاء',
        view: 'عرض',
        
        // Forms
        productName: 'اسم المنتج',
        quantity: 'الكمية',
        price: 'السعر',
        customerName: 'اسم العميل',
        saleDate: 'تاريخ البيع',
        expenseName: 'اسم المصروف',
        amount: 'المبلغ',
        category: 'الفئة',
        date: 'التاريخ',
        
        // Messages
        saveSuccess: 'تم الحفظ بنجاح',
        deleteSuccess: 'تم الحذف بنجاح',
        updateSuccess: 'تم التحديث بنجاح',
        deleteConfirm: 'هل أنت متأكد من الحذف؟',
        fillRequired: 'يرجى ملء جميع الحقول المطلوبة'
    },
    en: {
        // Navigation
        home: 'Home',
        dashboard: 'Dashboard',
        sales: 'Sales',
        expenses: 'Expenses',
        workers: 'Workers',
        storage: 'Storage',
        activityLogs: 'Activity Logs',
        reports: 'Reports',
        settings: 'Settings',
        
        // Common actions
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        view: 'View',
        
        // Forms
        productName: 'Product Name',
        quantity: 'Quantity',
        price: 'Price',
        customerName: 'Customer Name',
        saleDate: 'Sale Date',
        expenseName: 'Expense Name',
        amount: 'Amount',
        category: 'Category',
        date: 'Date',
        
        // Messages
        saveSuccess: 'Saved successfully',
        deleteSuccess: 'Deleted successfully',
        updateSuccess: 'Updated successfully',
        deleteConfirm: 'Are you sure you want to delete?',
        fillRequired: 'Please fill all required fields'
    }
};

// Materials configuration
const MATERIALS = ['الجبس', 'الفلسبار', 'الكاولينا', 'التلك', 'كاربونات الكالسيوم'];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set current language
    setLanguage(appData.language);
    
    // Set current dates in forms
    setCurrentDates();
    
    // Initialize all form handlers
    initializeFormHandlers();
    
    // Update all displays
    updateAllDisplays();
    
    // Initialize dashboard data
    updateDashboard();
}

// Language functions
function toggleLanguage() {
    const newLang = appData.language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
}

function setLanguage(lang) {
    appData.language = lang;
    localStorage.setItem('al-wasiloon-language', lang);
    
    // Update body class and direction
    document.body.className = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update language toggle button
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = lang === 'ar' ? 'English' : 'العربية';
    }
    
    // Update all translated elements
    updateTranslations();
}

function updateTranslations() {
    const elements = document.querySelectorAll('[data-ar], [data-en]');
    elements.forEach(element => {
        const key = appData.language === 'ar' ? 'data-ar' : 'data-en';
        const text = element.getAttribute(key);
        if (text) {
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'tel' || element.type === 'number')) {
                const placeholderKey = appData.language === 'ar' ? 'data-ar-placeholder' : 'data-en-placeholder';
                const placeholder = element.getAttribute(placeholderKey);
                if (placeholder) {
                    element.placeholder = placeholder;
                }
            } else {
                element.textContent = text;
            }
        }
    });
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageId) {
            item.classList.add('active');
        }
    });
    
    // Initialize page-specific functionality
    switch(pageId) {
        case 'home':
            updateHomeOverview();
            break;
        case 'dashboard':
            updateDashboard();
            updateDashboardAnalytics();
            break;
        case 'sales':
            updateSalesTable();
            break;
        case 'expenses':
            updateExpensesTable();
            break;
        case 'workers':
            updateWorkersTable();
            updateAttendanceTable();
            updateDeductionsSummary();
            populateAttendanceWorkerOptions();
            setCurrentDate();
            break;
        case 'storage':
            updateStorageDisplay();
            break;
        case 'activity-logs':
            updateActivitiesTable();
            break;
        case 'reports':
            updateReportsPage();
            break;
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        // Reset form when opening modal
        resetModalForm(modalId);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function resetModalForm(modalId) {
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        form.removeAttribute('data-edit-id');
        
        // Set current date for date inputs
        const dateInputs = form.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.value = new Date().toISOString().split('T')[0];
        });
        
        // Reset modal title
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            const addText = modalTitle.getAttribute('data-ar');
            if (addText) {
                modalTitle.textContent = addText;
            }
        }
    }
}

// Form initialization
function initializeFormHandlers() {
    // Sales form
    const salesForm = document.getElementById('sale-form');
    if (salesForm) {
        salesForm.addEventListener('submit', handleSaleSubmit);
    }
    
    // Expenses form
    const expensesForm = document.getElementById('expense-form');
    if (expensesForm) {
        expensesForm.addEventListener('submit', handleExpenseSubmit);
    }
    
    // Workers form
    const workersForm = document.getElementById('worker-form');
    if (workersForm) {
        workersForm.addEventListener('submit', handleWorkerSubmit);
    }
    
    // Storage form
    const storageForm = document.getElementById('storage-form');
    if (storageForm) {
        storageForm.addEventListener('submit', handleStorageSubmit);
    }
    
    // Activities form
    const activitiesForm = document.getElementById('activity-form');
    if (activitiesForm) {
        activitiesForm.addEventListener('submit', handleActivitySubmit);
    }
}

function setCurrentDates() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

// Sales functionality
function handleSaleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    
    const formData = {
        productName: document.getElementById('sale-product').value,
        quantity: parseFloat(document.getElementById('sale-quantity').value) || 0,
        totalAmount: parseFloat(document.getElementById('sale-amount').value) || 0,
        clientName: document.getElementById('sale-customer').value,
        clientContact: document.getElementById('sale-contact').value || '',
        saleDate: document.getElementById('sale-date').value
    };
    
    if (!formData.productName || !formData.quantity || !formData.totalAmount || !formData.clientName) {
        showErrorMessage(translations[appData.language].fillRequired);
        return;
    }
    
    if (editId) {
        // Edit existing sale
        const index = appData.sales.findIndex(item => item.id === parseInt(editId));
        if (index !== -1) {
            appData.sales[index] = { ...appData.sales[index], ...formData };
            showSuccessMessage(translations[appData.language].updateSuccess);
        }
    } else {
        // Add new sale
        formData.id = Date.now();
        formData.createdAt = new Date().toISOString();
        appData.sales.push(formData);
        showSuccessMessage(translations[appData.language].saveSuccess);
    }
    
    localStorage.setItem('al-wasiloon-sales', JSON.stringify(appData.sales));
    updateSalesTable();
    updateDashboard();
    closeModal('add-sale-modal');
}

function updateSalesTable() {
    const tbody = document.getElementById('sales-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    appData.sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.productName}</td>
            <td>${sale.quantity.toLocaleString()}</td>
            <td>${formatCurrency(sale.totalAmount)}</td>
            <td>${sale.clientName}</td>
            <td>${new Date(sale.saleDate).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
            <td>
                <button class="btn btn-primary" onclick="exportSaleInvoice(${sale.id})" style="margin-left: 8px;">
                    📄 ${appData.language === 'ar' ? 'فاتورة' : 'Invoice'}
                </button>
                <button class="btn btn-secondary" onclick="editSale(${sale.id})" style="margin-left: 8px;">
                    ✏️ ${translations[appData.language].edit}
                </button>
                <button class="btn btn-destructive" onclick="deleteSale(${sale.id})">
                    🗑️ ${translations[appData.language].delete}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editSale(id) {
    const sale = appData.sales.find(item => item.id === id);
    if (!sale) return;
    
    document.getElementById('sale-product').value = sale.productName;
    document.getElementById('sale-quantity').value = sale.quantity;
    document.getElementById('sale-amount').value = sale.totalAmount;
    document.getElementById('sale-customer').value = sale.clientName;
    document.getElementById('sale-contact').value = sale.clientContact || '';
    document.getElementById('sale-date').value = sale.saleDate;
    
    const form = document.getElementById('sale-form');
    form.dataset.editId = id;
    
    showModal('add-sale-modal');
}

function deleteSale(id) {
    if (!confirm(translations[appData.language].deleteConfirm)) return;
    
    appData.sales = appData.sales.filter(item => item.id !== id);
    localStorage.setItem('al-wasiloon-sales', JSON.stringify(appData.sales));
    updateSalesTable();
    updateDashboard();
    showSuccessMessage(translations[appData.language].deleteSuccess);
}

// Expenses functionality
function handleExpenseSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    
    const formData = {
        name: document.getElementById('expense-name').value,
        amount: parseFloat(document.getElementById('expense-amount').value) || 0,
        category: document.getElementById('expense-category').value,
        expenseDate: document.getElementById('expense-date').value
    };
    
    if (!formData.name || !formData.amount || !formData.category) {
        showErrorMessage(translations[appData.language].fillRequired);
        return;
    }
    
    if (editId) {
        const index = appData.expenses.findIndex(item => item.id === parseInt(editId));
        if (index !== -1) {
            appData.expenses[index] = { ...appData.expenses[index], ...formData };
            showSuccessMessage(translations[appData.language].updateSuccess);
        }
    } else {
        formData.id = Date.now();
        formData.createdAt = new Date().toISOString();
        appData.expenses.push(formData);
        showSuccessMessage(translations[appData.language].saveSuccess);
    }
    
    localStorage.setItem('al-wasiloon-expenses', JSON.stringify(appData.expenses));
    updateExpensesTable();
    updateDashboard();
    closeModal('add-expense-modal');
}

function updateExpensesTable() {
    const tbody = document.getElementById('expenses-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    appData.expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>${getCategoryName(expense.category)}</td>
            <td>${new Date(expense.expenseDate).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
            <td>
                <button class="btn btn-secondary" onclick="editExpense(${expense.id})" style="margin-left: 8px;">
                    ✏️ ${translations[appData.language].edit}
                </button>
                <button class="btn btn-destructive" onclick="deleteExpense(${expense.id})">
                    🗑️ ${translations[appData.language].delete}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getCategoryName(category) {
    const categories = {
        ar: {
            raw_materials: 'مواد خام',
            utilities: 'خدمات',
            maintenance: 'صيانة',
            transportation: 'نقل',
            other: 'أخرى'
        },
        en: {
            raw_materials: 'Raw Materials',
            utilities: 'Utilities',
            maintenance: 'Maintenance',
            transportation: 'Transportation',
            other: 'Other'
        }
    };
    return categories[appData.language][category] || category;
}

function editExpense(id) {
    const expense = appData.expenses.find(item => item.id === id);
    if (!expense) return;
    
    document.getElementById('expense-name').value = expense.name;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-date').value = expense.expenseDate;
    
    const form = document.getElementById('expense-form');
    form.dataset.editId = id;
    
    showModal('add-expense-modal');
}

function deleteExpense(id) {
    if (!confirm(translations[appData.language].deleteConfirm)) return;
    
    appData.expenses = appData.expenses.filter(item => item.id !== id);
    localStorage.setItem('al-wasiloon-expenses', JSON.stringify(appData.expenses));
    updateExpensesTable();
    updateDashboard();
    showSuccessMessage(translations[appData.language].deleteSuccess);
}

// Workers functionality
function handleWorkerSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    
    const formData = {
        fullName: document.getElementById('worker-name').value,
        position: document.getElementById('worker-position').value,
        department: document.getElementById('worker-department').value,
        monthlySalary: parseFloat(document.getElementById('worker-salary').value) || 0,
        phoneNumber: document.getElementById('worker-phone').value || '',
        hireDate: document.getElementById('worker-hire-date').value
    };
    
    if (!formData.fullName || !formData.position || !formData.department || !formData.monthlySalary) {
        showErrorMessage(translations[appData.language].fillRequired);
        return;
    }
    
    if (editId) {
        const index = appData.workers.findIndex(item => item.id === parseInt(editId));
        if (index !== -1) {
            appData.workers[index] = { ...appData.workers[index], ...formData };
            showSuccessMessage(translations[appData.language].updateSuccess);
        }
    } else {
        formData.id = Date.now();
        formData.createdAt = new Date().toISOString();
        appData.workers.push(formData);
        showSuccessMessage(translations[appData.language].saveSuccess);
    }
    
    localStorage.setItem('al-wasiloon-workers', JSON.stringify(appData.workers));
    updateWorkersTable();
    updateDashboard();
    closeModal('add-worker-modal');
}

function updateWorkersTable() {
    const tbody = document.getElementById('workers-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    appData.workers.forEach(worker => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${worker.fullName}</td>
            <td>${worker.position}</td>
            <td>${getDepartmentName(worker.department)}</td>
            <td>${formatCurrency(worker.monthlySalary)}</td>
            <td>${worker.phoneNumber || '-'}</td>
            <td>
                <button class="btn btn-secondary" onclick="editWorker(${worker.id})" style="margin-left: 8px;">
                    ✏️ ${translations[appData.language].edit}
                </button>
                <button class="btn btn-destructive" onclick="deleteWorker(${worker.id})">
                    🗑️ ${translations[appData.language].delete}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getDepartmentName(department) {
    const departments = {
        ar: {
            production: 'الإنتاج',
            quality_control: 'مراقبة الجودة',
            maintenance: 'الصيانة',
            administration: 'الإدارة',
            security: 'الأمن'
        },
        en: {
            production: 'Production',
            quality_control: 'Quality Control',
            maintenance: 'Maintenance',
            administration: 'Administration',
            security: 'Security'
        }
    };
    return departments[appData.language][department] || department;
}

function editWorker(id) {
    const worker = appData.workers.find(item => item.id === id);
    if (!worker) return;
    
    document.getElementById('worker-name').value = worker.fullName;
    document.getElementById('worker-position').value = worker.position;
    document.getElementById('worker-department').value = worker.department;
    document.getElementById('worker-salary').value = worker.monthlySalary;
    document.getElementById('worker-phone').value = worker.phoneNumber || '';
    document.getElementById('worker-hire-date').value = worker.hireDate;
    
    const form = document.getElementById('worker-form');
    form.dataset.editId = id;
    
    showModal('add-worker-modal');
}

function deleteWorker(id) {
    if (!confirm(translations[appData.language].deleteConfirm)) return;
    
    appData.workers = appData.workers.filter(item => item.id !== id);
    localStorage.setItem('al-wasiloon-workers', JSON.stringify(appData.workers));
    updateWorkersTable();
    updateDashboard();
    showSuccessMessage(translations[appData.language].deleteSuccess);
}

// Storage functionality
function handleStorageSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    
    const formData = {
        itemName: document.getElementById('storage-item').value,
        quantityInTons: parseFloat(document.getElementById('storage-quantity').value) || 0,
        purchasePricePerTon: parseFloat(document.getElementById('storage-price').value) || 0,
        dealerName: document.getElementById('storage-dealer').value,
        dealerContact: document.getElementById('storage-contact').value || '',
        purchaseDate: document.getElementById('storage-date').value
    };
    
    if (!formData.itemName || !formData.quantityInTons || !formData.purchasePricePerTon || !formData.dealerName) {
        showErrorMessage(translations[appData.language].fillRequired);
        return;
    }
    
    if (editId) {
        const index = appData.storage.findIndex(item => item.id === parseInt(editId));
        if (index !== -1) {
            appData.storage[index] = { ...appData.storage[index], ...formData };
            showSuccessMessage(translations[appData.language].updateSuccess);
        }
    } else {
        formData.id = Date.now();
        formData.createdAt = new Date().toISOString();
        appData.storage.push(formData);
        showSuccessMessage(translations[appData.language].saveSuccess);
    }
    
    localStorage.setItem('al-wasiloon-storage', JSON.stringify(appData.storage));
    updateStorageDisplay();
    closeModal('add-storage-modal');
}

function updateStorageDisplay() {
    updateMaterialTotals();
    updateStorageSections();
}

function updateMaterialTotals() {
    MATERIALS.forEach(material => {
        const totalQuantity = appData.storage
            .filter(item => item.itemName === material)
            .reduce((sum, item) => sum + item.quantityInTons, 0);
        
        const elementId = getMaterialElementId(material);
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = totalQuantity.toLocaleString(appData.language === 'ar' ? 'ar-EG' : 'en-US');
        }
    });
}

function getMaterialElementId(material) {
    const idMap = {
        'الجبس': 'gypsum-total',
        'الفلسبار': 'feldspar-total',
        'الكاولينا': 'kaolin-total',
        'التلك': 'talc-total',
        'كاربونات الكالسيوم': 'calcium-total'
    };
    return idMap[material] || '';
}

function updateStorageSections() {
    const container = document.getElementById('storage-sections');
    if (!container) return;
    
    container.innerHTML = '';
    
    MATERIALS.forEach(material => {
        const materialItems = appData.storage.filter(item => item.itemName === material);
        
        if (materialItems.length === 0) return;
        
        const section = createMaterialSection(material, materialItems);
        container.appendChild(section);
    });
}

function createMaterialSection(material, items) {
    const section = document.createElement('div');
    section.className = 'card';
    
    const materialName = appData.language === 'ar' ? material : getMaterialEnglishName(material);
    
    section.innerHTML = `
        <div class="card-header">
            <h2 class="card-title">${materialName}</h2>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${appData.language === 'ar' ? 'شركة المورد' : 'Supplier Company'}</th>
                        <th>${appData.language === 'ar' ? 'جهة الاتصال' : 'Contact Info'}</th>
                        <th>${appData.language === 'ar' ? 'تاريخ الشراء' : 'Purchase Date'}</th>
                        <th>${appData.language === 'ar' ? 'الكمية (طن)' : 'Quantity (Tons)'}</th>
                        <th>${appData.language === 'ar' ? 'السعر للطن' : 'Price per Ton'}</th>
                        <th>${appData.language === 'ar' ? 'التكلفة الإجمالية' : 'Total Cost'}</th>
                        <th>${appData.language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => createStorageTableRow(item)).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    return section;
}

function getMaterialEnglishName(material) {
    const names = {
        'الجبس': 'Gypsum',
        'الفلسبار': 'Feldspar',
        'الكاولينا': 'Kaolin',
        'التلك': 'Talc',
        'كاربونات الكالسيوم': 'Calcium Carbonate'
    };
    return names[material] || material;
}

function createStorageTableRow(item) {
    const totalCost = item.quantityInTons * item.purchasePricePerTon;
    const formattedDate = new Date(item.purchaseDate).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US');
    
    return `
        <tr>
            <td style="color: var(--primary);">${item.dealerName}</td>
            <td style="color: var(--muted-foreground);">${item.dealerContact || '-'}</td>
            <td>${formattedDate}</td>
            <td>${item.quantityInTons.toLocaleString(appData.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
            <td>${formatCurrency(item.purchasePricePerTon)}</td>
            <td>${formatCurrency(totalCost)}</td>
            <td>
                <button class="btn btn-secondary" onclick="editStorageItem(${item.id})" style="margin-left: 8px;">
                    ✏️ ${translations[appData.language].edit}
                </button>
                <button class="btn btn-destructive" onclick="deleteStorageItem(${item.id})">
                    🗑️ ${translations[appData.language].delete}
                </button>
            </td>
        </tr>
    `;
}

function editStorageItem(id) {
    const item = appData.storage.find(item => item.id === id);
    if (!item) return;
    
    document.getElementById('storage-item').value = item.itemName;
    document.getElementById('storage-quantity').value = item.quantityInTons;
    document.getElementById('storage-price').value = item.purchasePricePerTon;
    document.getElementById('storage-dealer').value = item.dealerName;
    document.getElementById('storage-contact').value = item.dealerContact || '';
    document.getElementById('storage-date').value = item.purchaseDate;
    
    const form = document.getElementById('storage-form');
    form.dataset.editId = id;
    
    showModal('add-storage-modal');
}

function deleteStorageItem(id) {
    if (!confirm(translations[appData.language].deleteConfirm)) return;
    
    appData.storage = appData.storage.filter(item => item.id !== id);
    localStorage.setItem('al-wasiloon-storage', JSON.stringify(appData.storage));
    updateStorageDisplay();
    showSuccessMessage(translations[appData.language].deleteSuccess);
}

// Activities functionality
function handleActivitySubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    
    const formData = {
        title: document.getElementById('activity-title').value,
        description: document.getElementById('activity-description').value,
        logDate: document.getElementById('activity-date').value
    };
    
    if (!formData.title || !formData.description) {
        showErrorMessage(translations[appData.language].fillRequired);
        return;
    }
    
    if (editId) {
        const index = appData.activities.findIndex(item => item.id === parseInt(editId));
        if (index !== -1) {
            appData.activities[index] = { ...appData.activities[index], ...formData };
            showSuccessMessage(translations[appData.language].updateSuccess);
        }
    } else {
        formData.id = Date.now();
        formData.createdAt = new Date().toISOString();
        appData.activities.push(formData);
        showSuccessMessage(translations[appData.language].saveSuccess);
    }
    
    localStorage.setItem('al-wasiloon-activities', JSON.stringify(appData.activities));
    updateActivitiesTable();
    closeModal('add-activity-modal');
}

function updateActivitiesTable() {
    const tbody = document.getElementById('activities-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    appData.activities.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.title}</td>
            <td>${activity.description}</td>
            <td>${new Date(activity.logDate).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
            <td>
                <button class="btn btn-secondary" onclick="editActivity(${activity.id})" style="margin-left: 8px;">
                    ✏️ ${translations[appData.language].edit}
                </button>
                <button class="btn btn-destructive" onclick="deleteActivity(${activity.id})">
                    🗑️ ${translations[appData.language].delete}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editActivity(id) {
    const activity = appData.activities.find(item => item.id === id);
    if (!activity) return;
    
    document.getElementById('activity-title').value = activity.title;
    document.getElementById('activity-description').value = activity.description;
    document.getElementById('activity-date').value = activity.logDate;
    
    const form = document.getElementById('activity-form');
    form.dataset.editId = id;
    
    showModal('add-activity-modal');
}

function deleteActivity(id) {
    if (!confirm(translations[appData.language].deleteConfirm)) return;
    
    appData.activities = appData.activities.filter(item => item.id !== id);
    localStorage.setItem('al-wasiloon-activities', JSON.stringify(appData.activities));
    updateActivitiesTable();
    showSuccessMessage(translations[appData.language].deleteSuccess);
}

// Dashboard functionality
function updateDashboard() {
    const totalIncome = appData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = appData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalIncome - totalExpenses;
    const totalWorkers = appData.workers.length;
    
    updateElement('total-income', formatCurrency(totalIncome));
    updateElement('total-expenses', formatCurrency(totalExpenses));
    updateElement('profit', formatCurrency(profit));
    updateElement('total-workers', totalWorkers.toString());
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat(appData.language === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
    }).format(amount);
}

function showSuccessMessage(message) {
    const messageElement = document.getElementById('success-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.classList.add('show');
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }
}

function showErrorMessage(message) {
    alert(message);
}

function updateAllDisplays() {
    updateSalesTable();
    updateExpensesTable();
    updateWorkersTable();
    updateStorageDisplay();
    updateActivitiesTable();
    updateDashboard();
    updateHomeOverview();
    updateDashboardAnalytics();
    updateReportsPage();
    updateAttendanceTable();
    updateDeductionsSummary();
}

// Home page overview
function updateHomeOverview() {
    const totalIncome = appData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = appData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalIncome - totalExpenses;
    const totalProducts = getUniqueProducts().length;
    
    updateElement('home-total-income', formatCurrency(totalIncome));
    updateElement('home-total-expenses', formatCurrency(totalExpenses));
    updateElement('home-net-profit', formatCurrency(profit));
    updateElement('home-total-products', totalProducts.toString());
}

// Dashboard time filter
function setTimeFilter(days) {
    appData.currentTimeFilter = parseInt(days);
    
    // Update active filter button
    document.querySelectorAll('.time-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.period === days) {
            btn.classList.add('active');
        }
    });
    
    // Update dashboard with filtered data
    updateDashboard();
    updateDashboardAnalytics();
}

// Get filtered data based on time range
function getFilteredData(dataArray, dateField) {
    if (!appData.currentTimeFilter) return dataArray;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - appData.currentTimeFilter);
    
    return dataArray.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= cutoffDate;
    });
}

// Enhanced dashboard with time filtering
function updateDashboard() {
    const filteredSales = getFilteredData(appData.sales, 'saleDate');
    const filteredExpenses = getFilteredData(appData.expenses, 'expenseDate');
    
    const totalIncome = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalIncome - totalExpenses;
    const totalWorkers = appData.workers.length;
    
    updateElement('total-income', formatCurrency(totalIncome));
    updateElement('total-expenses', formatCurrency(totalExpenses));
    updateElement('profit', formatCurrency(profit));
    updateElement('total-workers', totalWorkers.toString());
}

// Dashboard analytics
function updateDashboardAnalytics() {
    updateTopProducts();
    updateExpenseCategories();
    updateRecentActivity();
}

// Top products analysis
function updateTopProducts() {
    const filteredSales = getFilteredData(appData.sales, 'saleDate');
    const productSales = {};
    
    filteredSales.forEach(sale => {
        if (!productSales[sale.productName]) {
            productSales[sale.productName] = {
                quantity: 0,
                revenue: 0,
                sales: 0
            };
        }
        productSales[sale.productName].quantity += sale.quantity;
        productSales[sale.productName].revenue += sale.totalAmount;
        productSales[sale.productName].sales += 1;
    });
    
    const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    const container = document.getElementById('top-products-list');
    if (container) {
        container.innerHTML = topProducts.length > 0 
            ? topProducts.map(product => `
                <div class="product-item">
                    <div class="product-name">${product.name}</div>
                    <div class="product-sales">${formatCurrency(product.revenue)}</div>
                </div>
            `).join('')
            : `<div class="product-item"><div style="color: var(--muted-foreground); text-align: center;">${appData.language === 'ar' ? 'لا توجد بيانات' : 'No data available'}</div></div>`;
    }
}

// Expense categories analysis
function updateExpenseCategories() {
    const filteredExpenses = getFilteredData(appData.expenses, 'expenseDate');
    const categoryTotals = {};
    
    filteredExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    const container = document.getElementById('expense-categories-chart');
    if (container) {
        const categories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a);
        
        container.innerHTML = categories.length > 0
            ? categories.map(([category, amount]) => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                    <span>${getCategoryName(category)}</span>
                    <span style="font-weight: 600; color: var(--primary);">${formatCurrency(amount)}</span>
                </div>
            `).join('')
            : `<div style="color: var(--muted-foreground); text-align: center; padding: 20px;">${appData.language === 'ar' ? 'لا توجد بيانات' : 'No data available'}</div>`;
    }
}

// Recent activity
function updateRecentActivity() {
    const allActivities = [
        ...appData.sales.map(sale => ({
            type: 'sale',
            description: `${appData.language === 'ar' ? 'بيع' : 'Sale'}: ${sale.productName}`,
            amount: sale.totalAmount,
            date: new Date(sale.saleDate)
        })),
        ...appData.expenses.map(expense => ({
            type: 'expense',
            description: `${appData.language === 'ar' ? 'مصروف' : 'Expense'}: ${expense.name}`,
            amount: expense.amount,
            date: new Date(expense.expenseDate)
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);
    
    const container = document.getElementById('recent-activity-list');
    if (container) {
        container.innerHTML = allActivities.length > 0
            ? allActivities.map(activity => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border);">
                    <div>
                        <div style="font-weight: 500; font-size: 14px;">${activity.description}</div>
                        <div style="font-size: 12px; color: var(--muted-foreground);">${activity.date.toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US')}</div>
                    </div>
                    <div style="font-weight: 600; color: ${activity.type === 'sale' ? 'var(--success-500)' : 'var(--destructive-500)'};">
                        ${activity.type === 'sale' ? '+' : '-'}${formatCurrency(activity.amount)}
                    </div>
                </div>
            `).join('')
            : `<div style="color: var(--muted-foreground); text-align: center; padding: 20px;">${appData.language === 'ar' ? 'لا توجد أنشطة حديثة' : 'No recent activity'}</div>`;
    }
}

// Reports page functionality
function updateReportsPage() {
    updateReportSummary();
    updateSalesAnalysis();
    updateExpenseBreakdown();
    updateStorageReport();
    updateWorkersReport();
}

// Report summary
function updateReportSummary() {
    const totalSales = appData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = appData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profitMargin = totalSales > 0 ? ((totalSales - totalExpenses) / totalSales * 100) : 0;
    const avgSale = appData.sales.length > 0 ? totalSales / appData.sales.length : 0;
    
    updateElement('report-total-sales', formatCurrency(totalSales));
    updateElement('report-total-expenses', formatCurrency(totalExpenses));
    updateElement('report-profit-margin', profitMargin.toFixed(1) + '%');
    updateElement('report-avg-sale', formatCurrency(avgSale));
}

// Sales analysis for reports
function updateSalesAnalysis() {
    const salesByMonth = {};
    const productPerformance = {};
    
    appData.sales.forEach(sale => {
        const monthKey = new Date(sale.saleDate).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' });
        
        if (!salesByMonth[monthKey]) salesByMonth[monthKey] = 0;
        salesByMonth[monthKey] += sale.totalAmount;
        
        if (!productPerformance[sale.productName]) {
            productPerformance[sale.productName] = { count: 0, revenue: 0 };
        }
        productPerformance[sale.productName].count += 1;
        productPerformance[sale.productName].revenue += sale.totalAmount;
    });
    
    const container = document.getElementById('sales-analysis-content');
    if (container) {
        const topMonth = Object.entries(salesByMonth).sort(([,a], [,b]) => b - a)[0];
        const topProduct = Object.entries(productPerformance).sort(([,a], [,b]) => b.revenue - a.revenue)[0];
        
        container.innerHTML = `
            <div style="padding: 16px 0;">
                <div style="margin-bottom: 16px;">
                    <strong>${appData.language === 'ar' ? 'أفضل شهر:' : 'Best Month:'}</strong>
                    <div style="color: var(--muted-foreground);">${topMonth ? `${topMonth[0]} - ${formatCurrency(topMonth[1])}` : (appData.language === 'ar' ? 'لا توجد بيانات' : 'No data')}</div>
                </div>
                <div style="margin-bottom: 16px;">
                    <strong>${appData.language === 'ar' ? 'أفضل منتج:' : 'Best Product:'}</strong>
                    <div style="color: var(--muted-foreground);">${topProduct ? `${topProduct[0]} - ${formatCurrency(topProduct[1].revenue)}` : (appData.language === 'ar' ? 'لا توجد بيانات' : 'No data')}</div>
                </div>
                <div>
                    <strong>${appData.language === 'ar' ? 'إجمالي المعاملات:' : 'Total Transactions:'}</strong>
                    <div style="color: var(--muted-foreground);">${appData.sales.length}</div>
                </div>
            </div>
        `;
    }
}

// Expense breakdown for reports
function updateExpenseBreakdown() {
    const expensesByCategory = {};
    const monthlyExpenses = {};
    
    appData.expenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) expensesByCategory[expense.category] = 0;
        expensesByCategory[expense.category] += expense.amount;
        
        const monthKey = new Date(expense.expenseDate).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' });
        if (!monthlyExpenses[monthKey]) monthlyExpenses[monthKey] = 0;
        monthlyExpenses[monthKey] += expense.amount;
    });
    
    const container = document.getElementById('expense-breakdown-content');
    if (container) {
        const topCategory = Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0];
        const avgMonthly = Object.values(monthlyExpenses).length > 0 
            ? Object.values(monthlyExpenses).reduce((a, b) => a + b, 0) / Object.values(monthlyExpenses).length 
            : 0;
        
        container.innerHTML = `
            <div style="padding: 16px 0;">
                <div style="margin-bottom: 16px;">
                    <strong>${appData.language === 'ar' ? 'أعلى فئة مصروفات:' : 'Top Expense Category:'}</strong>
                    <div style="color: var(--muted-foreground);">${topCategory ? `${getCategoryName(topCategory[0])} - ${formatCurrency(topCategory[1])}` : (appData.language === 'ar' ? 'لا توجد بيانات' : 'No data')}</div>
                </div>
                <div style="margin-bottom: 16px;">
                    <strong>${appData.language === 'ar' ? 'متوسط المصروفات الشهرية:' : 'Average Monthly Expenses:'}</strong>
                    <div style="color: var(--muted-foreground);">${formatCurrency(avgMonthly)}</div>
                </div>
                <div>
                    <strong>${appData.language === 'ar' ? 'إجمالي المعاملات:' : 'Total Transactions:'}</strong>
                    <div style="color: var(--muted-foreground);">${appData.expenses.length}</div>
                </div>
            </div>
        `;
    }
}

// Storage report
function updateStorageReport() {
    const materialStats = {};
    
    MATERIALS.forEach(material => {
        const materialItems = appData.storage.filter(item => item.itemName === material);
        const totalQuantity = materialItems.reduce((sum, item) => sum + item.quantityInTons, 0);
        const totalValue = materialItems.reduce((sum, item) => sum + (item.quantityInTons * item.purchasePricePerTon), 0);
        const avgPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;
        const suppliers = [...new Set(materialItems.map(item => item.dealerName))].length;
        
        if (materialItems.length > 0) {
            materialStats[material] = {
                quantity: totalQuantity,
                value: totalValue,
                avgPrice,
                suppliers
            };
        }
    });
    
    const tbody = document.getElementById('storage-report-table');
    if (tbody) {
        tbody.innerHTML = Object.entries(materialStats).map(([material, stats]) => `
            <tr>
                <td>${appData.language === 'ar' ? material : getMaterialEnglishName(material)}</td>
                <td>${stats.quantity.toLocaleString()} ${appData.language === 'ar' ? 'طن' : 'tons'}</td>
                <td>${formatCurrency(stats.value)}</td>
                <td>${formatCurrency(stats.avgPrice)}</td>
                <td>${stats.suppliers}</td>
            </tr>
        `).join('');
    }
}

// Workers report
function updateWorkersReport() {
    // Workers by department
    const departmentCounts = {};
    const salaryStats = {
        total: 0,
        min: Infinity,
        max: 0,
        avg: 0
    };
    
    appData.workers.forEach(worker => {
        if (!departmentCounts[worker.department]) departmentCounts[worker.department] = 0;
        departmentCounts[worker.department]++;
        
        salaryStats.total += worker.monthlySalary;
        salaryStats.min = Math.min(salaryStats.min, worker.monthlySalary);
        salaryStats.max = Math.max(salaryStats.max, worker.monthlySalary);
    });
    
    salaryStats.avg = appData.workers.length > 0 ? salaryStats.total / appData.workers.length : 0;
    if (appData.workers.length === 0) salaryStats.min = 0;
    
    // Update departments
    const deptContainer = document.getElementById('workers-by-department');
    if (deptContainer) {
        deptContainer.innerHTML = Object.entries(departmentCounts).map(([dept, count]) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <span>${getDepartmentName(dept)}</span>
                <span style="font-weight: 600;">${count}</span>
            </div>
        `).join('');
    }
    
    // Update salary stats
    const salaryContainer = document.getElementById('salary-statistics');
    if (salaryContainer) {
        salaryContainer.innerHTML = `
            <div style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                <strong>${appData.language === 'ar' ? 'إجمالي الرواتب:' : 'Total Salaries:'}</strong>
                <div style="color: var(--muted-foreground);">${formatCurrency(salaryStats.total)}</div>
            </div>
            <div style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                <strong>${appData.language === 'ar' ? 'متوسط الراتب:' : 'Average Salary:'}</strong>
                <div style="color: var(--muted-foreground);">${formatCurrency(salaryStats.avg)}</div>
            </div>
            <div style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                <strong>${appData.language === 'ar' ? 'أعلى راتب:' : 'Highest Salary:'}</strong>
                <div style="color: var(--muted-foreground);">${formatCurrency(salaryStats.max)}</div>
            </div>
            <div style="padding: 8px 0;">
                <strong>${appData.language === 'ar' ? 'أقل راتب:' : 'Lowest Salary:'}</strong>
                <div style="color: var(--muted-foreground);">${formatCurrency(salaryStats.min)}</div>
            </div>
        `;
    }
}

// Generate full report
function generateFullReport() {
    const reportData = {
        summary: {
            totalSales: appData.sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
            totalExpenses: appData.expenses.reduce((sum, expense) => sum + expense.amount, 0),
            totalWorkers: appData.workers.length,
            totalStorageValue: appData.storage.reduce((sum, item) => sum + (item.quantityInTons * item.purchasePricePerTon), 0)
        },
        timestamp: new Date().toLocaleString(appData.language === 'ar' ? 'ar-EG' : 'en-US')
    };
    
    const message = appData.language === 'ar' 
        ? `تم إنشاء التقرير الشامل بنجاح!\n\nإجمالي المبيعات: ${formatCurrency(reportData.summary.totalSales)}\nإجمالي المصروفات: ${formatCurrency(reportData.summary.totalExpenses)}\nصافي الربح: ${formatCurrency(reportData.summary.totalSales - reportData.summary.totalExpenses)}\n\nتاريخ التقرير: ${reportData.timestamp}`
        : `Full report generated successfully!\n\nTotal Sales: ${formatCurrency(reportData.summary.totalSales)}\nTotal Expenses: ${formatCurrency(reportData.summary.totalExpenses)}\nNet Profit: ${formatCurrency(reportData.summary.totalSales - reportData.summary.totalExpenses)}\n\nReport Date: ${reportData.timestamp}`;
    
    showSuccessMessage(appData.language === 'ar' ? 'تم إنشاء التقرير بنجاح' : 'Report generated successfully');
    alert(message);
}

// Get unique products
function getUniqueProducts() {
    return [...new Set(appData.sales.map(sale => sale.productName))];
}

// ========== ATTENDANCE TRACKING SYSTEM ==========

// Attendance counters
let attendanceCounter = 1;

// Set current date for attendance
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const attendanceDateInput = document.getElementById('attendance-date');
    const dateFilterInput = document.getElementById('attendance-date-filter');
    
    if (attendanceDateInput) attendanceDateInput.value = today;
    if (dateFilterInput) dateFilterInput.value = today;
}

// Populate worker options in attendance modal
function populateAttendanceWorkerOptions() {
    const select = document.getElementById('attendance-worker-id');
    if (!select) return;
    
    // Clear existing options except the first one
    select.innerHTML = `<option value="" data-ar="اختر عامل" data-en="Select Worker">${appData.language === 'ar' ? 'اختر عامل' : 'Select Worker'}</option>`;
    
    appData.workers.forEach(worker => {
        const option = document.createElement('option');
        option.value = worker.id;
        option.textContent = worker.name;
        select.appendChild(option);
    });
}

// Handle attendance form submission
function handleAttendanceSubmit(event) {
    event.preventDefault();
    
    const workerId = parseInt(document.getElementById('attendance-worker-id').value);
    const date = document.getElementById('attendance-date').value;
    const checkIn = document.getElementById('attendance-check-in').value;
    const checkOut = document.getElementById('attendance-check-out').value;
    const status = document.getElementById('attendance-status').value;
    const deduction = parseFloat(document.getElementById('attendance-deduction').value) || 0;
    const notes = document.getElementById('attendance-notes').value;
    
    // Find worker name
    const worker = appData.workers.find(w => w.id === workerId);
    if (!worker) {
        showErrorMessage(appData.language === 'ar' ? 'العامل غير موجود' : 'Worker not found');
        return;
    }
    
    // Check if attendance already exists for this worker on this date
    const existingAttendance = appData.attendance.find(a => a.workerId === workerId && a.date === date);
    if (existingAttendance) {
        showErrorMessage(appData.language === 'ar' ? 'تم تسجيل الحضور بالفعل لهذا العامل في هذا التاريخ' : 'Attendance already recorded for this worker on this date');
        return;
    }
    
    // Calculate work hours
    let workHours = 0;
    if (checkIn && checkOut) {
        const checkInTime = new Date(`2000-01-01T${checkIn}`);
        const checkOutTime = new Date(`2000-01-01T${checkOut}`);
        workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
        workHours = Math.max(0, workHours); // Ensure non-negative
    }
    
    const newAttendance = {
        id: attendanceCounter++,
        workerId: workerId,
        workerName: worker.name,
        date: date,
        checkIn: checkIn,
        checkOut: checkOut || null,
        status: status,
        workHours: workHours,
        deduction: deduction,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    appData.attendance.push(newAttendance);
    localStorage.setItem('al-wasiloon-attendance', JSON.stringify(appData.attendance));
    
    // Add activity log
    const activityMessage = appData.language === 'ar' 
        ? `تم تسجيل حضور العامل: ${worker.name} - ${getStatusName(status)}`
        : `Attendance recorded for worker: ${worker.name} - ${getStatusName(status)}`;
    
    const newActivity = {
        id: (appData.activities.length + 1),
        title: appData.language === 'ar' ? 'تسجيل حضور' : 'Attendance Record',
        description: activityMessage,
        activityDate: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
    };
    
    appData.activities.push(newActivity);
    localStorage.setItem('al-wasiloon-activities', JSON.stringify(appData.activities));
    
    updateAttendanceTable();
    updateDeductionsSummary();
    closeModal('attendance-modal');
    resetModalForm('attendance-modal');
    showSuccessMessage(appData.language === 'ar' ? 'تم تسجيل الحضور بنجاح' : 'Attendance recorded successfully');
}

// Update attendance table
function updateAttendanceTable() {
    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;
    
    let filteredAttendance = [...appData.attendance];
    
    // Apply date filter if set
    const dateFilter = document.getElementById('attendance-date-filter');
    if (dateFilter && dateFilter.value) {
        filteredAttendance = filteredAttendance.filter(a => a.date === dateFilter.value);
    }
    
    // Sort by date (newest first)
    filteredAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = filteredAttendance.map(attendance => `
        <tr>
            <td>${attendance.workerName}</td>
            <td>${new Date(attendance.date).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
            <td>${attendance.checkIn || '-'}</td>
            <td>${attendance.checkOut || '-'}</td>
            <td>
                <span class="status-badge status-${attendance.status}">
                    ${getStatusName(attendance.status)}
                </span>
            </td>
            <td>${attendance.workHours.toFixed(2)} ${appData.language === 'ar' ? 'ساعة' : 'hours'}</td>
            <td class="${attendance.deduction > 0 ? 'text-red' : ''}">
                ${attendance.deduction > 0 ? formatCurrency(attendance.deduction) : '-'}
            </td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editAttendance(${attendance.id})" data-ar="تعديل" data-en="Edit">
                    ${appData.language === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button class="btn btn-sm btn-destructive" onclick="deleteAttendance(${attendance.id})" data-ar="حذف" data-en="Delete">
                    ${appData.language === 'ar' ? 'حذف' : 'Delete'}
                </button>
            </td>
        </tr>
    `).join('');
    
    if (filteredAttendance.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--muted-foreground); padding: 40px;">
                    ${appData.language === 'ar' ? 'لا توجد سجلات حضور' : 'No attendance records found'}
                </td>
            </tr>
        `;
    }
}

// Get status name in current language
function getStatusName(status) {
    const statusNames = {
        'present': { ar: 'حاضر', en: 'Present' },
        'late': { ar: 'متأخر', en: 'Late' },
        'absent': { ar: 'غائب', en: 'Absent' },
        'half-day': { ar: 'نصف يوم', en: 'Half Day' }
    };
    return statusNames[status] ? statusNames[status][appData.language] : status;
}

// Update deduction field based on status
function updateDeductionField() {
    const status = document.getElementById('attendance-status').value;
    const deductionField = document.getElementById('attendance-deduction');
    
    if (!deductionField) return;
    
    // Set default deduction amounts based on status
    switch (status) {
        case 'absent':
            deductionField.value = '100'; // Full day deduction
            break;
        case 'late':
            deductionField.value = '25'; // Late penalty
            break;
        case 'half-day':
            deductionField.value = '50'; // Half day deduction
            break;
        case 'present':
        default:
            deductionField.value = '0';
            break;
    }
}

// Filter attendance by date
function filterAttendanceByDate() {
    updateAttendanceTable();
}

// Edit attendance record
function editAttendance(id) {
    const attendance = appData.attendance.find(a => a.id === id);
    if (!attendance) return;
    
    // Populate form with existing data
    document.getElementById('attendance-worker-id').value = attendance.workerId;
    document.getElementById('attendance-date').value = attendance.date;
    document.getElementById('attendance-check-in').value = attendance.checkIn || '';
    document.getElementById('attendance-check-out').value = attendance.checkOut || '';
    document.getElementById('attendance-status').value = attendance.status;
    document.getElementById('attendance-deduction').value = attendance.deduction;
    document.getElementById('attendance-notes').value = attendance.notes || '';
    
    // Delete the old record (will be replaced with updated one)
    deleteAttendance(id, false);
    
    showModal('attendance-modal');
}

// Delete attendance record
function deleteAttendance(id, showConfirm = true) {
    if (showConfirm && !confirm(appData.language === 'ar' ? 'هل أنت متأكد من حذف هذا السجل؟' : 'Are you sure you want to delete this record?')) {
        return;
    }
    
    const index = appData.attendance.findIndex(a => a.id === id);
    if (index > -1) {
        appData.attendance.splice(index, 1);
        localStorage.setItem('al-wasiloon-attendance', JSON.stringify(appData.attendance));
        updateAttendanceTable();
        updateDeductionsSummary();
        if (showConfirm) {
            showSuccessMessage(appData.language === 'ar' ? 'تم حذف السجل بنجاح' : 'Record deleted successfully');
        }
    }
}

// Update deductions summary
function updateDeductionsSummary() {
    const container = document.getElementById('deductions-summary');
    if (!container) return;
    
    // Group deductions by worker and month
    const deductionsByWorker = {};
    const monthFilter = document.getElementById('deduction-month-filter');
    let selectedMonth = monthFilter ? monthFilter.value : '';
    
    // Populate month filter options
    if (monthFilter) {
        const months = [...new Set(appData.attendance.map(a => {
            const date = new Date(a.date);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))].sort().reverse();
        
        const currentOptions = Array.from(monthFilter.options).map(o => o.value);
        months.forEach(month => {
            if (!currentOptions.includes(month)) {
                const option = document.createElement('option');
                option.value = month;
                const [year, monthNum] = month.split('-');
                const monthName = new Date(year, monthNum - 1).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' });
                option.textContent = monthName;
                monthFilter.appendChild(option);
            }
        });
    }
    
    appData.attendance.forEach(attendance => {
        if (attendance.deduction > 0) {
            const attendanceMonth = attendance.date.substring(0, 7); // YYYY-MM format
            
            // Apply month filter
            if (selectedMonth && attendanceMonth !== selectedMonth) return;
            
            if (!deductionsByWorker[attendance.workerId]) {
                deductionsByWorker[attendance.workerId] = {
                    workerName: attendance.workerName,
                    totalDeduction: 0,
                    deductionCount: 0,
                    deductions: []
                };
            }
            
            deductionsByWorker[attendance.workerId].totalDeduction += attendance.deduction;
            deductionsByWorker[attendance.workerId].deductionCount++;
            deductionsByWorker[attendance.workerId].deductions.push({
                date: attendance.date,
                amount: attendance.deduction,
                reason: getStatusName(attendance.status)
            });
        }
    });
    
    const workers = Object.values(deductionsByWorker);
    
    if (workers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--muted-foreground); padding: 40px;">
                ${appData.language === 'ar' ? 'لا توجد خصومات في الفترة المحددة' : 'No deductions found for the selected period'}
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="stats-grid">
            ${workers.map(worker => `
                <div class="stat-card">
                    <div class="stat-icon">👤</div>
                    <div class="stat-value">${formatCurrency(worker.totalDeduction)}</div>
                    <div class="stat-label">${worker.workerName}</div>
                    <div style="font-size: 12px; color: var(--muted-foreground); margin-top: 8px;">
                        ${worker.deductionCount} ${appData.language === 'ar' ? 'خصم' : 'deductions'}
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="showWorkerDeductionDetails(${worker.workerName}, ${JSON.stringify(worker.deductions).replace(/"/g, '&quot;')})" style="margin-top: 8px;">
                        ${appData.language === 'ar' ? 'التفاصيل' : 'Details'}
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

// Show worker deduction details
function showWorkerDeductionDetails(workerName, deductions) {
    const deductionList = typeof deductions === 'string' ? JSON.parse(deductions.replace(/&quot;/g, '"')) : deductions;
    
    const details = deductionList.map(d => 
        `${new Date(d.date).toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US')}: ${formatCurrency(d.amount)} (${d.reason})`
    ).join('\n');
    
    const message = `${appData.language === 'ar' ? 'تفاصيل خصومات' : 'Deduction Details'} - ${workerName}\n\n${details}`;
    alert(message);
}

// Show attendance summary
function showAttendanceSummary() {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyAttendance = appData.attendance.filter(a => a.date.startsWith(currentMonth));
    
    if (monthlyAttendance.length === 0) {
        alert(appData.language === 'ar' ? 'لا توجد سجلات حضور للشهر الحالي' : 'No attendance records for current month');
        return;
    }
    
    const workerStats = {};
    monthlyAttendance.forEach(attendance => {
        if (!workerStats[attendance.workerId]) {
            workerStats[attendance.workerId] = {
                name: attendance.workerName,
                present: 0,
                late: 0,
                absent: 0,
                halfDay: 0,
                totalDeductions: 0
            };
        }
        
        workerStats[attendance.workerId][attendance.status.replace('-', '')]++;
        workerStats[attendance.workerId].totalDeductions += attendance.deduction;
    });
    
    const summary = Object.values(workerStats).map(worker => 
        `${worker.name}: ${appData.language === 'ar' ? 'حاضر' : 'Present'} ${worker.present}, ${appData.language === 'ar' ? 'متأخر' : 'Late'} ${worker.late}, ${appData.language === 'ar' ? 'غائب' : 'Absent'} ${worker.absent}, ${appData.language === 'ar' ? 'نصف يوم' : 'Half Day'} ${worker.halfday || 0}\n${appData.language === 'ar' ? 'إجمالي الخصومات' : 'Total Deductions'}: ${formatCurrency(worker.totalDeductions)}`
    ).join('\n\n');
    
    alert(`${appData.language === 'ar' ? 'ملخص الحضور الشهري' : 'Monthly Attendance Summary'}\n\n${summary}`);
}

// Generate payroll report
function generatePayrollReport() {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyAttendance = appData.attendance.filter(a => a.date.startsWith(currentMonth));
    
    const payrollData = {};
    
    // Initialize with all workers
    appData.workers.forEach(worker => {
        payrollData[worker.id] = {
            name: worker.name,
            baseSalary: worker.monthlySalary,
            totalDeductions: 0,
            workingDays: 0,
            finalSalary: worker.monthlySalary
        };
    });
    
    // Calculate deductions and working days
    monthlyAttendance.forEach(attendance => {
        if (payrollData[attendance.workerId]) {
            payrollData[attendance.workerId].totalDeductions += attendance.deduction;
            if (attendance.status === 'present' || attendance.status === 'late') {
                payrollData[attendance.workerId].workingDays++;
            } else if (attendance.status === 'half-day') {
                payrollData[attendance.workerId].workingDays += 0.5;
            }
        }
    });
    
    // Calculate final salaries
    Object.values(payrollData).forEach(worker => {
        worker.finalSalary = worker.baseSalary - worker.totalDeductions;
    });
    
    const reportLines = Object.values(payrollData).map(worker => 
        `${worker.name}: ${appData.language === 'ar' ? 'الراتب الأساسي' : 'Base Salary'} ${formatCurrency(worker.baseSalary)} - ${appData.language === 'ar' ? 'الخصومات' : 'Deductions'} ${formatCurrency(worker.totalDeductions)} = ${appData.language === 'ar' ? 'الراتب النهائي' : 'Final Salary'} ${formatCurrency(worker.finalSalary)}\n${appData.language === 'ar' ? 'أيام العمل' : 'Working Days'}: ${worker.workingDays}`
    );
    
    const totalSalaries = Object.values(payrollData).reduce((sum, worker) => sum + worker.finalSalary, 0);
    const totalDeductions = Object.values(payrollData).reduce((sum, worker) => sum + worker.totalDeductions, 0);
    
    const report = `${appData.language === 'ar' ? 'تقرير الرواتب الشهري' : 'Monthly Payroll Report'}\n${appData.language === 'ar' ? 'الشهر' : 'Month'}: ${new Date(currentMonth + '-01').toLocaleDateString(appData.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' })}\n\n${reportLines.join('\n\n')}\n\n${'='.repeat(50)}\n${appData.language === 'ar' ? 'إجمالي الرواتب' : 'Total Salaries'}: ${formatCurrency(totalSalaries)}\n${appData.language === 'ar' ? 'إجمالي الخصومات' : 'Total Deductions'}: ${formatCurrency(totalDeductions)}`;
    
    alert(report);
    showSuccessMessage(appData.language === 'ar' ? 'تم إنشاء تقرير الرواتب بنجاح' : 'Payroll report generated successfully');
}

// ========== INVOICE EXPORT SYSTEM ==========

// Export sale as professional invoice
function exportSaleInvoice(saleId) {
    const sale = appData.sales.find(s => s.id === saleId);
    if (!sale) {
        showErrorMessage(appData.language === 'ar' ? 'لم يتم العثور على البيع' : 'Sale not found');
        return;
    }
    
    const invoiceData = generateInvoiceData(sale);
    const invoiceHTML = generateInvoiceHTML(invoiceData);
    
    // Create and open invoice in new window for printing/saving
    const invoiceWindow = window.open('', '_blank', 'width=800,height=600');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    
    // Auto-focus and trigger print dialog
    invoiceWindow.focus();
    setTimeout(() => {
        invoiceWindow.print();
    }, 500);
    
    showSuccessMessage(appData.language === 'ar' ? 'تم إنشاء الفاتورة بنجاح' : 'Invoice generated successfully');
}

// Generate invoice data object
function generateInvoiceData(sale) {
    const invoiceNumber = `INV-${sale.id.toString().padStart(6, '0')}`;
    const currentDate = new Date();
    const unitPrice = sale.totalAmount / sale.quantity;
    const vatRate = 0.15; // 15% VAT
    const subtotal = sale.totalAmount;
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;
    
    return {
        // Company Information
        company: {
            nameAr: 'الواصلون للتعدين والصناعات الكيميائية',
            nameEn: 'Al-Wasiloon Mining and Chemical Industries',
            addressAr: 'المملكة العربية السعودية - الرياض',
            addressEn: 'Kingdom of Saudi Arabia - Riyadh',
            phone: '+966 11 234 5678',
            email: 'info@alwasiloon.com',
            website: 'www.alwasiloon.com',
            crNumber: '1010123456',
            vatNumber: '300123456700003'
        },
        
        // Invoice Details
        invoice: {
            number: invoiceNumber,
            date: currentDate.toLocaleDateString(appData.language === 'ar' ? 'ar-SA' : 'en-US'),
            dueDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(appData.language === 'ar' ? 'ar-SA' : 'en-US'),
            currency: 'SAR'
        },
        
        // Customer Information
        customer: {
            name: sale.clientName,
            contact: sale.clientContact || '',
            address: ''
        },
        
        // Sale Items
        items: [{
            description: sale.productName,
            quantity: sale.quantity,
            unit: appData.language === 'ar' ? 'طن' : 'Ton',
            unitPrice: unitPrice,
            totalPrice: sale.totalAmount
        }],
        
        // Financial Summary
        financial: {
            subtotal: subtotal,
            vatRate: vatRate,
            vatAmount: vatAmount,
            totalAmount: totalAmount
        },
        
        // Additional Info
        saleDate: sale.saleDate,
        language: appData.language
    };
}

// Generate professional invoice HTML
function generateInvoiceHTML(data) {
    const isArabic = data.language === 'ar';
    const dir = isArabic ? 'rtl' : 'ltr';
    const align = isArabic ? 'right' : 'left';
    
    return `
<!DOCTYPE html>
<html dir="${dir}" lang="${data.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isArabic ? 'فاتورة رقم' : 'Invoice'} ${data.invoice.number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            direction: ${dir};
            background: #fff;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 40px;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #8B5A3C;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
            width: 80px;
            height: 80px;
            background: #8B5A3C;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-bottom: 15px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #8B5A3C;
            margin-bottom: 5px;
        }
        
        .company-details {
            font-size: 14px;
            color: #666;
            line-height: 1.4;
        }
        
        .invoice-title {
            text-align: ${isArabic ? 'left' : 'right'};
            flex: 1;
        }
        
        .invoice-title h1 {
            font-size: 36px;
            color: #8B5A3C;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 18px;
            color: #666;
            margin-bottom: 20px;
        }
        
        .invoice-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .bill-to, .invoice-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #8B5A3C;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .detail-label {
            font-weight: 600;
            color: #555;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: #8B5A3C;
            color: white;
            padding: 15px;
            text-align: ${align};
            font-weight: 600;
        }
        
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #eee;
            text-align: ${align};
        }
        
        .items-table tr:hover {
            background: #f8f9fa;
        }
        
        .financial-summary {
            margin-left: auto;
            margin-right: ${isArabic ? 'auto' : '0'};
            width: 300px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .summary-row.total {
            border-top: 2px solid #8B5A3C;
            margin-top: 15px;
            padding-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #8B5A3C;
        }
        
        .invoice-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        .terms {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
        
        @media print {
            body { margin: 0; }
            .invoice-container { 
                max-width: none; 
                margin: 0; 
                padding: 20px; 
                box-shadow: none; 
            }
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background: #22c55e;
            color: white;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Invoice Header -->
        <div class="invoice-header">
            <div class="company-info">
                <div class="company-logo">🏭</div>
                <div class="company-name">${isArabic ? data.company.nameAr : data.company.nameEn}</div>
                <div class="company-details">
                    ${isArabic ? data.company.addressAr : data.company.addressEn}<br>
                    ${isArabic ? 'هاتف' : 'Phone'}: ${data.company.phone}<br>
                    ${isArabic ? 'بريد إلكتروني' : 'Email'}: ${data.company.email}<br>
                    ${isArabic ? 'الموقع الإلكتروني' : 'Website'}: ${data.company.website}
                </div>
            </div>
            <div class="invoice-title">
                <h1>${isArabic ? 'فاتورة' : 'INVOICE'}</h1>
                <div class="invoice-number">${data.invoice.number}</div>
                <div class="status-badge">${isArabic ? 'مدفوعة' : 'PAID'}</div>
            </div>
        </div>
        
        <!-- Invoice Meta Information -->
        <div class="invoice-meta">
            <div class="bill-to">
                <div class="section-title">${isArabic ? 'فاتورة إلى' : 'Bill To'}</div>
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">${data.customer.name}</div>
                ${data.customer.contact ? `<div>${isArabic ? 'جهة الاتصال' : 'Contact'}: ${data.customer.contact}</div>` : ''}
                ${data.customer.address ? `<div>${data.customer.address}</div>` : ''}
            </div>
            
            <div class="invoice-details">
                <div class="section-title">${isArabic ? 'تفاصيل الفاتورة' : 'Invoice Details'}</div>
                <div class="detail-row">
                    <span class="detail-label">${isArabic ? 'تاريخ الفاتورة:' : 'Invoice Date:'}</span>
                    <span>${data.invoice.date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span>
                    <span>${data.invoice.dueDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${isArabic ? 'العملة:' : 'Currency:'}</span>
                    <span>${data.invoice.currency}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${isArabic ? 'رقم السجل التجاري:' : 'CR Number:'}</span>
                    <span>${data.company.crNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${isArabic ? 'الرقم الضريبي:' : 'VAT Number:'}</span>
                    <span>${data.company.vatNumber}</span>
                </div>
            </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>${isArabic ? 'الوصف' : 'Description'}</th>
                    <th>${isArabic ? 'الكمية' : 'Quantity'}</th>
                    <th>${isArabic ? 'الوحدة' : 'Unit'}</th>
                    <th>${isArabic ? 'سعر الوحدة' : 'Unit Price'}</th>
                    <th>${isArabic ? 'المجموع' : 'Total'}</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity.toLocaleString()}</td>
                        <td>${item.unit}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td>${formatCurrency(item.totalPrice)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <!-- Financial Summary -->
        <div class="financial-summary">
            <div class="summary-row">
                <span>${isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span>${formatCurrency(data.financial.subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>${isArabic ? 'ضريبة القيمة المضافة' : 'VAT'} (${(data.financial.vatRate * 100).toFixed(0)}%):</span>
                <span>${formatCurrency(data.financial.vatAmount)}</span>
            </div>
            <div class="summary-row total">
                <span>${isArabic ? 'المجموع الإجمالي:' : 'Total Amount:'}</span>
                <span>${formatCurrency(data.financial.totalAmount)}</span>
            </div>
        </div>
        
        <!-- Terms and Conditions -->
        <div class="terms">
            <div class="section-title">${isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}</div>
            <p>${isArabic ? 'جميع المبيعات نهائية. يرجى الدفع خلال 30 يوماً من تاريخ الفاتورة.' : 'All sales are final. Payment is due within 30 days of invoice date.'}</p>
            <p>${isArabic ? 'في حالة التأخير في السداد، ستطبق رسوم إضافية بنسبة 1.5% شهرياً.' : 'Late payments will incur a 1.5% monthly service charge.'}</p>
        </div>
        
        <!-- Invoice Footer -->
        <div class="invoice-footer">
            <p>${isArabic ? 'شكراً لتعاملكم معنا!' : 'Thank you for your business!'}</p>
            <p>${isArabic ? 'هذه الفاتورة تم إنشاؤها إلكترونياً وهي صالحة بدون توقيع' : 'This invoice was generated electronically and is valid without signature'}</p>
        </div>
    </div>
</body>
</html>`;
}

// Event listeners
document.addEventListener('click', function(event) {
    // Close modal when clicking outside
    if (event.target.classList.contains('modal')) {
        const modalId = event.target.id;
        closeModal(modalId);
    }
});

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}