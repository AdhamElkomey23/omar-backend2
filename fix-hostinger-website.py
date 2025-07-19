#!/usr/bin/env python3

import os
import shutil
import json
from pathlib import Path

def create_client_side_storage():
    """Create a client-side storage solution that works without a backend"""
    
    storage_js = """
// Client-side storage manager for Hostinger deployment
class LocalStorageManager {
    constructor() {
        this.keys = {
            workers: 'alwasiloon_workers',
            sales: 'alwasiloon_sales',
            expenses: 'alwasiloon_expenses',
            storage: 'alwasiloon_storage',
            attendance: 'alwasiloon_attendance'
        };
        this.initializeData();
    }
    
    initializeData() {
        // Initialize with sample data if empty
        if (!this.getData('storage').length) {
            this.setData('storage', [
                {
                    id: 1,
                    itemName: "الجبس",
                    quantityInTons: 150,
                    purchasePricePerTon: 120,
                    dealerName: "شركة المعادن المتقدمة",
                    dealerContact: "01234567890",
                    purchaseDate: "2024-01-15"
                },
                {
                    id: 2,
                    itemName: "الفلسبار",
                    quantityInTons: 200,
                    purchasePricePerTon: 180,
                    dealerName: "مؤسسة الصخور المعدنية",
                    dealerContact: "01987654321",
                    purchaseDate: "2024-01-20"
                }
            ]);
        }
        
        if (!this.getData('sales').length) {
            this.setData('sales', [
                {
                    id: 1,
                    productName: "Ammonium Nitrate",
                    quantity: 500,
                    unitPrice: 180,
                    totalPrice: 90000,
                    customerName: "Green Fields Co.",
                    date: "2024-01-10",
                    status: "completed"
                }
            ]);
        }
        
        if (!this.getData('expenses').length) {
            this.setData('expenses', [
                {
                    id: 1,
                    name: "Electricity Bill",
                    amount: 15000,
                    category: "utilities",
                    date: "2024-01-01"
                }
            ]);
        }
    }
    
    getData(type) {
        try {
            const data = localStorage.getItem(this.keys[type]);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error getting data:', e);
            return [];
        }
    }
    
    setData(type, data) {
        try {
            localStorage.setItem(this.keys[type], JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error setting data:', e);
            return false;
        }
    }
    
    addItem(type, item) {
        const data = this.getData(type);
        const newItem = { ...item, id: Date.now() };
        data.push(newItem);
        this.setData(type, data);
        return newItem;
    }
    
    updateItem(type, id, updatedItem) {
        const data = this.getData(type);
        const index = data.findIndex(item => item.id == id);
        if (index !== -1) {
            data[index] = { ...updatedItem, id };
            this.setData(type, data);
            return data[index];
        }
        return null;
    }
    
    deleteItem(type, id) {
        const data = this.getData(type);
        const filtered = data.filter(item => item.id != id);
        this.setData(type, filtered);
        return true;
    }
    
    // Dashboard summary calculations
    getDashboardSummary() {
        const sales = this.getData('sales');
        const expenses = this.getData('expenses');
        
        const totalIncome = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const netProfit = totalIncome - totalExpenses;
        const salesCount = sales.length;
        
        return {
            totalIncome,
            totalExpenses,
            netProfit,
            salesCount
        };
    }
}

// Global storage instance
window.localStorageManager = new LocalStorageManager();

// Mock fetch function to intercept API calls
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    const method = options.method || 'GET';
    
    // Dashboard API
    if (url === '/api/dashboard') {
        const summary = window.localStorageManager.getDashboardSummary();
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(summary)
        });
    }
    
    // Storage API
    if (url === '/api/storage') {
        if (method === 'GET') {
            const data = window.localStorageManager.getData('storage');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('storage', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
    }
    
    if (url.startsWith('/api/storage/')) {
        const id = url.split('/').pop();
        if (method === 'PUT') {
            const body = JSON.parse(options.body);
            const updatedItem = window.localStorageManager.updateItem('storage', id, body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedItem)
            });
        }
        if (method === 'DELETE') {
            window.localStorageManager.deleteItem('storage', id);
            return Promise.resolve({ ok: true });
        }
    }
    
    // Workers API
    if (url === '/api/workers') {
        if (method === 'GET') {
            const data = window.localStorageManager.getData('workers');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('workers', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
    }
    
    if (url.startsWith('/api/workers/')) {
        const id = url.split('/').pop();
        if (method === 'PUT') {
            const body = JSON.parse(options.body);
            const updatedItem = window.localStorageManager.updateItem('workers', id, body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedItem)
            });
        }
        if (method === 'DELETE') {
            window.localStorageManager.deleteItem('workers', id);
            return Promise.resolve({ ok: true });
        }
    }
    
    // Sales API
    if (url === '/api/sales') {
        if (method === 'GET') {
            const data = window.localStorageManager.getData('sales');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('sales', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
    }
    
    if (url.startsWith('/api/sales/')) {
        const id = url.split('/').pop();
        if (method === 'PUT') {
            const body = JSON.parse(options.body);
            const updatedItem = window.localStorageManager.updateItem('sales', id, body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedItem)
            });
        }
        if (method === 'DELETE') {
            window.localStorageManager.deleteItem('sales', id);
            return Promise.resolve({ ok: true });
        }
    }
    
    // Expenses API
    if (url === '/api/expenses') {
        if (method === 'GET') {
            const data = window.localStorageManager.getData('expenses');
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data)
            });
        }
        if (method === 'POST') {
            const body = JSON.parse(options.body);
            const newItem = window.localStorageManager.addItem('expenses', body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(newItem)
            });
        }
    }
    
    if (url.startsWith('/api/expenses/')) {
        const id = url.split('/').pop();
        if (method === 'PUT') {
            const body = JSON.parse(options.body);
            const updatedItem = window.localStorageManager.updateItem('expenses', id, body);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedItem)
            });
        }
        if (method === 'DELETE') {
            window.localStorageManager.deleteItem('expenses', id);
            return Promise.resolve({ ok: true });
        }
    }
    
    // Attendance API
    if (url.startsWith('/api/attendance')) {
        const data = window.localStorageManager.getData('attendance');
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(data)
        });
    }
    
    // Fall back to original fetch for other requests
    return originalFetch.apply(this, arguments);
};

console.log('Client-side storage manager loaded successfully!');
"""
    return storage_js

