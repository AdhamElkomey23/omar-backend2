-- Al-Wasiloon Mining and Chemical Industries Database Schema
-- Created for fertilizer/chemical trading management system

CREATE DATABASE IF NOT EXISTS alwasiloon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alwasiloon_db;

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Storage items table
CREATE TABLE storage_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    quantity_in_tons DECIMAL(10,3) NOT NULL DEFAULT 0,
    purchase_price_per_ton DECIMAL(10,2) NOT NULL DEFAULT 0,
    dealer_name VARCHAR(100) NOT NULL,
    dealer_contact VARCHAR(50),
    purchase_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_item_name (item_name),
    INDEX idx_purchase_date (purchase_date),
    INDEX idx_dealer_name (dealer_name)
);

-- Sales table
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    quantity_tons DECIMAL(10,3) DEFAULT 0,
    quantity_kg DECIMAL(10,3) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    sale_date DATE NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_contact VARCHAR(50),
    payment_status ENUM('paid', 'pending', 'partial') DEFAULT 'pending',
    payment_date DATE NULL,
    invoice_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_product_name (product_name),
    INDEX idx_sale_date (sale_date),
    INDEX idx_client_name (client_name),
    INDEX idx_payment_status (payment_status)
);

-- Expenses table
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category ENUM('Utilities', 'Salaries', 'Maintenance', 'RawMaterials', 'Transportation', 'Administrative', 'Other') NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    receipt_number VARCHAR(50),
    vendor VARCHAR(100),
    payment_method ENUM('cash', 'bank_transfer', 'check', 'card') DEFAULT 'cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_expense_date (expense_date),
    INDEX idx_vendor (vendor)
);

-- Workers table
CREATE TABLE workers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department ENUM('Production', 'QualityControl', 'Storage', 'Maintenance', 'Administrative', 'Sales') NOT NULL,
    salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    national_id VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_department (department),
    INDEX idx_is_active (is_active),
    INDEX idx_hire_date (hire_date),
    UNIQUE KEY uk_national_id (national_id)
);

-- Worker attendance table
CREATE TABLE worker_attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status ENUM('present', 'absent', 'late', 'half_day') NOT NULL,
    hours_worked DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    INDEX idx_worker_date (worker_id, attendance_date),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_status (status),
    UNIQUE KEY uk_worker_date (worker_id, attendance_date)
);

-- Salary deductions table
CREATE TABLE salary_deductions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    deduction_type ENUM('absence', 'late', 'advance', 'insurance', 'tax', 'other') NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    INDEX idx_worker_month (worker_id, month),
    INDEX idx_deduction_type (deduction_type)
);

-- Activity logs table for audit trail
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- Products catalog table (for reference)
CREATE TABLE product_catalog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) DEFAULT 'طن',
    standard_price DECIMAL(10,2),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- Company settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, email, full_name, role) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@alwasiloon.com', 'مدير النظام', 'admin');

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('company_name', 'الواصلون للتعدين والصناعات الكيماوية', 'اسم الشركة'),
('company_address', 'مصر', 'عنوان الشركة'),
('company_phone', '+20 100 000 0000', 'رقم هاتف الشركة'),
('company_email', 'info@alwasiloon.com', 'البريد الإلكتروني للشركة'),
('currency', 'EGP', 'العملة المستخدمة'),
('low_stock_threshold', '10', 'حد التنبيه للمخزون المنخفض'),
('backup_frequency', 'daily', 'تكرار النسخ الاحتياطي'),
('system_version', '1.0.0', 'إصدار النظام');

-- Insert sample product catalog
INSERT INTO product_catalog (name, category, standard_price, description) VALUES
('نترات الأمونيوم', 'أسمدة نيتروجينية', 350.00, 'سماد نيتروجيني عالي الجودة'),
('كلوريد البوتاسيوم', 'أسمدة بوتاسية', 420.00, 'سماد بوتاسي لتحسين نوعية الثمار'),
('حمض الفوسفوريك', 'أحماض', 650.00, 'حمض فوسفوريك صناعي'),
('اليوريا', 'أسمدة نيتروجينية', 300.00, 'سماد يوريا عالي النقاء'),
('حمض الكبريتيك', 'أحماض', 280.00, 'حمض كبريتيك تجاري'),
('حجر الجير', 'مواد خام', 45.00, 'حجر جير طبيعي للصناعات الكيماوية'),
('كبريتات البوتاسيوم', 'أسمدة بوتاسية', 580.00, 'سماد بوتاسي خالي من الكلور');

