-- MySQL Database Schema for Fertilizer Factory Management System
-- Create database
CREATE DATABASE IF NOT EXISTS fertilizer_management;
USE fertilizer_management;

-- Workers table
CREATE TABLE workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    hire_date DATE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker attendance table
CREATE TABLE worker_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'half-day') NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    hours_worked DECIMAL(4,2) DEFAULT 8.00,
    overtime_hours DECIMAL(4,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_date (worker_id, attendance_date)
);

-- Salary deductions table
CREATE TABLE salary_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    amount DECIMAL(10,2) NOT NULL,
    reason ENUM('absence', 'late', 'advance', 'penalty', 'insurance', 'other') NOT NULL,
    details TEXT,
    deduction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- Sales table
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    product VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    sale_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO workers (name, role, department, salary, hire_date, email, phone) VALUES
('أحمد محمد', 'مدير الإنتاج', 'الإنتاج', 5000.00, '2024-01-15', 'ahmed@example.com', '01012345678'),
('فاطمة علي', 'محاسبة', 'المالية', 4000.00, '2024-02-01', 'fatma@example.com', '01098765432'),
('محمد حسن', 'عامل إنتاج', 'الإنتاج', 2500.00, '2024-03-10', '', '01055555555');

INSERT INTO sales (customer_name, product, quantity, unit_price, total_amount, sale_date, notes) VALUES
('شركة الزراعة المتقدمة', 'سماد NPK', 100.00, 250.00, 25000.00, '2025-01-15', 'طلبية عادية'),
('مزارع النيل', 'سماد يوريا', 50.00, 180.00, 9000.00, '2025-01-20', 'عميل جديد'),
('التعاونية الزراعية', 'سماد فوسفات', 75.00, 220.00, 16500.00, '2025-01-22', '');

INSERT INTO expenses (description, category, amount, expense_date, notes) VALUES
('كهرباء المصنع', 'مرافق', 8000.00, '2025-01-10', 'فاتورة شهر ديسمبر'),
('مواد خام', 'إنتاج', 15000.00, '2025-01-12', 'شراء مواد لدفعة جديدة'),
('صيانة المعدات', 'صيانة', 3500.00, '2025-01-18', 'صيانة دورية');