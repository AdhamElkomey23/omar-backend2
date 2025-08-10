// Sales page JavaScript

class SalesManager {
    constructor() {
        this.sales = [];
        this.storageItems = [];
        this.currentSale = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderSales();
            this.loadProductOptions();
        } catch (error) {
            console.error('Sales initialization failed:', error);
            Utils.showAlert('فشل في تحميل بيانات المبيعات', 'error');
        }
    }

    async loadData() {
        try {
            // Load sales and storage items
            const [salesData, storageData] = await Promise.all([
                API.get('sales.php'),
                API.get('storage.php')
            ]);
            
            this.sales = salesData || [];
            this.storageItems = storageData || [];
        } catch (error) {
            console.error('Failed to load data:', error);
            this.sales = [];
            this.storageItems = [];
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('saleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaleSubmit();
        });

        // Filters
        document.getElementById('productFilter').addEventListener('change', () => this.renderSales());
        document.getElementById('clientFilter').addEventListener('input', Utils.debounce(() => this.renderSales(), 500));
        document.getElementById('dateFromFilter').addEventListener('change', () => this.renderSales());
        document.getElementById('dateToFilter').addEventListener('change', () => this.renderSales());

        // Set current date as default
        document.getElementById('saleDate').value = Utils.getCurrentDate();
    }

    loadProductOptions() {
        const productSelect = document.getElementById('productName');
        const productFilter = document.getElementById('productFilter');
        
        // Clear existing options
        productSelect.innerHTML = '<option value="">اختر المنتج</option>';
        productFilter.innerHTML = '<option value="">جميع المنتجات</option>';
        
        // Get available products (only those with quantity > 0)
        const availableProducts = this.getAvailableProducts();
        
        availableProducts.forEach(product => {
            const option = `<option value="${product.itemName}">${product.itemName} (${product.totalQuantity} طن)</option>`;
            productSelect.innerHTML += option;
            productFilter.innerHTML += `<option value="${product.itemName}">${product.itemName}</option>`;
        });
    }

    getAvailableProducts() {
        // Group storage items by name and calculate total quantities
        const productMap = new Map();
        
        this.storageItems.forEach(item => {
            if (item.quantityInTons > 0) { // Only include items with available quantity
                if (productMap.has(item.itemName)) {
                    const existing = productMap.get(item.itemName);
                    existing.totalQuantity += parseFloat(item.quantityInTons);
                    existing.avgPrice = (existing.avgPrice + parseFloat(item.purchasePricePerTon)) / 2;
                } else {
                    productMap.set(item.itemName, {
                        itemName: item.itemName,
                        totalQuantity: parseFloat(item.quantityInTons),
                        avgPrice: parseFloat(item.purchasePricePerTon)
                    });
                }
            }
        });
        
        return Array.from(productMap.values());
    }

    renderSales() {
        const tbody = document.getElementById('salesTableBody');
        const filteredSales = this.getFilteredSales();
        
        if (filteredSales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-gray-500">
                            <i class="fas fa-chart-line text-4xl mb-2"></i>
                            <p>لا توجد مبيعات مسجلة</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const salesHTML = filteredSales.map((sale, index) => `
            <tr>
                <td class="font-medium">${index + 1}</td>
                <td>${sale.productName}</td>
                <td>
                    ${sale.quantityTons || 0} طن
                    ${sale.quantityKg ? ` + ${sale.quantityKg} كجم` : ''}
                </td>
                <td class="font-semibold text-green-600">${Utils.formatCurrency(sale.totalAmount)}</td>
                <td>
                    <div>
                        <div class="font-medium">${sale.clientName}</div>
                        ${sale.clientContact ? `<div class="text-sm text-gray-500">${sale.clientContact}</div>` : ''}
                    </div>
                </td>
                <td>${Utils.formatDate(sale.saleDate)}</td>
                <td>
                    <div class="flex items-center space-x-reverse space-x-2">
                        <button onclick="salesManager.editSale(${sale.id})" class="text-blue-600 hover:text-blue-700" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="salesManager.generateInvoice(${sale.id})" class="text-green-600 hover:text-green-700" title="طباعة فاتورة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button onclick="salesManager.deleteSale(${sale.id})" class="text-red-600 hover:text-red-700 delete-btn" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = salesHTML;
    }

    getFilteredSales() {
        let filtered = [...this.sales];
        
        // Filter by product
        const productFilter = document.getElementById('productFilter').value;
        if (productFilter) {
            filtered = filtered.filter(sale => sale.productName === productFilter);
        }
        
        // Filter by client
        const clientFilter = document.getElementById('clientFilter').value.toLowerCase();
        if (clientFilter) {
            filtered = filtered.filter(sale => 
                sale.clientName.toLowerCase().includes(clientFilter)
            );
        }
        
        // Filter by date range
        const dateFrom = document.getElementById('dateFromFilter').value;
        const dateTo = document.getElementById('dateToFilter').value;
        
        if (dateFrom) {
            filtered = filtered.filter(sale => new Date(sale.saleDate) >= new Date(dateFrom));
        }
        
        if (dateTo) {
            filtered = filtered.filter(sale => new Date(sale.saleDate) <= new Date(dateTo));
        }
        
        // Sort by date (newest first)
        return filtered.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
    }

    async handleSaleSubmit() {
        const formData = new FormData(document.getElementById('saleForm'));
        const saleData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!Utils.validateForm(document.getElementById('saleForm'))) {
            return;
        }
        
        // Convert numeric fields
        saleData.quantityTons = parseFloat(saleData.quantityTons) || 0;
        saleData.quantityKg = parseFloat(saleData.quantityKg) || 0;
        saleData.totalAmount = parseFloat(saleData.totalAmount) || 0;
        
        // Validate quantities
        if (saleData.quantityTons === 0 && saleData.quantityKg === 0) {
            Utils.showAlert('يجب إدخال كمية المنتج', 'error');
            return;
        }
        
        // Check available quantity
        const availableProducts = this.getAvailableProducts();
        const selectedProduct = availableProducts.find(p => p.itemName === saleData.productName);
        
        if (!selectedProduct) {
            Utils.showAlert('المنتج المحدد غير متوفر في المخزون', 'error');
            return;
        }
        
        const requestedQuantityInTons = saleData.quantityTons + (saleData.quantityKg / 1000);
        if (requestedQuantityInTons > selectedProduct.totalQuantity) {
            Utils.showAlert(`الكمية المطلوبة (${requestedQuantityInTons} طن) أكبر من الكمية المتوفرة (${selectedProduct.totalQuantity} طن)`, 'error');
            return;
        }

        try {
            Utils.showLoading();
            
            if (saleData.id) {
                // Update existing sale
                await API.put(`sales.php?id=${saleData.id}`, saleData);
                Utils.showAlert('تم تحديث البيع بنجاح', 'success');
            } else {
                // Create new sale
                await API.post('sales.php', saleData);
                Utils.showAlert('تم تسجيل البيع بنجاح', 'success');
            }
            
            // Refresh data
            await this.loadData();
            this.renderSales();
            this.loadProductOptions();
            this.closeSaleModal();
            
        } catch (error) {
            console.error('Sale submission failed:', error);
            Utils.showAlert('فشل في حفظ البيع. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    openAddSaleModal() {
        this.currentSale = null;
        document.getElementById('saleModalTitle').textContent = 'تسجيل بيع جديد';
        document.getElementById('saleForm').reset();
        document.getElementById('saleId').value = '';
        document.getElementById('saleDate').value = Utils.getCurrentDate();
        document.getElementById('saleModal').classList.remove('hidden');
    }

    editSale(saleId) {
        const sale = this.sales.find(s => s.id == saleId);
        if (!sale) return;
        
        this.currentSale = sale;
        document.getElementById('saleModalTitle').textContent = 'تعديل البيع';
        
        // Fill form
        document.getElementById('saleId').value = sale.id;
        document.getElementById('productName').value = sale.productName;
        document.getElementById('clientName').value = sale.clientName;
        document.getElementById('clientContact').value = sale.clientContact || '';
        document.getElementById('saleDate').value = sale.saleDate;
        document.getElementById('quantityTons').value = sale.quantityTons || 0;
        document.getElementById('quantityKg').value = sale.quantityKg || 0;
        document.getElementById('totalAmount').value = sale.totalAmount;
        
        document.getElementById('saleModal').classList.remove('hidden');
    }

    closeSaleModal() {
        document.getElementById('saleModal').classList.add('hidden');
        this.currentSale = null;
    }

    async deleteSale(saleId) {
        const sale = this.sales.find(s => s.id == saleId);
        if (!sale) return;
        
        if (!confirm(`هل أنت متأكد من حذف بيع ${sale.productName} للعميل ${sale.clientName}؟`)) {
            return;
        }
        
        try {
            Utils.showLoading();
            await API.delete(`sales.php?id=${saleId}`);
            Utils.showAlert('تم حذف البيع بنجاح', 'success');
            
            // Refresh data
            await this.loadData();
            this.renderSales();
            this.loadProductOptions();
            
        } catch (error) {
            console.error('Delete sale failed:', error);
            Utils.showAlert('فشل في حذف البيع. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    generateInvoice(saleId) {
        const sale = this.sales.find(s => s.id == saleId);
        if (!sale) return;
        
        const invoiceHTML = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة رقم ${sale.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>الواصلون للتعدين والصناعات الكيماوية</h1>
                    <h2>فاتورة بيع</h2>
                    <p>التاريخ: ${Utils.formatDate(new Date().toISOString())}</p>
                </div>
                
                <div class="invoice-details">
                    <h3>فاتورة رقم: ${sale.id}</h3>
                    <p><strong>العميل:</strong> ${sale.clientName}</p>
                    ${sale.clientContact ? `<p><strong>رقم الاتصال:</strong> ${sale.clientContact}</p>` : ''}
                    <p><strong>تاريخ البيع:</strong> ${Utils.formatDate(sale.saleDate)}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>الكمية</th>
                            <th>المبلغ الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${sale.productName}</td>
                            <td>${sale.quantityTons || 0} طن ${sale.quantityKg ? `+ ${sale.quantityKg} كجم` : ''}</td>
                            <td>${Utils.formatCurrency(sale.totalAmount)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="total">
                    <p>المبلغ الإجمالي: ${Utils.formatCurrency(sale.totalAmount)}</p>
                </div>
                
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
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
    }
}

// Global functions for modal
function openAddSaleModal() {
    window.salesManager.openAddSaleModal();
}

function closeSaleModal() {
    window.salesManager.closeSaleModal();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.salesManager = new SalesManager();
});