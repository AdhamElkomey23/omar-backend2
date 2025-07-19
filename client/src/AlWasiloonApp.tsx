import React, { useState, useEffect } from 'react';
import './AlWasiloon.css';

// Types
interface Sale {
  id: string;
  productName: string;
  customerName: string;
  quantity: number;
  price: number;
  date: string;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface Worker {
  id: string;
  name: string;
  position: string;
  salary: number;
  joinDate: string;
}

interface StorageItem {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  minStock: number;
}

interface AppData {
  sales: Sale[];
  expenses: Expense[];
  workers: Worker[];
  storage: StorageItem[];
  language: 'ar' | 'en';
  currentTimeFilter: number;
}

// Translation data
const translations = {
  ar: {
    home: 'الرئيسية',
    dashboard: 'لوحة التحكم',
    sales: 'المبيعات',
    expenses: 'المصروفات',
    workers: 'العمال',
    storage: 'المخزون',
    reports: 'التقارير',
    settings: 'الإعدادات',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    productName: 'اسم المنتج',
    quantity: 'الكمية',
    price: 'السعر',
    customerName: 'اسم العميل',
    date: 'التاريخ',
    totalSales: 'إجمالي المبيعات',
    totalExpenses: 'إجمالي المصروفات',
    totalWorkers: 'عدد العمال',
    lowStock: 'مخزون منخفض',
    addSale: 'إضافة مبيعات',
    addExpense: 'إضافة مصروف',
    addWorker: 'إضافة عامل',
    addStorage: 'إضافة مخزن',
    companyName: 'الواصلون للصناعات التعدينية والكيميائية',
    companySlogan: 'نظام إدارة المصنع المتكامل',
    welcomeMessage: 'مرحباً بك في نظام إدارة مصنع الواصلون',
    quickOverview: 'نظرة سريعة',
    mainFeatures: 'الميزات الرئيسية',
    manageSalesDesc: 'إدارة جميع عمليات البيع وتتبع الأرباح',
    manageExpensesDesc: 'تتبع وإدارة جميع مصروفات المصنع',
    manageWorkersDesc: 'إدارة بيانات العمال والرواتب',
    manageStorageDesc: 'متابعة المخزون وتحديد المستويات المنخفضة'
  },
  en: {
    home: 'Home',
    dashboard: 'Dashboard',
    sales: 'Sales',
    expenses: 'Expenses',
    workers: 'Workers',
    storage: 'Storage',
    reports: 'Reports',
    settings: 'Settings',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    productName: 'Product Name',
    quantity: 'Quantity',
    price: 'Price',
    customerName: 'Customer Name',
    date: 'Date',
    totalSales: 'Total Sales',
    totalExpenses: 'Total Expenses',
    totalWorkers: 'Total Workers',
    lowStock: 'Low Stock',
    addSale: 'Add Sale',
    addExpense: 'Add Expense',
    addWorker: 'Add Worker',
    addStorage: 'Add Storage',
    companyName: 'Al-Wasiloon Mining and Chemical Industries',
    companySlogan: 'Integrated Factory Management System',
    welcomeMessage: 'Welcome to Al-Wasiloon Factory Management System',
    quickOverview: 'Quick Overview',
    mainFeatures: 'Main Features',
    manageSalesDesc: 'Manage all sales operations and track profits',
    manageExpensesDesc: 'Track and manage all factory expenses',
    manageWorkersDesc: 'Manage worker data and salaries',
    manageStorageDesc: 'Monitor inventory and identify low stock levels'
  }
};

const MATERIALS = ['الجبس', 'الفلسبار', 'الكاولينا', 'التلك', 'كاربونات الكالسيوم'];

export const AlWasiloonApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [appData, setAppData] = useState<AppData>(() => ({
    sales: JSON.parse(localStorage.getItem('al-wasiloon-sales') || '[]'),
    expenses: JSON.parse(localStorage.getItem('al-wasiloon-expenses') || '[]'),
    workers: JSON.parse(localStorage.getItem('al-wasiloon-workers') || '[]'),
    storage: JSON.parse(localStorage.getItem('al-wasiloon-storage') || '[]'),
    language: (localStorage.getItem('al-wasiloon-language') as 'ar' | 'en') || 'ar',
    currentTimeFilter: 7
  }));

  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentForm, setCurrentForm] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');

  // Save data to localStorage whenever appData changes
  useEffect(() => {
    localStorage.setItem('al-wasiloon-sales', JSON.stringify(appData.sales));
    localStorage.setItem('al-wasiloon-expenses', JSON.stringify(appData.expenses));
    localStorage.setItem('al-wasiloon-workers', JSON.stringify(appData.workers));
    localStorage.setItem('al-wasiloon-storage', JSON.stringify(appData.storage));
    localStorage.setItem('al-wasiloon-language', appData.language);
  }, [appData]);

  const t = translations[appData.language];

  const toggleLanguage = () => {
    setAppData(prev => ({
      ...prev,
      language: prev.language === 'ar' ? 'en' : 'ar'
    }));
  };

  const calculateTotals = () => {
    const totalSales = appData.sales.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    const totalExpenses = appData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const lowStockItems = appData.storage.filter(item => item.quantity <= item.minStock).length;
    
    return {
      totalSales,
      totalExpenses,
      profit: totalSales - totalExpenses,
      totalWorkers: appData.workers.length,
      lowStockItems
    };
  };

  const totals = calculateTotals();

  const openModal = (formType: string, id?: string) => {
    setCurrentForm(formType);
    setEditingId(id || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentForm('');
    setEditingId('');
  };

  const handleFormSubmit = (formData: any) => {
    const id = editingId || Date.now().toString();
    
    switch (currentForm) {
      case 'sale':
        if (editingId) {
          setAppData(prev => ({
            ...prev,
            sales: prev.sales.map(sale => 
              sale.id === id ? { ...formData, id } : sale
            )
          }));
        } else {
          setAppData(prev => ({
            ...prev,
            sales: [...prev.sales, { ...formData, id }]
          }));
        }
        break;
      case 'expense':
        if (editingId) {
          setAppData(prev => ({
            ...prev,
            expenses: prev.expenses.map(expense => 
              expense.id === id ? { ...formData, id } : expense
            )
          }));
        } else {
          setAppData(prev => ({
            ...prev,
            expenses: [...prev.expenses, { ...formData, id }]
          }));
        }
        break;
      case 'worker':
        if (editingId) {
          setAppData(prev => ({
            ...prev,
            workers: prev.workers.map(worker => 
              worker.id === id ? { ...formData, id } : worker
            )
          }));
        } else {
          setAppData(prev => ({
            ...prev,
            workers: [...prev.workers, { ...formData, id }]
          }));
        }
        break;
      case 'storage':
        if (editingId) {
          setAppData(prev => ({
            ...prev,
            storage: prev.storage.map(item => 
              item.id === id ? { ...formData, id } : item
            )
          }));
        } else {
          setAppData(prev => ({
            ...prev,
            storage: [...prev.storage, { ...formData, id }]
          }));
        }
        break;
    }
    
    closeModal();
  };

  const handleDelete = (type: string, id: string) => {
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
      switch (type) {
        case 'sale':
          setAppData(prev => ({
            ...prev,
            sales: prev.sales.filter(sale => sale.id !== id)
          }));
          break;
        case 'expense':
          setAppData(prev => ({
            ...prev,
            expenses: prev.expenses.filter(expense => expense.id !== id)
          }));
          break;
        case 'worker':
          setAppData(prev => ({
            ...prev,
            workers: prev.workers.filter(worker => worker.id !== id)
          }));
          break;
        case 'storage':
          setAppData(prev => ({
            ...prev,
            storage: prev.storage.filter(item => item.id !== id)
          }));
          break;
      }
    }
  };

  return (
    <div className="app-container" dir={appData.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <div>
              <div className="app-title">{t.companyName}</div>
              <div className="app-subtitle">{t.companySlogan}</div>
            </div>
          </div>
          <div className="version-badge">الإصدار 2.0</div>
        </div>

        <nav className="nav-section">
          <button 
            className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <span className="nav-icon">🏠</span>
            {t.home}
          </button>
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">📊</span>
            {t.dashboard}
          </button>
          <button 
            className={`nav-item ${currentPage === 'sales' ? 'active' : ''}`}
            onClick={() => setCurrentPage('sales')}
          >
            <span className="nav-icon">💰</span>
            {t.sales}
          </button>
          <button 
            className={`nav-item ${currentPage === 'expenses' ? 'active' : ''}`}
            onClick={() => setCurrentPage('expenses')}
          >
            <span className="nav-icon">💸</span>
            {t.expenses}
          </button>
          <button 
            className={`nav-item ${currentPage === 'workers' ? 'active' : ''}`}
            onClick={() => setCurrentPage('workers')}
          >
            <span className="nav-icon">👷</span>
            {t.workers}
          </button>
          <button 
            className={`nav-item ${currentPage === 'storage' ? 'active' : ''}`}
            onClick={() => setCurrentPage('storage')}
          >
            <span className="nav-icon">📦</span>
            {t.storage}
          </button>
          <button 
            className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => setCurrentPage('reports')}
          >
            <span className="nav-icon">📋</span>
            {t.reports}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="language-toggle" onClick={toggleLanguage}>
            {appData.language === 'ar' ? 'EN' : 'العربية'}
          </button>
          <div className="footer-text">
            © 2024 Al-Wasiloon Industries
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="navbar">
          <div className="page-indicator">
            {currentPage === 'home' && t.home}
            {currentPage === 'dashboard' && t.dashboard}
            {currentPage === 'sales' && t.sales}
            {currentPage === 'expenses' && t.expenses}
            {currentPage === 'workers' && t.workers}
            {currentPage === 'storage' && t.storage}
            {currentPage === 'reports' && t.reports}
          </div>
          <div className="user-info">
            <span>المدير العام</span>
            <span>|</span>
            <span>{new Date().toLocaleDateString('ar-SA')}</span>
          </div>
        </div>

        <div className="content-area">
          {/* Home Page */}
          {currentPage === 'home' && (
            <div className="page active">
              <div className="hero-section">
                <div className="hero-content">
                  <div className="hero-logo">🏭</div>
                  <h1 className="hero-title">{t.companyName}</h1>
                  <p className="hero-subtitle">{t.welcomeMessage}</p>
                  <button className="hero-button" onClick={() => setCurrentPage('dashboard')}>
                    {t.dashboard}
                  </button>
                </div>
              </div>

              <div className="quick-overview">
                <h2 className="overview-title">{t.quickOverview}</h2>
                <div className="overview-grid">
                  <div className="overview-card">
                    <div className="overview-icon">💰</div>
                    <div className="overview-value">{totals.totalSales.toLocaleString()}</div>
                    <div className="overview-label">{t.totalSales}</div>
                  </div>
                  <div className="overview-card">
                    <div className="overview-icon">💸</div>
                    <div className="overview-value">{totals.totalExpenses.toLocaleString()}</div>
                    <div className="overview-label">{t.totalExpenses}</div>
                  </div>
                  <div className="overview-card">
                    <div className="overview-icon">👷</div>
                    <div className="overview-value">{totals.totalWorkers}</div>
                    <div className="overview-label">{t.totalWorkers}</div>
                  </div>
                  <div className="overview-card">
                    <div className="overview-icon">⚠️</div>
                    <div className="overview-value">{totals.lowStockItems}</div>
                    <div className="overview-label">{t.lowStock}</div>
                  </div>
                </div>
              </div>

              <div className="main-features">
                <h2 className="features-title">{t.mainFeatures}</h2>
                <div className="features-grid">
                  <div className="feature-card" onClick={() => setCurrentPage('sales')}>
                    <span className="feature-icon">💰</span>
                    <h3 className="feature-title">{t.sales}</h3>
                    <p className="feature-description">{t.manageSalesDesc}</p>
                    <button className="feature-button">{t.sales}</button>
                  </div>
                  <div className="feature-card" onClick={() => setCurrentPage('expenses')}>
                    <span className="feature-icon">💸</span>
                    <h3 className="feature-title">{t.expenses}</h3>
                    <p className="feature-description">{t.manageExpensesDesc}</p>
                    <button className="feature-button">{t.expenses}</button>
                  </div>
                  <div className="feature-card" onClick={() => setCurrentPage('workers')}>
                    <span className="feature-icon">👷</span>
                    <h3 className="feature-title">{t.workers}</h3>
                    <p className="feature-description">{t.manageWorkersDesc}</p>
                    <button className="feature-button">{t.workers}</button>
                  </div>
                  <div className="feature-card" onClick={() => setCurrentPage('storage')}>
                    <span className="feature-icon">📦</span>
                    <h3 className="feature-title">{t.storage}</h3>
                    <p className="feature-description">{t.manageStorageDesc}</p>
                    <button className="feature-button">{t.storage}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Page */}
          {currentPage === 'sales' && (
            <div className="page active">
              <div className="page-header">
                <h1 className="page-title">{t.sales}</h1>
                <button className="btn btn-primary" onClick={() => openModal('sale')}>
                  {t.addSale}
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.productName}</th>
                      <th>{t.customerName}</th>
                      <th>{t.quantity}</th>
                      <th>{t.price}</th>
                      <th>{t.date}</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appData.sales.map(sale => (
                      <tr key={sale.id}>
                        <td>{sale.productName}</td>
                        <td>{sale.customerName}</td>
                        <td>{sale.quantity}</td>
                        <td>{sale.price.toLocaleString()}</td>
                        <td>{sale.date}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => openModal('sale', sale.id)}
                          >
                            {t.edit}
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete('sale', sale.id)}
                          >
                            {t.delete}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other pages would be implemented similarly */}
          {/* For brevity, I'll show the structure for other pages */}
          
          {currentPage === 'expenses' && (
            <div className="page active">
              <div className="page-header">
                <h1 className="page-title">{t.expenses}</h1>
                <button className="btn btn-primary" onClick={() => openModal('expense')}>
                  {t.addExpense}
                </button>
              </div>
              {/* Expenses table implementation */}
            </div>
          )}
        </div>
      </div>

      {/* Modal for forms */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{currentForm === 'sale' ? t.addSale : currentForm === 'expense' ? t.addExpense : t.add}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {/* Form implementation would go here */}
              <p>Form for {currentForm}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};