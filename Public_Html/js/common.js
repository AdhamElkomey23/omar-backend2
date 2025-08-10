// Common JavaScript functions and utilities

// API Base URL
const API_BASE = 'api';

// Utility Functions
const Utils = {
    // Format number with commas
    formatNumber(num) {
        return new Intl.NumberFormat('ar-EG').format(num || 0);
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    },

    // Format date
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },

    // Format date short
    formatDateShort(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    },

    // Show loading
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }
    },

    // Hide loading
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
    },

    // Show alert
    showAlert(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alertContainer') || this.createAlertContainer();
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} fade-in`;
        alertDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="text-current opacity-70 hover:opacity-100">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        alertContainer.appendChild(alertDiv);

        // Auto remove after duration
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    },

    // Create alert container if not exists
    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'fixed top-4 left-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
        return container;
    },

    // Confirm dialog
    confirm(message, callback) {
        if (confirm(message)) {
            callback();
        }
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get current date in YYYY-MM-DD format
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    },

    // Validate form
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'هذا الحقل مطلوب');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    },

    // Show field error
    showFieldError(input, message) {
        this.clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        errorDiv.id = `error-${input.name || input.id}`;
        
        input.parentNode.appendChild(errorDiv);
        input.classList.add('border-red-500');
    },

    // Clear field error
    clearFieldError(input) {
        const errorId = `error-${input.name || input.id}`;
        const existingError = document.getElementById(errorId);
        if (existingError) {
            existingError.remove();
        }
        input.classList.remove('border-red-500');
    }
};

// API Helper
const API = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE}/${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API Request failed:', error);
            Utils.showAlert('حدث خطأ في الاتصال بالخادم', 'error');
            throw error;
        }
    },

    // GET request
    async get(endpoint) {
        return this.request(endpoint);
    },

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
};

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = Utils.formatDate(new Date().toISOString());
    }

    // Add loading states to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="spinner ml-2"></span> جاري الحفظ...';
                
                // Reset after 5 seconds if still disabled
                setTimeout(() => {
                    if (submitBtn.disabled) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }, 5000);
            }
        });
    });

    // Add click handlers for delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            e.preventDefault();
            const message = e.target.dataset.confirmMessage || 'هل أنت متأكد من الحذف؟';
            Utils.confirm(message, () => {
                // Trigger the actual delete action
                if (e.target.href) {
                    window.location.href = e.target.href;
                } else if (e.target.onclick) {
                    e.target.onclick();
                }
            });
        }
    });
});

// Export for use in other files
window.Utils = Utils;
window.API = API;