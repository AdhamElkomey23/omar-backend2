// Storage page JavaScript

class StorageManager {
    constructor() {
        this.storageItems = [];
        this.filteredItems = [];
        this.currentItem = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderStorage();
            this.updateSummary();
        } catch (error) {
            console.error('Storage initialization failed:', error);
            Utils.showAlert('فشل في تحميل بيانات المخزون', 'error');
        }
    }

    async loadData() {
        try {
            this.storageItems = await API.get('storage.php') || [];
            this.filteredItems = [...this.storageItems];
        } catch (error) {
            console.error('Failed to load storage data:', error);
            this.storageItems = [];
            this.filteredItems = [];
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('storageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStorageSubmit();
        });

        document.getElementById('quantityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuantityAdjustment();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', Utils.debounce((e) => {
            this.filterItems(e.target.value);
        }, 300));

        // Set current date as default
        document.getElementById('purchaseDate').value = Utils.getCurrentDate();
    }

    filterItems(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredItems = this.storageItems.filter(item =>
            item.item_name.toLowerCase().includes(term) ||
            item.dealer_name.toLowerCase().includes(term)
        );
        this.renderStorage();
    }

    renderStorage() {
        const tbody = document.getElementById('storageTableBody');
        
        if (this.filteredItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8">
                        <div class="text-gray-500">
                            <i class="fas fa-warehouse text-4xl mb-2"></i>
                            <p>لا توجد عناصر في المخزون</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const storageHTML = this.filteredItems.map((item, index) => {
            const totalValue = item.quantity_in_tons * item.purchase_price_per_ton;
            const quantityClass = item.quantity_in_tons < 10 ? 'text-red-600 font-semibold' : 'text-gray-900';
            
            return `
                <tr>
                    <td class="font-medium">${index + 1}</td>
                    <td class="font-medium">${item.item_name}</td>
                    <td class="${quantityClass}">${Utils.formatNumber(item.quantity_in_tons)} طن</td>
                    <td>${Utils.formatCurrency(item.purchase_price_per_ton)}</td>
                    <td class="font-semibold text-green-600">${Utils.formatCurrency(totalValue)}</td>
                    <td>
                        <div>
                            <div class="font-medium">${item.dealer_name}</div>
                            ${item.dealer_contact ? `<div class="text-sm text-gray-500">${item.dealer_contact}</div>` : ''}
                        </div>
                    </td>
                    <td>${Utils.formatDate(item.purchase_date)}</td>
                    <td>
                        <div class="flex items-center space-x-reverse space-x-2">
                            <button onclick="storageManager.adjustQuantity(${item.id})" class="text-blue-600 hover:text-blue-700" title="تعديل الكمية">
                                <i class="fas fa-plus-minus"></i>
                            </button>
                            <button onclick="storageManager.editItem(${item.id})" class="text-amber-600 hover:text-amber-700" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="storageManager.deleteItem(${item.id})" class="text-red-600 hover:text-red-700 delete-btn" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = storageHTML;
    }

    updateSummary() {
        const totalUnits = this.storageItems.length;
        const totalWeight = this.storageItems.reduce((sum, item) => sum + parseFloat(item.quantity_in_tons), 0);
        const totalValue = this.storageItems.reduce((sum, item) => 
            sum + (parseFloat(item.quantity_in_tons) * parseFloat(item.purchase_price_per_ton)), 0);
        const lowStockItems = this.storageItems.filter(item => parseFloat(item.quantity_in_tons) < 10).length;

        document.getElementById('totalUnits').textContent = Utils.formatNumber(totalUnits);
        document.getElementById('totalWeight').textContent = Utils.formatNumber(totalWeight) + ' طن';
        document.getElementById('totalValue').textContent = Utils.formatCurrency(totalValue);
        document.getElementById('lowStockItems').textContent = Utils.formatNumber(lowStockItems);
    }

    async handleStorageSubmit() {
        const formData = new FormData(document.getElementById('storageForm'));
        const itemData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!Utils.validateForm(document.getElementById('storageForm'))) {
            return;
        }
        
        // Convert numeric fields
        itemData.quantityInTons = parseFloat(itemData.quantityInTons) || 0;
        itemData.purchasePricePerTon = parseFloat(itemData.purchasePricePerTon) || 0;

        try {
            Utils.showLoading();
            
            if (itemData.id) {
                // Update existing item
                await API.put(`storage.php?id=${itemData.id}`, itemData);
                Utils.showAlert('تم تحديث العنصر بنجاح', 'success');
            } else {
                // Create new item
                await API.post('storage.php', itemData);
                Utils.showAlert('تم إضافة العنصر بنجاح', 'success');
            }
            
            // Refresh data
            await this.loadData();
            this.renderStorage();
            this.updateSummary();
            this.closeStorageModal();
            
        } catch (error) {
            console.error('Storage submission failed:', error);
            Utils.showAlert('فشل في حفظ العنصر. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async handleQuantityAdjustment() {
        const formData = new FormData(document.getElementById('quantityForm'));
        const adjustmentData = Object.fromEntries(formData.entries());
        
        if (!Utils.validateForm(document.getElementById('quantityForm'))) {
            return;
        }

        const itemId = parseInt(adjustmentData.itemId);
        const type = adjustmentData.type;
        const quantity = parseFloat(adjustmentData.quantity);
        const notes = adjustmentData.notes || '';

        const item = this.storageItems.find(i => i.id === itemId);
        if (!item) {
            Utils.showAlert('العنصر غير موجود', 'error');
            return;
        }

        let newQuantity = parseFloat(item.quantity_in_tons);

        switch (type) {
            case 'add':
                newQuantity += quantity;
                break;
            case 'subtract':
                newQuantity -= quantity;
                if (newQuantity < 0) {
                    Utils.showAlert('لا يمكن أن تكون الكمية أقل من صفر', 'error');
                    return;
                }
                break;
            case 'set':
                newQuantity = quantity;
                break;
        }

        try {
            Utils.showLoading();
            
            await API.put(`storage.php?id=${itemId}`, {
                quantityInTons: newQuantity,
                adjustmentNotes: notes
            });
            
            Utils.showAlert('تم تعديل الكمية بنجاح', 'success');
            
            // Refresh data
            await this.loadData();
            this.renderStorage();
            this.updateSummary();
            this.closeQuantityModal();
            
        } catch (error) {
            console.error('Quantity adjustment failed:', error);
            Utils.showAlert('فشل في تعديل الكمية. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    openAddStorageModal() {
        this.currentItem = null;
        document.getElementById('storageModalTitle').textContent = 'إضافة عنصر جديد';
        document.getElementById('storageForm').reset();
        document.getElementById('storageId').value = '';
        document.getElementById('purchaseDate').value = Utils.getCurrentDate();
        document.getElementById('storageModal').classList.remove('hidden');
    }

    editItem(itemId) {
        const item = this.storageItems.find(i => i.id === itemId);
        if (!item) return;
        
        this.currentItem = item;
        document.getElementById('storageModalTitle').textContent = 'تعديل العنصر';
        
        // Fill form
        document.getElementById('storageId').value = item.id;
        document.getElementById('itemName').value = item.item_name;
        document.getElementById('quantityInTons').value = item.quantity_in_tons;
        document.getElementById('purchasePricePerTon').value = item.purchase_price_per_ton;
        document.getElementById('dealerName').value = item.dealer_name;
        document.getElementById('dealerContact').value = item.dealer_contact || '';
        document.getElementById('purchaseDate').value = item.purchase_date;
        
        document.getElementById('storageModal').classList.remove('hidden');
    }

    adjustQuantity(itemId) {
        const item = this.storageItems.find(i => i.id === itemId);
        if (!item) return;
        
        document.getElementById('adjustItemId').value = item.id;
        document.getElementById('adjustItemName').textContent = item.item_name;
        document.getElementById('currentQuantity').textContent = Utils.formatNumber(item.quantity_in_tons);
        document.getElementById('quantityForm').reset();
        document.getElementById('adjustItemId').value = item.id; // Reset removes this too
        
        document.getElementById('quantityModal').classList.remove('hidden');
    }

    closeStorageModal() {
        document.getElementById('storageModal').classList.add('hidden');
        this.currentItem = null;
    }

    closeQuantityModal() {
        document.getElementById('quantityModal').classList.add('hidden');
    }

    async deleteItem(itemId) {
        const item = this.storageItems.find(i => i.id === itemId);
        if (!item) return;
        
        if (!confirm(`هل أنت متأكد من حذف ${item.item_name}؟`)) {
            return;
        }
        
        try {
            Utils.showLoading();
            await API.delete(`storage.php?id=${itemId}`);
            Utils.showAlert('تم حذف العنصر بنجاح', 'success');
            
            // Refresh data
            await this.loadData();
            this.renderStorage();
            this.updateSummary();
            
        } catch (error) {
            console.error('Delete item failed:', error);
            Utils.showAlert('فشل في حذف العنصر. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    // Export storage data
    exportData() {
        if (this.storageItems.length === 0) {
            Utils.showAlert('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        const headers = ['اسم المادة', 'الكمية (طن)', 'سعر الطن', 'القيمة الإجمالية', 'المورد', 'رقم المورد', 'تاريخ الشراء'];
        const csvData = [
            headers,
            ...this.storageItems.map(item => [
                item.item_name,
                item.quantity_in_tons,
                item.purchase_price_per_ton,
                item.quantity_in_tons * item.purchase_price_per_ton,
                item.dealer_name,
                item.dealer_contact || '',
                item.purchase_date
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `storage-${Utils.getCurrentDate()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Utils.showAlert('تم تصدير البيانات بنجاح', 'success');
    }
}

// Global functions for modals
function openAddStorageModal() {
    window.storageManager.openAddStorageModal();
}

function closeStorageModal() {
    window.storageManager.closeStorageModal();
}

function closeQuantityModal() {
    window.storageManager.closeQuantityModal();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.storageManager = new StorageManager();
});