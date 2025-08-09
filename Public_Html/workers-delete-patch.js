// Workers Delete Functionality Patch
// This script adds delete buttons to the workers page

(function() {
    'use strict';
    
    // Wait for the page to load
    function waitForWorkersPage() {
        // Check if we're on the workers page
        if (window.location.pathname.includes('workers') || window.location.hash.includes('workers') || 
            document.querySelector('.workers-container') || document.querySelector('[data-page="workers"]')) {
            addDeleteButtons();
        }
        
        // Also listen for navigation changes (SPA)
        setTimeout(waitForWorkersPage, 1000);
    }
    
    function addDeleteButtons() {
        // Find all worker rows/cards that don't already have delete buttons
        const workerElements = document.querySelectorAll('.worker-card, .worker-row, [data-worker-id], .grid > div');
        
        workerElements.forEach(function(workerElement) {
            // Skip if delete button already exists
            if (workerElement.querySelector('.delete-worker-btn')) {
                return;
            }
            
            // Try to find worker ID from various possible attributes
            let workerId = workerElement.getAttribute('data-worker-id') || 
                          workerElement.getAttribute('data-id') ||
                          workerElement.querySelector('[data-id]')?.getAttribute('data-id');
            
            // If no ID found, try to extract from worker name element
            if (!workerId) {
                const nameElement = workerElement.querySelector('.worker-name, .name, h3, .font-semibold');
                if (nameElement) {
                    // Store a temporary ID based on the worker name for identification
                    workerId = 'name-' + nameElement.textContent.trim().replace(/\s+/g, '-');
                }
            }
            
            if (workerId) {
                const deleteButton = createDeleteButton(workerId, workerElement);
                
                // Find the best place to insert the delete button
                const actionsContainer = workerElement.querySelector('.actions, .buttons, .worker-actions') ||
                                       workerElement.querySelector('.flex.gap-2, .space-x-2') ||
                                       workerElement;
                
                if (actionsContainer) {
                    actionsContainer.appendChild(deleteButton);
                } else {
                    workerElement.appendChild(deleteButton);
                }
            }
        });
    }
    
    function createDeleteButton(workerId, workerElement) {
        const button = document.createElement('button');
        button.className = 'delete-worker-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors';
        button.innerHTML = '🗑️ حذف';
        button.style.cssText = `
            background-color: #ef4444;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            margin-left: 8px;
            transition: background-color 0.2s;
        `;
        
        button.addEventListener('mouseenter', function() {
            button.style.backgroundColor = '#dc2626';
        });
        
        button.addEventListener('mouseleave', function() {
            button.style.backgroundColor = '#ef4444';
        });
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            deleteWorker(workerId, workerElement);
        });
        
        return button;
    }
    
    function deleteWorker(workerId, workerElement) {
        // Get worker name for confirmation
        const nameElement = workerElement.querySelector('.worker-name, .name, h3, .font-semibold');
        const workerName = nameElement ? nameElement.textContent.trim() : 'هذا العامل';
        
        if (!confirm(`هل أنت متأكد من حذف العامل "${workerName}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
            return;
        }
        
        // Show loading state
        const deleteBtn = workerElement.querySelector('.delete-worker-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = '⏳';
            deleteBtn.disabled = true;
        }
        
        // If workerId starts with 'name-', we need to find the actual ID from the workers list
        if (workerId.startsWith('name-')) {
            findAndDeleteWorkerByName(workerName, workerElement);
        } else {
            performDelete(workerId, workerElement);
        }
    }
    
    function findAndDeleteWorkerByName(workerName, workerElement) {
        // Fetch all workers to find the ID by name
        fetch('/api/workers.php')
            .then(response => response.json())
            .then(workers => {
                const worker = workers.find(w => w.name === workerName);
                if (worker) {
                    performDelete(worker.id, workerElement);
                } else {
                    alert('لم يتم العثور على العامل في قاعدة البيانات');
                    resetDeleteButton(workerElement);
                }
            })
            .catch(error => {
                console.error('Error finding worker:', error);
                alert('حدث خطأ في البحث عن العامل');
                resetDeleteButton(workerElement);
            });
    }
    
    function performDelete(workerId, workerElement) {
        fetch('/api/workers.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: parseInt(workerId) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.message.includes('successfully')) {
                // Success - remove the worker element from the page
                workerElement.style.transition = 'opacity 0.3s ease-out';
                workerElement.style.opacity = '0';
                
                setTimeout(() => {
                    workerElement.remove();
                    
                    // Show success message
                    showMessage('تم حذف العامل بنجاح', 'success');
                    
                    // Refresh the page after a short delay to sync data
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }, 300);
            } else {
                alert('فشل في حذف العامل: ' + (data.error || 'خطأ غير معروف'));
                resetDeleteButton(workerElement);
            }
        })
        .catch(error => {
            console.error('Error deleting worker:', error);
            alert('حدث خطأ في الاتصال بالخادم');
            resetDeleteButton(workerElement);
        });
    }
    
    function resetDeleteButton(workerElement) {
        const deleteBtn = workerElement.querySelector('.delete-worker-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = '🗑️ حذف';
            deleteBtn.disabled = false;
        }
    }
    
    function showMessage(text, type) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    // Start the script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForWorkersPage);
    } else {
        waitForWorkersPage();
    }
    
    // Also listen for hash changes (SPA navigation)
    window.addEventListener('hashchange', function() {
        setTimeout(addDeleteButtons, 500);
    });
    
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', function() {
        setTimeout(addDeleteButtons, 500);
    });
})();