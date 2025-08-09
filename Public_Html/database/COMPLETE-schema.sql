-- COMPLETE Database Schema for Al-Wasiloon Fertilizer Factory Management System
-- This includes ALL tables required by the application

-- Create database (run this if needed)
-- CREATE DATABASE fertilizer_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE fertilizer_management;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    salary INT NOT NULL,
    hire_date DATE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Worker Attendance Table
CREATE TABLE IF NOT EXISTS worker_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'half_day') NOT NULL DEFAULT 'present',
    clock_in_time TIME,
    clock_out_time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_date (worker_id, attendance_date)
);

-- 4. Salary Deductions Table
CREATE TABLE IF NOT EXISTS salary_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    deduction_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    deduction_amount DECIMAL(10,2) NOT NULL,
    deduction_type VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 5. Storage Items Table (Inventory Management)
CREATE TABLE IF NOT EXISTS storage_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity_in_tons DECIMAL(10,2) NOT NULL,
    purchase_price_per_ton DECIMAL(10,2) NOT NULL,
    dealer_name VARCHAR(255) NOT NULL,
    dealer_contact VARCHAR(255),
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Products Table (For sales reference)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    sale_date DATE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing

-- Sample Users
INSERT IGNORE INTO users (username, password) VALUES 
('admin', 'admin123'),
('manager', 'manager123');

-- Sample Workers
INSERT IGNORE INTO workers (name, role, department, salary, hire_date, email, phone) VALUES 
('Ahmed Hassan', 'Production Manager', 'Production', 25000, '2023-01-15', 'ahmed@fertilizer.com', '+20-123-456-789'),
('Fatima Ali', 'Quality Control', 'Quality', 18000, '2023-02-01', 'fatima@fertilizer.com', '+20-123-456-790'),
('Omar Mahmoud', 'Machine Operator', 'Production', 15000, '2023-03-10', 'omar@fertilizer.com', '+20-123-456-791'),
('Maryam Ibrahim', 'Lab Technician', 'Quality', 20000, '2023-01-20', 'maryam@fertilizer.com', '+20-123-456-792'),
('Khaled Nasser', 'Warehouse Supervisor', 'Logistics', 22000, '2023-02-15', 'khaled@fertilizer.com', '+20-123-456-793');

-- Sample Storage Items
INSERT IGNORE INTO storage_items (item_name, quantity_in_tons, purchase_price_per_ton, dealer_name, dealer_contact, purchase_date) VALUES 
('Ammonium Nitrate', 150.5, 850.00, 'Cairo Chemical Supplies', '+20-2-123-4567', '2024-01-15'),
('Phosphoric Acid', 80.0, 1200.00, 'Alexandria Phosphate Co.', '+20-3-234-5678', '2024-01-20'),
('Potassium Chloride', 120.0, 950.00, 'Red Sea Minerals', '+20-65-345-6789', '2024-01-25'),
('Urea', 200.0, 780.00, 'Nile Fertilizers Ltd.', '+20-88-456-7890', '2024-02-01'),
('Sulfuric Acid', 60.0, 650.00, 'Egyptian Acids Corp.', '+20-97-567-8901', '2024-02-05');

-- Sample Products
INSERT IGNORE INTO products (name, unit_price, stock_quantity) VALUES 
('NPK Fertilizer 20-20-20', 45.50, 500),
('Ammonium Sulfate', 35.00, 300),
('Triple Superphosphate', 42.00, 250),
('Potassium Nitrate', 48.00, 200);

-- Sample Sales
INSERT IGNORE INTO sales (product_name, quantity, total_amount, sale_date, client_name, client_contact) VALUES 
('Ammonium Nitrate', 50, 42500.00, '2024-07-20', 'Green Valley Farms', '+20-10-111-2222'),
('Phosphoric Acid', 25, 30000.00, '2024-07-22', 'Delta Agriculture Co.', '+20-11-222-3333'),
('Urea', 100, 78000.00, '2024-07-24', 'Nile Valley Cooperative', '+20-12-333-4444');

-- Sample Expenses
INSERT IGNORE INTO expenses (name, amount, category, expense_date) VALUES 
('Electricity Bill', 15000.00, 'Utilities', '2024-07-15'),
('Worker Salaries', 150000.00, 'Salaries', '2024-07-01'),
('Equipment Maintenance', 25000.00, 'Maintenance', '2024-07-18'),
('Raw Material Transport', 12000.00, 'Transportation', '2024-07-20'),
('Safety Equipment', 8000.00, 'Other', '2024-07-22');

-- Sample Activity Logs
INSERT IGNORE INTO activity_logs (title, description, log_date) VALUES 
('Production Started', 'Started production of NPK fertilizer batch #2024-001', '2024-07-25'),
('Quality Check Completed', 'Quality control check completed for Ammonium Nitrate lot AN-2024-15', '2024-07-24'),
('Equipment Maintenance', 'Scheduled maintenance completed on mixing unit #3', '2024-07-23'),
('Safety Training', 'Monthly safety training conducted for all production staff', '2024-07-22'),
('Inventory Update', 'Received new shipment of Phosphoric Acid - 80 tons', '2024-07-21');

-- Sample Worker Attendance (last 7 days)
INSERT IGNORE INTO worker_attendance (worker_id, attendance_date, status, clock_in_time, clock_out_time) VALUES 
(1, '2024-07-25', 'present', '08:00:00', '17:00:00'),
(2, '2024-07-25', 'present', '08:15:00', '17:00:00'),
(3, '2024-07-25', 'present', '08:00:00', '17:00:00'),
(4, '2024-07-25', 'present', '08:30:00', '17:00:00'),
(5, '2024-07-25', 'present', '08:00:00', '17:00:00'),
(1, '2024-07-24', 'present', '08:00:00', '17:00:00'),
(2, '2024-07-24', 'late', '09:00:00', '17:00:00'),
(3, '2024-07-24', 'present', '08:00:00', '17:00:00'),
(4, '2024-07-24', 'present', '08:30:00', '17:00:00'),
(5, '2024-07-24', 'absent', NULL, NULL);

-- Sample Salary Deductions
INSERT IGNORE INTO salary_deductions (worker_id, deduction_month, deduction_amount, deduction_type, description) VALUES 
(1, '2024-07', 500.00, 'Late Arrival', 'Deduction for late arrivals in July'),
(2, '2024-07', 200.00, 'Medical Insurance', 'Monthly medical insurance contribution'),
(3, '2024-06', 1000.00, 'Advance Salary', 'Advance salary taken in June'),
(4, '2024-07', 150.00, 'Uniform', 'New safety uniform cost'),
(5, '2024-07', 300.00, 'Absence', 'Deduction for unauthorized absence');

-- Create indexes for better performance
CREATE INDEX idx_workers_department ON workers(department);
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_attendance_date ON worker_attendance(attendance_date);
CREATE INDEX idx_attendance_worker ON worker_attendance(worker_id);
CREATE INDEX idx_storage_item_name ON storage_items(item_name);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_product ON sales(product_name);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_activity_logs_date ON activity_logs(log_date);
CREATE INDEX idx_salary_deductions_month ON salary_deductions(deduction_month);
CREATE INDEX idx_salary_deductions_worker ON salary_deductions(worker_id);

-- Show table status
SHOW TABLES;