-- Insert sample expenses for demonstration
INSERT INTO expenses (name, amount, category, expense_date, description) VALUES
('فاتورة الكهرباء', 15000.00, 'Utilities', CURDATE() - INTERVAL 3 DAY, 'فاتورة كهرباء شهر الحالي'),
('مرتبات العمال', 50000.00, 'Salaries', CURDATE() - INTERVAL 5 DAY, 'مرتبات شهرية للعمال'),
('إصلاح المعدات', 8000.00, 'Maintenance', CURDATE() - INTERVAL 8 DAY, 'إصلاح آلة الخلط الرئيسية'),
('شراء مواد خام', 35000.00, 'RawMaterials', CURDATE() - INTERVAL 12 DAY, 'شراء مواد خام للإنتاج'),
('نقل وشحن', 12000.00, 'Transportation', CURDATE() - INTERVAL 18 DAY, 'نقل البضائع للعملاء');

-- Insert sample workers
INSERT INTO workers (name, position, department, salary, phone, email, hire_date) VALUES
('أحمد محمد', 'مشرف إنتاج', 'Production', 8000.00, '+20 100 111 2233', 'ahmed.mohamed@alwasiloon.com', '2022-03-15'),
('فاطمة إبراهيم', 'أخصائية مراقبة جودة', 'QualityControl', 6500.00, '+20 101 222 3344', 'fatima.ibrahim@alwasiloon.com', '2023-01-10'),
('محمد حسن', 'عامل آلات', 'Production', 5500.00, '+20 102 333 4455', 'mohamed.hassan@alwasiloon.com', '2021-11-20'),
('أميرة علي', 'مديرة مخازن', 'Storage', 7000.00, '+20 103 444 5566', 'amira.ali@alwasiloon.com', '2022-07-08'),
('خالد محمود', 'فني صيانة', 'Maintenance', 6000.00, '+20 104 555 6677', 'khaled.mahmoud@alwasiloon.com', '2023-05-22');

-- Create views for common queries
CREATE VIEW v_storage_summary AS
SELECT 
    item_name,
    SUM(quantity_in_tons) as total_quantity,
    AVG(purchase_price_per_ton) as avg_price,
    SUM(quantity_in_tons * purchase_price_per_ton) as total_value,
    COUNT(*) as batch_count,
    MAX(purchase_date) as latest_purchase
FROM storage_items 
GROUP BY item_name
HAVING total_quantity > 0;

CREATE VIEW v_monthly_sales AS
SELECT 
    DATE_FORMAT(sale_date, '%Y-%m') as month,
    COUNT(*) as sales_count,
    SUM(total_amount) as total_revenue,
    SUM(quantity_tons + (quantity_kg / 1000)) as total_quantity_tons
FROM sales 
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY month DESC;

