// Al-Wasiloon Factory Management System - Main JavaScript
class FactoryManagementApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.apiBase = './api';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadPage('dashboard');
  }

  setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        this.loadPage(page);
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-menu-overlay');

    mobileMenuBtn?.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });

    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });

    // Close mobile menu on navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          sidebar.classList.remove('open');
          overlay.classList.remove('show');
        }
      });
    });
  }

  async loadPage(pageName) {
    this.showLoading();
    this.hideMessages();
    
    // Update active navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

    this.currentPage = pageName;

    try {
      let content = '';
      switch (pageName) {
        case 'dashboard':
          content = await this.loadDashboard();
          break;
        case 'workers':
          content = await this.loadWorkers();
          break;
        case 'sales':
          content = await this.loadSales();
          break;
        case 'storage':
          content = await this.loadStorage();
          break;
        case 'expenses':
          content = await this.loadExpenses();
          break;
        case 'reports':
          content = await this.loadReports();
          break;
        case 'activity-logs':
          content = await this.loadActivityLogs();
          break;
        default:
          content = '<div>Page not found</div>';
      }

      document.getElementById('page-content').innerHTML = content;
      this.setupPageEventListeners();
    } catch (error) {
      this.showError('Failed to load page: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  async loadDashboard() {
    try {
      const dashboardData = await this.apiRequest('/dashboard.php');
      
      return `
        <div>
          <div class="card-header">
            <h1>Dashboard</h1>
          </div>

          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">$${(dashboardData.totalIncome || 0).toLocaleString()}</div>
              <div class="stat-label">Total Revenue</div>
              <div class="stat-change positive">+20.1% from last month</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">$${(dashboardData.totalExpenses || 0).toLocaleString()}</div>
              <div class="stat-label">Total Expenses</div>
              <div class="stat-change negative">+12% from last month</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">$${((dashboardData.totalIncome || 0) - (dashboardData.totalExpenses || 0)).toLocaleString()}</div>
              <div class="stat-label">Net Profit</div>
              <div class="stat-change positive">+8.1% from last month</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">${dashboardData.totalWorkers || 0}</div>
              <div class="stat-label">Active Workers</div>
              <div class="stat-change">All departments</div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="dashboard-grid">
            <div class="card">
              <div class="card-header">
                <h3>Recent Transactions</h3>
                <p style="font-size: 0.875rem; color: var(--muted-foreground);">Latest sales and expenses</p>
              </div>
              <div class="card-content">
                ${(dashboardData.recentTransactions || []).slice(0, 5).map(transaction => `
                  <div style="display: flex; justify-content: space-between; padding: 0.75rem; margin-bottom: 0.5rem; background: var(--muted); border-radius: var(--radius);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <i class="ri-${transaction.type === 'sale' ? 'shopping-cart' : 'money-dollar-circle'}-line" style="color: var(--${transaction.type === 'sale' ? 'accent' : 'destructive'});"></i>
                      <div>
                        <div style="font-weight: 500; font-size: 0.875rem;">${transaction.description || 'Transaction'}</div>
                        <div style="font-size: 0.75rem; color: var(--muted-foreground);">${transaction.date || 'No date'}</div>
                      </div>
                    </div>
                    <div style="font-weight: 600; color: var(--${transaction.type === 'sale' ? 'accent' : 'destructive'});">
                      ${transaction.type === 'sale' ? '+' : '-'}$${(transaction.amount || 0).toLocaleString()}
                    </div>
                  </div>
                `).join('') || '<p style="color: var(--muted-foreground);">No recent transactions</p>'}
              </div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <h3>Quick Actions</h3>
                <p style="font-size: 0.875rem; color: var(--muted-foreground);">Common tasks</p>
              </div>
              <div class="card-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <button onclick="app.loadPage('workers')" class="btn btn-primary" style="text-align: left; padding: 1rem;">
                    <i class="ri-team-line" style="display: block; margin-bottom: 0.5rem;"></i>
                    <span style="font-size: 0.875rem;">Manage Workers</span>
                  </button>
                  <button onclick="app.loadPage('sales')" class="btn btn-secondary" style="text-align: left; padding: 1rem;">
                    <i class="ri-shopping-cart-line" style="display: block; margin-bottom: 0.5rem;"></i>
                    <span style="font-size: 0.875rem;">Record Sale</span>
                  </button>
                  <button onclick="app.loadPage('storage')" class="btn btn-secondary" style="text-align: left; padding: 1rem;">
                    <i class="ri-box-line" style="display: block; margin-bottom: 0.5rem;"></i>
                    <span style="font-size: 0.875rem;">Check Storage</span>
                  </button>
                  <button onclick="app.loadPage('expenses')" class="btn btn-secondary" style="text-align: left; padding: 1rem;">
                    <i class="ri-money-dollar-circle-line" style="display: block; margin-bottom: 0.5rem;"></i>
                    <span style="font-size: 0.875rem;">Add Expense</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="card p-6"><p class="text-destructive">Error loading dashboard: ${error.message}</p></div>`;
    }
  }

  async loadWorkers() {
    try {
      const workers = await this.apiRequest('/workers.php');
      
      return `
        <div class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 class="font-heading text-3xl font-bold tracking-tight">Workers Management</h1>
            <button class="btn btn-primary" onclick="app.showAddWorkerModal()">
              <i class="ri-add-line mr-2"></i>Add Worker
            </button>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${workers.map(worker => `
                      <tr data-worker-id="${worker.id}">
                        <td class="font-medium">${worker.name}</td>
                        <td>${worker.role}</td>
                        <td>${worker.department}</td>
                        <td>$${parseInt(worker.salary).toLocaleString()}</td>
                        <td>
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }">
                            ${worker.status}
                          </span>
                        </td>
                        <td>
                          <div class="flex gap-2">
                            <button class="btn btn-secondary text-xs" onclick="app.editWorker(${worker.id})">
                              <i class="ri-edit-line"></i>
                            </button>
                            <button class="btn btn-destructive text-xs" onclick="app.deleteWorker(${worker.id})">
                              <i class="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="card p-6"><p class="text-destructive">Error loading workers: ${error.message}</p></div>`;
    }
  }

  async loadSales() {
    try {
      const sales = await this.apiRequest('/sales.php');
      
      return `
        <div class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 class="font-heading text-3xl font-bold tracking-tight">Sales Management</h1>
            <button class="btn btn-primary" onclick="app.showAddSaleModal()">
              <i class="ri-add-line mr-2"></i>Add Sale
            </button>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Client</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sales.map(sale => `
                      <tr data-sale-id="${sale.id}">
                        <td class="font-medium">${sale.product_name}</td>
                        <td>${sale.client_name}</td>
                        <td>${sale.quantity} units</td>
                        <td>$${parseFloat(sale.total_amount).toLocaleString()}</td>
                        <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
                        <td>
                          <div class="flex gap-2">
                            <button class="btn btn-secondary text-xs" onclick="app.editSale(${sale.id})">
                              <i class="ri-edit-line"></i>
                            </button>
                            <button class="btn btn-destructive text-xs" onclick="app.deleteSale(${sale.id})">
                              <i class="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="card p-6"><p class="text-destructive">Error loading sales: ${error.message}</p></div>`;
    }
  }

  async loadStorage() {
    try {
      const storage = await this.apiRequest('/storage.php');
      
      return `
        <div class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 class="font-heading text-3xl font-bold tracking-tight">Storage Management</h1>
            <button class="btn btn-primary" onclick="app.showAddStorageModal()">
              <i class="ri-add-line mr-2"></i>Add Item
            </button>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity (Tons)</th>
                      <th>Price per Ton</th>
                      <th>Dealer</th>
                      <th>Purchase Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${storage.map(item => `
                      <tr data-storage-id="${item.id}">
                        <td class="font-medium">${item.item_name}</td>
                        <td>${parseFloat(item.quantity_in_tons).toFixed(2)}</td>
                        <td>$${parseFloat(item.purchase_price_per_ton).toLocaleString()}</td>
                        <td>${item.dealer_name}</td>
                        <td>${new Date(item.purchase_date).toLocaleDateString()}</td>
                        <td>
                          <div class="flex gap-2">
                            <button class="btn btn-secondary text-xs" onclick="app.editStorage(${item.id})">
                              <i class="ri-edit-line"></i>
                            </button>
                            <button class="btn btn-destructive text-xs" onclick="app.deleteStorage(${item.id})">
                              <i class="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="card p-6"><p class="text-destructive">Error loading storage: ${error.message}</p></div>`;
    }
  }

  async loadExpenses() {
    try {
      const expenses = await this.apiRequest('/expenses.php');
      
      return `
        <div class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 class="font-heading text-3xl font-bold tracking-tight">Expenses Management</h1>
            <button class="btn btn-primary" onclick="app.showAddExpenseModal()">
              <i class="ri-add-line mr-2"></i>Add Expense
            </button>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${expenses.map(expense => `
                      <tr data-expense-id="${expense.id}">
                        <td class="font-medium">${expense.name}</td>
                        <td>$${parseFloat(expense.amount).toLocaleString()}</td>
                        <td>
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${expense.category}
                          </span>
                        </td>
                        <td>${new Date(expense.expense_date).toLocaleDateString()}</td>
                        <td>
                          <div class="flex gap-2">
                            <button class="btn btn-secondary text-xs" onclick="app.editExpense(${expense.id})">
                              <i class="ri-edit-line"></i>
                            </button>
                            <button class="btn btn-destructive text-xs" onclick="app.deleteExpense(${expense.id})">
                              <i class="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="card p-6"><p class="text-destructive">Error loading expenses: ${error.message}</p></div>`;
    }
  }

  async loadReports() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 class="font-heading text-3xl font-bold tracking-tight">Reports</h1>
        </div>
        <div class="card p-6">
          <p class="text-muted-foreground">Reports functionality coming soon...</p>
        </div>
      </div>
    `;
  }

  async loadActivityLogs() {
    try {
      const logs = await this.apiRequest('/activity-logs.php');
      
      return `
        <div class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 class="font-heading text-3xl font-bold tracking-tight">Activity Logs</h1>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="space-y-4">
                ${logs.map(log => `
                  <div class="flex items-start gap-3 p-4 border rounded-lg">
                    <div class="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div class="flex-1">
                      <h4 class="font-medium">${log.title}</h4>
                      <p class="text-sm text-muted-foreground mt-1">${log.description}</p>
                      <p class="text-xs text-muted-foreground mt-2">${new Date(log.log_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      return `<div class="card p-6"><p class="text-destructive">Error loading activity logs: ${error.message}</p></div>`;
    }
  }

  // API Functions
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiBase}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Modal Functions
  showModal(content) {
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  // Helper functions
  showLoading() {
    document.getElementById('loading-indicator').classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loading-indicator').classList.add('hidden');
  }

  showError(message) {
    document.getElementById('error-text').textContent = message;
    document.getElementById('error-message').classList.remove('hidden');
    setTimeout(() => this.hideMessages(), 5000);
  }

  showSuccess(message) {
    document.getElementById('success-text').textContent = message;
    document.getElementById('success-message').classList.remove('hidden');
    setTimeout(() => this.hideMessages(), 3000);
  }

  hideMessages() {
    document.getElementById('error-message').classList.add('hidden');
    document.getElementById('success-message').classList.add('hidden');
  }

  setupPageEventListeners() {
    // Setup modal close functionality
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.hideModal();
      }
    });
  }

  // CRUD Modal Functions
  showAddWorkerModal() {
    const content = `
      <div class="p-6">
        <h3 class="font-heading text-lg font-semibold mb-4">Add New Worker</h3>
        <form id="add-worker-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input type="text" name="name" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Role</label>
            <input type="text" name="role" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Department</label>
            <input type="text" name="department" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Salary</label>
            <input type="number" name="salary" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Hire Date</label>
            <input type="date" name="hire_date" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <input type="email" name="email" class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Phone</label>
            <input type="tel" name="phone" class="form-input w-full">
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn btn-primary flex-1">Add Worker</button>
            <button type="button" class="btn btn-secondary" onclick="app.hideModal()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    this.showModal(content);
    
    document.getElementById('add-worker-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        await this.apiRequest('/workers.php', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        this.showSuccess('Worker added successfully');
        this.hideModal();
        this.loadPage('workers');
      } catch (error) {
        this.showError('Failed to add worker: ' + error.message);
      }
    });
  }

  showAddStorageModal() {
    const content = `
      <div class="p-6">
        <h3 class="font-heading text-lg font-semibold mb-4">Add Storage Item</h3>
        <form id="add-storage-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Item Name</label>
            <input type="text" name="item_name" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Quantity (Tons)</label>
            <input type="number" step="0.01" name="quantity_in_tons" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Price per Ton</label>
            <input type="number" step="0.01" name="purchase_price_per_ton" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Dealer Name</label>
            <input type="text" name="dealer_name" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Dealer Contact</label>
            <input type="text" name="dealer_contact" class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Purchase Date</label>
            <input type="date" name="purchase_date" required class="form-input w-full">
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn btn-primary flex-1">Add Item</button>
            <button type="button" class="btn btn-secondary" onclick="app.hideModal()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    this.showModal(content);
    
    document.getElementById('add-storage-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        await this.apiRequest('/storage.php', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        this.showSuccess('Storage item added successfully');
        this.hideModal();
        this.loadPage('storage');
      } catch (error) {
        this.showError('Failed to add storage item: ' + error.message);
      }
    });
  }

  showAddExpenseModal() {
    const content = `
      <div class="p-6">
        <h3 class="font-heading text-lg font-semibold mb-4">Add Expense</h3>
        <form id="add-expense-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Expense Name</label>
            <input type="text" name="name" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Amount</label>
            <input type="number" step="0.01" name="amount" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Category</label>
            <select name="category" required class="form-input w-full">
              <option value="">Select Category</option>
              <option value="Utilities">Utilities</option>
              <option value="Salaries">Salaries</option>
              <option value="Maintenance">Maintenance</option>
              <option value="RawMaterials">Raw Materials</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Expense Date</label>
            <input type="date" name="expense_date" required class="form-input w-full">
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn btn-primary flex-1">Add Expense</button>
            <button type="button" class="btn btn-secondary" onclick="app.hideModal()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    this.showModal(content);
    
    document.getElementById('add-expense-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        await this.apiRequest('/expenses.php', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        this.showSuccess('Expense added successfully');
        this.hideModal();
        this.loadPage('expenses');
      } catch (error) {
        this.showError('Failed to add expense: ' + error.message);
      }
    });
  }

  showAddSaleModal() {
    const content = `
      <div class="p-6">
        <h3 class="font-heading text-lg font-semibold mb-4">Add New Sale</h3>
        <form id="add-sale-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Product Name</label>
            <input type="text" name="product_name" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Client Name</label>
            <input type="text" name="client_name" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Quantity</label>
            <input type="number" name="quantity" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Total Amount</label>
            <input type="number" step="0.01" name="total_amount" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Sale Date</label>
            <input type="date" name="sale_date" required class="form-input w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Client Contact</label>
            <input type="text" name="client_contact" class="form-input w-full">
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn btn-primary flex-1">Add Sale</button>
            <button type="button" class="btn btn-secondary" onclick="app.hideModal()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    this.showModal(content);
    
    document.getElementById('add-sale-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        await this.apiRequest('/sales.php', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        this.showSuccess('Sale added successfully');
        this.hideModal();
        this.loadPage('sales');
      } catch (error) {
        this.showError('Failed to add sale: ' + error.message);
      }
    });
  }

  async deleteWorker(id) {
    if (confirm('Are you sure you want to delete this worker?')) {
      try {
        await this.apiRequest(`/workers.php?id=${id}`, { method: 'DELETE' });
        this.showSuccess('Worker deleted successfully');
        this.loadPage('workers');
      } catch (error) {
        this.showError('Failed to delete worker: ' + error.message);
      }
    }
  }

  async deleteSale(id) {
    if (confirm('Are you sure you want to delete this sale?')) {
      try {
        await this.apiRequest(`/sales.php?id=${id}`, { method: 'DELETE' });
        this.showSuccess('Sale deleted successfully');
        this.loadPage('sales');
      } catch (error) {
        this.showError('Failed to delete sale: ' + error.message);
      }
    }
  }

  async deleteStorage(id) {
    if (confirm('Are you sure you want to delete this storage item?')) {
      try {
        await this.apiRequest(`/storage.php?id=${id}`, { method: 'DELETE' });
        this.showSuccess('Storage item deleted successfully');
        this.loadPage('storage');
      } catch (error) {
        this.showError('Failed to delete storage item: ' + error.message);
      }
    }
  }

  async deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await this.apiRequest(`/expenses.php?id=${id}`, { method: 'DELETE' });
        this.showSuccess('Expense deleted successfully');
        this.loadPage('expenses');
      } catch (error) {
        this.showError('Failed to delete expense: ' + error.message);
      }
    }
  }

  async editWorker(id) {
    this.showError('Edit functionality coming soon');
  }

  async editSale(id) {
    this.showError('Edit functionality coming soon');
  }

  async editStorage(id) {
    this.showError('Edit functionality coming soon');
  }

  async editExpense(id) {
    this.showError('Edit functionality coming soon');
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new FactoryManagementApp();
});