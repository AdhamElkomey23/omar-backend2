// Workers page JavaScript

class WorkersManager {
    constructor() {
        this.workers = [];
        this.filteredWorkers = [];
        this.currentWorker = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderWorkers();
            this.updateStatistics();
        } catch (error) {
            console.error('Workers initialization failed:', error);
            Utils.showAlert('فشل في تحميل بيانات العمال', 'error');
        }
    }

    async loadData() {
        try {
            this.workers = await API.get('workers.php') || [];
            this.filteredWorkers = [...this.workers];
        } catch (error) {
            console.error('Failed to load workers data:', error);
            this.workers = [];
            this.filteredWorkers = [];
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('workerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleWorkerSubmit();
        });

        // Filters
        document.getElementById('departmentFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', Utils.debounce(() => this.applyFilters(), 300));

        // Set current date as default hire date
        document.getElementById('hireDate').value = Utils.getCurrentDate();
    }

    applyFilters() {
        const departmentFilter = document.getElementById('departmentFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredWorkers = this.workers.filter(worker => {
            const matchesDepartment = !departmentFilter || worker.department === departmentFilter;
            const matchesStatus = !statusFilter || 
                (statusFilter === 'active' && worker.is_active) ||
                (statusFilter === 'inactive' && !worker.is_active);
            const matchesSearch = !searchTerm || 
                worker.name.toLowerCase().includes(searchTerm) ||
                worker.position.toLowerCase().includes(searchTerm);

            return matchesDepartment && matchesStatus && matchesSearch;
        });

        this.renderWorkers();
    }

    renderWorkers() {
        const tbody = document.getElementById('workersTableBody');
        
        if (this.filteredWorkers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-8">
                        <div class="text-gray-500">
                            <i class="fas fa-users text-4xl mb-2"></i>
                            <p>لا توجد بيانات عمال</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const workersHTML = this.filteredWorkers.map((worker, index) => `
            <tr>
                <td class="font-medium">${index + 1}</td>
                <td class="font-medium">${worker.name}</td>
                <td>${worker.position}</td>
                <td>
                    <span class="badge badge-info">${this.translateDepartment(worker.department)}</span>
                </td>
                <td class="font-semibold text-green-600">${Utils.formatCurrency(worker.salary)}</td>
                <td>${worker.phone || '-'}</td>
                <td>${Utils.formatDate(worker.hire_date)}</td>
                <td>
                    ${worker.is_active ? 
                        '<span class="badge badge-success">نشط</span>' : 
                        '<span class="badge badge-error">غير نشط</span>'
                    }
                </td>
                <td>
                    <div class="flex items-center space-x-reverse space-x-2">
                        <button onclick="workersManager.editWorker(${worker.id})" class="text-blue-600 hover:text-blue-700" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="workersManager.toggleWorkerStatus(${worker.id})" class="text-yellow-600 hover:text-yellow-700" title="تغيير الحالة">
                            <i class="fas fa-toggle-${worker.is_active ? 'off' : 'on'}"></i>
                        </button>
                        <button onclick="workersManager.deleteWorker(${worker.id})" class="text-red-600 hover:text-red-700 delete-btn" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = workersHTML;
    }

    updateStatistics() {
        const totalWorkers = this.workers.length;
        const activeWorkers = this.workers.filter(w => w.is_active).length;
        const totalSalaries = this.workers
            .filter(w => w.is_active)
            .reduce((sum, w) => sum + parseFloat(w.salary), 0);
        const departments = new Set(this.workers.map(w => w.department)).size;

        document.getElementById('totalWorkers').textContent = Utils.formatNumber(totalWorkers);
        document.getElementById('activeWorkers').textContent = Utils.formatNumber(activeWorkers);
        document.getElementById('totalSalaries').textContent = Utils.formatCurrency(totalSalaries);
        document.getElementById('departmentCount').textContent = Utils.formatNumber(departments);
    }

    translateDepartment(department) {
        const translations = {
            'Production': 'الإنتاج',
            'QualityControl': 'مراقبة الجودة',
            'Storage': 'المخازن',
            'Maintenance': 'الصيانة',
            'Administrative': 'الإدارة',
            'Sales': 'المبيعات'
        };
        return translations[department] || department;
    }

    async handleWorkerSubmit() {
        const formData = new FormData(document.getElementById('workerForm'));
        const workerData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!Utils.validateForm(document.getElementById('workerForm'))) {
            return;
        }
        
        // Convert numeric and boolean fields
        workerData.salary = parseFloat(workerData.salary) || 0;
        workerData.isActive = workerData.isActive === 'true';

        try {
            Utils.showLoading();
            
            if (workerData.id) {
                // Update existing worker
                await API.put(`workers.php?id=${workerData.id}`, workerData);
                Utils.showAlert('تم تحديث بيانات العامل بنجاح', 'success');
            } else {
                // Create new worker
                await API.post('workers.php', workerData);
                Utils.showAlert('تم إضافة العامل بنجاح', 'success');
            }
            
            // Refresh data
            await this.loadData();
            this.renderWorkers();
            this.updateStatistics();
            this.closeWorkerModal();
            
        } catch (error) {
            console.error('Worker submission failed:', error);
            Utils.showAlert('فشل في حفظ بيانات العامل. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    openAddWorkerModal() {
        this.currentWorker = null;
        document.getElementById('workerModalTitle').textContent = 'إضافة عامل جديد';
        document.getElementById('workerForm').reset();
        document.getElementById('workerId').value = '';
        document.getElementById('hireDate').value = Utils.getCurrentDate();
        document.getElementById('isActive').value = 'true';
        document.getElementById('workerModal').classList.remove('hidden');
    }

    editWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;
        
        this.currentWorker = worker;
        document.getElementById('workerModalTitle').textContent = 'تعديل بيانات العامل';
        
        // Fill form
        document.getElementById('workerId').value = worker.id;
        document.getElementById('workerName').value = worker.name;
        document.getElementById('position').value = worker.position;
        document.getElementById('department').value = worker.department;
        document.getElementById('salary').value = worker.salary;
        document.getElementById('phone').value = worker.phone || '';
        document.getElementById('email').value = worker.email || '';
        document.getElementById('hireDate').value = worker.hire_date;
        document.getElementById('address').value = worker.address || '';
        document.getElementById('isActive').value = worker.is_active ? 'true' : 'false';
        
        document.getElementById('workerModal').classList.remove('hidden');
    }

    async toggleWorkerStatus(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;
        
        const newStatus = !worker.is_active;
        const statusText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
        
        if (!confirm(`هل أنت متأكد من ${statusText} العامل ${worker.name}؟`)) {
            return;
        }
        
        try {
            Utils.showLoading();
            await API.put(`workers.php?id=${workerId}`, { isActive: newStatus });
            Utils.showAlert(`تم ${statusText} العامل بنجاح`, 'success');
            
            // Refresh data
            await this.loadData();
            this.renderWorkers();
            this.updateStatistics();
            
        } catch (error) {
            console.error('Toggle worker status failed:', error);
            Utils.showAlert('فشل في تغيير حالة العامل. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    closeWorkerModal() {
        document.getElementById('workerModal').classList.add('hidden');
        this.currentWorker = null;
    }

    async deleteWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;
        
        if (!confirm(`هل أنت متأكد من حذف العامل ${worker.name}؟\nسيتم حذف جميع البيانات المرتبطة به.`)) {
            return;
        }
        
        try {
            Utils.showLoading();
            await API.delete(`workers.php?id=${workerId}`);
            Utils.showAlert('تم حذف العامل بنجاح', 'success');
            
            // Refresh data
            await this.loadData();
            this.renderWorkers();
            this.updateStatistics();
            
        } catch (error) {
            console.error('Delete worker failed:', error);
            Utils.showAlert('فشل في حذف العامل. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    // Export workers data
    exportData() {
        if (this.workers.length === 0) {
            Utils.showAlert('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        const headers = ['الاسم', 'المنصب', 'القسم', 'الراتب', 'رقم الهاتف', 'البريد الإلكتروني', 'تاريخ التعيين', 'الحالة'];
        const csvData = [
            headers,
            ...this.workers.map(worker => [
                worker.name,
                worker.position,
                this.translateDepartment(worker.department),
                worker.salary,
                worker.phone || '',
                worker.email || '',
                worker.hire_date,
                worker.is_active ? 'نشط' : 'غير نشط'
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `workers-${Utils.getCurrentDate()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Utils.showAlert('تم تصدير البيانات بنجاح', 'success');
    }
}

// Global functions for modal
function openAddWorkerModal() {
    window.workersManager.openAddWorkerModal();
}

function closeWorkerModal() {
    window.workersManager.closeWorkerModal();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.workersManager = new WorkersManager();
});