CREATE VIEW v_worker_summary AS
SELECT 
    w.id,
    w.name,
    w.position,
    w.department,
    w.salary,
    COUNT(wa.id) as attendance_days,
    SUM(CASE WHEN wa.status = 'present' THEN 1 ELSE 0 END) as present_days,
    SUM(CASE WHEN wa.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
    SUM(wa.hours_worked) as total_hours
FROM workers w
LEFT JOIN worker_attendance wa ON w.id = wa.worker_id 
    AND wa.attendance_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
WHERE w.is_active = TRUE
GROUP BY w.id;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE sp_add_sale(
    IN p_product_name VARCHAR(100),
    IN p_quantity_tons DECIMAL(10,3),
    IN p_quantity_kg DECIMAL(10,3),
    IN p_total_amount DECIMAL(12,2),
    IN p_sale_date DATE,
    IN p_client_name VARCHAR(100),
    IN p_client_contact VARCHAR(50)
)
BEGIN
    DECLARE v_available_quantity DECIMAL(10,3);
    DECLARE v_requested_quantity DECIMAL(10,3);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Calculate requested quantity in tons
    SET v_requested_quantity = p_quantity_tons + (p_quantity_kg / 1000);
    
    -- Check available quantity
    SELECT COALESCE(SUM(quantity_in_tons), 0) INTO v_available_quantity
    FROM storage_items 
    WHERE item_name = p_product_name;
    
    IF v_requested_quantity > v_available_quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient quantity in storage';
    END IF;
    
    -- Insert sale
    INSERT INTO sales (
        product_name, quantity_tons, quantity_kg, total_amount,
        sale_date, client_name, client_contact
    ) VALUES (
        p_product_name, p_quantity_tons, p_quantity_kg, p_total_amount,
        p_sale_date, p_client_name, p_client_contact
    );
    
    -- Deduct from storage (FIFO)
    CALL sp_deduct_from_storage(p_product_name, v_requested_quantity);
    
    COMMIT;
END //

CREATE PROCEDURE sp_deduct_from_storage(
    IN p_product_name VARCHAR(100),
    IN p_quantity DECIMAL(10,3)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_item_id INT;
    DECLARE v_available DECIMAL(10,3);
    DECLARE v_to_deduct DECIMAL(10,3);
    DECLARE remaining DECIMAL(10,3) DEFAULT p_quantity;
    
    DECLARE storage_cursor CURSOR FOR
        SELECT id, quantity_in_tons
        FROM storage_items
        WHERE item_name = p_product_name AND quantity_in_tons > 0
        ORDER BY created_at ASC;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN storage_cursor;
    
    storage_loop: LOOP
        FETCH storage_cursor INTO v_item_id, v_available;
        IF done OR remaining <= 0 THEN
            LEAVE storage_loop;
        END IF;
        
        SET v_to_deduct = LEAST(remaining, v_available);
        
        UPDATE storage_items
        SET quantity_in_tons = quantity_in_tons - v_to_deduct
        WHERE id = v_item_id;
        
        SET remaining = remaining - v_to_deduct;
    END LOOP;
    
    CLOSE storage_cursor;
    
    -- Clean up zero quantity items
    DELETE FROM storage_items WHERE quantity_in_tons <= 0;
END //

DELIMITER ;

-- Create triggers for audit logging
DELIMITER //

CREATE TRIGGER tr_sales_insert AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, table_name, record_id, new_values)
    VALUES ('INSERT', 'sales', NEW.id, JSON_OBJECT(
        'product_name', NEW.product_name,
        'quantity_tons', NEW.quantity_tons,
        'total_amount', NEW.total_amount,
        'client_name', NEW.client_name
    ));
END //

CREATE TRIGGER tr_sales_update AFTER UPDATE ON sales
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, table_name, record_id, old_values, new_values)
    VALUES ('UPDATE', 'sales', NEW.id, 
        JSON_OBJECT('product_name', OLD.product_name, 'total_amount', OLD.total_amount),
        JSON_OBJECT('product_name', NEW.product_name, 'total_amount', NEW.total_amount)
    );
END //

CREATE TRIGGER tr_sales_delete AFTER DELETE ON sales
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, table_name, record_id, old_values)
    VALUES ('DELETE', 'sales', OLD.id, JSON_OBJECT(
        'product_name', OLD.product_name,
        'total_amount', OLD.total_amount,
        'client_name', OLD.client_name
    ));
END //

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_sales_product_date ON sales(product_name, sale_date);
CREATE INDEX idx_storage_name_quantity ON storage_items(item_name, quantity_in_tons);
CREATE INDEX idx_expenses_category_date ON expenses(category, expense_date);
CREATE INDEX idx_workers_dept_active ON workers(department, is_active);

-- Final message
SELECT 'Database schema created successfully!' as Status;