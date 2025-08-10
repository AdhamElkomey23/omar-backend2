// Dashboard JavaScript

class Dashboard {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        try {
            Utils.showLoading();
            await this.loadDashboardData();
            this.renderStats();
            this.renderCharts();
            this.renderRecentActivity();
            Utils.hideLoading();
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            Utils.hideLoading();
            Utils.showAlert('فشل في تحميل بيانات لوحة التحكم', 'error');
        }
    }

    async loadDashboardData() {
        try {
            this.data = await API.get('dashboard.php');
        } catch (error) {
            // Fallback to empty data
            this.data = {
                totalIncome: 0,
                totalExpenses: 0,
                profit: 0,
                storageItems: 0,
                recentSales: [],
                topProducts: [],
                recentActivity: []
            };
        }
    }

    renderStats() {
        // Update stat cards
        document.getElementById('totalIncome').textContent = Utils.formatCurrency(this.data.totalIncome);
        document.getElementById('totalExpenses').textContent = Utils.formatCurrency(this.data.totalExpenses);
        document.getElementById('profit').textContent = Utils.formatCurrency(this.data.profit);
        document.getElementById('storageItems').textContent = Utils.formatNumber(this.data.storageItems);
        
        // Update profit color based on value
        const profitElement = document.getElementById('profit');
        if (this.data.profit > 0) {
            profitElement.classList.add('text-green-600');
            profitElement.classList.remove('text-red-600');
        } else if (this.data.profit < 0) {
            profitElement.classList.add('text-red-600');
            profitElement.classList.remove('text-green-600');
        }
    }

    renderCharts() {
        this.renderRecentSales();
        this.renderTopProducts();
    }

    renderRecentSales() {
        const container = document.getElementById('recentSales');
        
        if (!this.data.recentSales || this.data.recentSales.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-chart-line text-4xl mb-2"></i>
                    <p>لا توجد مبيعات حديثة</p>
                </div>
            `;
            return;
        }

        const salesHTML = this.data.recentSales.map(sale => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                    <h4 class="font-medium text-gray-900">${sale.productName}</h4>
                    <p class="text-sm text-gray-600">${sale.clientName}</p>
                    <p class="text-xs text-gray-500">${Utils.formatDate(sale.saleDate)}</p>
                </div>
                <div class="text-left">
                    <p class="font-semibold text-green-600">${Utils.formatCurrency(sale.totalAmount)}</p>
                    <p class="text-sm text-gray-600">${sale.quantityTons} طن</p>
                </div>
            </div>
        `).join('');

        container.innerHTML = salesHTML;
    }

    renderTopProducts() {
        const container = document.getElementById('topProducts');
        
        if (!this.data.topProducts || this.data.topProducts.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-boxes text-4xl mb-2"></i>
                    <p>لا توجد بيانات متاحة</p>
                </div>
            `;
            return;
        }

        const productsHTML = this.data.topProducts.map((product, index) => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <div class="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-semibold text-amber-600">${index + 1}</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">${product.productName}</h4>
                        <p class="text-sm text-gray-600">${product.totalSold} طن مباع</p>
                    </div>
                </div>
                <div class="text-left">
                    <p class="font-semibold text-green-600">${Utils.formatCurrency(product.totalRevenue)}</p>
                </div>
            </div>
        `).join('');

        container.innerHTML = productsHTML;
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        
        if (!this.data.recentActivity || this.data.recentActivity.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-clock text-4xl mb-2"></i>
                    <p>لا توجد أنشطة حديثة</p>
                </div>
            `;
            return;
        }

        const activitiesHTML = this.data.recentActivity.map(activity => `
            <div class="flex items-start p-4 border-b border-gray-200 last:border-b-0">
                <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <i class="fas ${this.getActivityIcon(activity.type)} text-blue-600"></i>
                </div>
                <div class="flex-grow">
                    <p class="text-sm text-gray-900">${activity.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${Utils.formatDate(activity.date)}</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="badge badge-${this.getActivityBadgeType(activity.type)}">${activity.type}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
    }

    getActivityIcon(type) {
        const icons = {
            'sale': 'fa-shopping-cart',
            'expense': 'fa-credit-card',
            'storage': 'fa-warehouse',
            'worker': 'fa-user',
            'system': 'fa-cog'
        };
        return icons[type] || 'fa-info-circle';
    }

    getActivityBadgeType(type) {
        const types = {
            'sale': 'success',
            'expense': 'error',
            'storage': 'info',
            'worker': 'warning',
            'system': 'gray'
        };
        return types[type] || 'gray';
    }

    // Refresh dashboard data
    async refresh() {
        try {
            Utils.showLoading();
            await this.loadDashboardData();
            this.renderStats();
            this.renderCharts();
            this.renderRecentActivity();
            Utils.hideLoading();
            Utils.showAlert('تم تحديث البيانات بنجاح', 'success');
        } catch (error) {
            console.error('Dashboard refresh failed:', error);
            Utils.hideLoading();
            Utils.showAlert('فشل في تحديث البيانات', 'error');
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Auto refresh every 5 minutes
    setInterval(() => {
        window.dashboard.refresh();
    }, 300000);
});

// Export for global access
window.Dashboard = Dashboard;