def fix_hostinger_website():
    print("🔧 Fixing Hostinger website to work without backend...")
    
    # Create fixed version
    fixed_dir = Path("hostinger-website-fixed")
    fixed_dir.mkdir(exist_ok=True)
    
    # Copy existing files
    if Path("hostinger-website").exists():
        for item in Path("hostinger-website").iterdir():
            if item.is_file():
                shutil.copy2(item, fixed_dir)
            elif item.is_dir():
                shutil.copytree(item, fixed_dir / item.name, dirs_exist_ok=True)
    
    # Create client-side storage script
    storage_script = create_client_side_storage()
    with open(fixed_dir / "storage-manager.js", "w", encoding="utf-8") as f:
        f.write(storage_script)
    
    # Update index.html to include storage manager
    index_file = fixed_dir / "index.html"
    if index_file.exists():
        with open(index_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Add storage manager script before the main app script
        content = content.replace(
            '<script type="module" crossorigin src="/assets/index-Dm-zLjcz.js"></script>',
            '<script src="storage-manager.js"></script>\\n    <script type="module" crossorigin src="/assets/index-Dm-zLjcz.js"></script>'
        )
        
        # Update title
        content = content.replace(
            'Artisana - Handcrafted Products Marketplace',
            'Al-Wasiloon Fertilizer Factory Management'
        )
        
        with open(index_file, "w", encoding="utf-8") as f:
            f.write(content)
    
    # Create new ZIP file
    import zipfile
    with zipfile.ZipFile("HOSTINGER-FIXED-READY.zip", "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(fixed_dir):
            for file in files:
                file_path = Path(root) / file
                arc_name = file_path.relative_to(fixed_dir)
                zipf.write(file_path, arc_name)
    
    print("✅ Fixed website created!")
    print("📁 New files: hostinger-website-fixed/ and HOSTINGER-FIXED-READY.zip")
    print("🚀 Upload the new files to Hostinger - adding/editing will now work!")

if __name__ == "__main__":
    fix_hostinger_website()