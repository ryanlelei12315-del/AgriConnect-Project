SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS Kilimo_Management_System;
CREATE DATABASE Kilimo_Management_System;
USE Kilimo_Management_System;

-- ============================================
-- Users: farmers, buyers, service providers, admins
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    role ENUM('farmer', 'buyer', 'provider', 'admin') NOT NULL DEFAULT 'farmer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================
-- Farm fields belonging to users (farmers)
-- ============================================
CREATE TABLE farm_fields (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    field_name VARCHAR(50) NOT NULL,
    total_acres DECIMAL(6,2) NOT NULL,
    acreage DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- Crop production cycles tied to a user and field
-- ============================================
CREATE TABLE crop_production_cycles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    field_id INT NOT NULL,
    crop_name VARCHAR(50) NOT NULL,
    variety VARCHAR(50),
    planting_date DATE NOT NULL,
    harvest_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES farm_fields(id) ON DELETE CASCADE
);

-- ============================================
-- Produce orders (marketplace)
-- ============================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- ============================================
-- Messages between users
-- ============================================
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_recipient_id (recipient_id)
);

-- ============================================
-- Farm employees (farm workers tracked by user)
-- ============================================
CREATE TABLE farm_employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    assigned_sector VARCHAR(50) NOT NULL,
    job_title VARCHAR(50) NOT NULL,
    daily_wage_kes DECIMAL(10,2) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- Weather and soil logs tied to a field
-- ============================================
CREATE TABLE weather_and_soil_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    field_id INT NOT NULL,
    recording_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    air_temperature_celsius DECIMAL(4,1),
    rainfall_mm DECIMAL(5,2),
    soil_moisture_percentage DECIMAL(4,1),
    soil_ph DECIMAL(3,1),
    FOREIGN KEY (field_id) REFERENCES farm_fields(id) ON DELETE CASCADE,
    INDEX idx_field_id (field_id)
);

-- ============================================
-- Livestock manager (animals owned by user)
-- ============================================
CREATE TABLE livestock_manager (
    animal_tag_id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    health_status VARCHAR(50) DEFAULT 'Healthy',
    daily_feed_intake_kg DECIMAL(5,2),
    daily_production_yield DECIMAL(6,2),
    assigned_handler_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_handler_id) REFERENCES farm_employees(employee_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- Farm inventory items owned by user
-- ============================================
CREATE TABLE farm_inventory (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    inventory_type ENUM('Consumable', 'Permanent Tool') NOT NULL,
    quantity_in_stock DECIMAL(10,2) NOT NULL,
    unit_of_measure ENUM('Bags', 'Liters', 'Units', 'Kilograms'),
    last_restock_date DATE,
    reorder_level DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- Farm financial ledger (tied to user and optionally to field, employee, item, animal)
-- ============================================
CREATE TABLE farm_financial_ledger (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type ENUM('Sales', 'Expense', 'Employee Payment') NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    total_amount_kes DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'M-Pesa',
    transaction_description TEXT,
    associated_employee_id INT,
    associated_field_id INT,
    associated_item_id INT,
    associated_animal_tag VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (associated_employee_id) REFERENCES farm_employees(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (associated_field_id) REFERENCES farm_fields(id) ON DELETE SET NULL,
    FOREIGN KEY (associated_item_id) REFERENCES farm_inventory(item_id) ON DELETE SET NULL,
    FOREIGN KEY (associated_animal_tag) REFERENCES livestock_manager(animal_tag_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_date (transaction_date)
);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Seed data
-- Note: Passwords are placeholder bcrypt hashes ($2a$10$...). Register via API for working accounts.
-- ============================================
INSERT INTO users (full_name, email, password, phone_number, role) VALUES
('John Mwangi', 'john.mwangi@example.com', '$2a$10$R0T7qJpxKWv6qH2yPvQ5le4z7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT', '0712345678', 'farmer'),
('Grace Njeri', 'grace.njeri@example.com', '$2a$10$R0T7qJpxKWv6qH2yPvQ5le4z7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT', '0723456789', 'buyer'),
('Peter Otieno', 'peter.otieno@example.com', '$2a$10$R0T7qJpxKWv6qH2yPvQ5le4z7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT', '0734567890', 'farmer'),
('Mary Wanjiku', 'mary.wanjiku@example.com', '$2a$10$R0T7qJpxKWv6qH2yPvQ5le4z7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT', '0745678901', 'provider'),
('David Kimani', 'david.kimani@example.com', '$2a$10$R0T7qJpxKWv6qH2yPvQ5le4z7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT', '0756789012', 'admin');

INSERT INTO farm_fields (user_id, field_name, total_acres, acreage) VALUES
(1, 'Ngong Plains', 12.50, 8.00),
(1, 'Kiambu Greenhouse', 4.00, 3.50),
(1, 'Kajiado Ranch', 25.00, 18.00),
(3, 'Nanyuki Highveld', 15.00, 10.00),
(3, 'Meru Hillside', 8.50, 6.00);

INSERT INTO crop_production_cycles (user_id, field_id, crop_name, variety, planting_date, harvest_date) VALUES
(1, 1, 'Maize', 'HB523', '2026-03-15', '2026-08-15'),
(1, 2, 'Tomatoes', 'Money Maker', '2026-04-01', '2026-07-30'),
(3, 4, 'Potatoes', 'Shangi', '2026-02-20', '2026-07-20'),
(1, 3, 'Sorghum', 'Serengeti', '2026-05-01', '2026-09-01'),
(3, 5, 'Beans', 'Rosecoco', '2026-04-15', '2026-08-15');

INSERT INTO orders (user_id, status) VALUES
(2, 'completed'),
(2, 'confirmed'),
(4, 'pending');

INSERT INTO messages (sender_id, recipient_id, content, read) VALUES
(1, 2, 'Hello Grace, I have fresh maize available for sale.', 0),
(2, 1, 'Hi John, can you confirm the quantity and delivery terms?', 0),
(4, 1, 'John, we can install drip irrigation on your greenhouse field.', 1),
(1, 3, 'Peter, how are the potato yields looking on the highveld?', 0);

INSERT INTO farm_employees (user_id, full_name, assigned_sector, job_title, daily_wage_kes, phone_number) VALUES
(1, 'James Karanja', 'Crop Management', 'Field Supervisor', 1500.00, '0712345678'),
(1, 'Wanjiku Muthoni', 'Livestock Management', 'Animal Handler', 1200.00, '0723456789'),
(3, 'Otieno Ochieng', 'Irrigation Management', 'Irrigation Technician', 1300.00, '0734567890');

INSERT INTO livestock_manager (animal_tag_id, user_id, animal_type, health_status, daily_feed_intake_kg, daily_production_yield, assigned_handler_id) VALUES
('COW001', 1, 'Cow', 'Healthy', 15.0, 20.0, 2),
('SHEEP001', 1, 'Sheep', 'Healthy', 5.0, 1.0, 2),
('GOAT001', 1, 'Goat', 'Healthy', 4.0, 0.5, 2);

INSERT INTO farm_inventory (user_id, item_name, inventory_type, quantity_in_stock, unit_of_measure, last_restock_date, reorder_level) VALUES
(1, 'Fertilizer DAP', 'Consumable', 100.0, 'Bags', '2026-05-01', 20.0),
(1, 'Pesticide', 'Consumable', 50.0, 'Liters', '2026-05-10', 10.0),
(1, 'Tractor', 'Permanent Tool', 2.0, 'Units', '2026-04-15', 1.0),
(3, 'Irrigation Pump', 'Permanent Tool', 1.0, 'Units', '2026-04-20', 1.0),
(1, 'Maize Seeds', 'Consumable', 200.0, 'Kilograms', '2026-05-05', 50.0);

INSERT INTO weather_and_soil_logs (field_id, air_temperature_celsius, rainfall_mm, soil_moisture_percentage, soil_ph) VALUES
(1, 28.5, 5.0, 32.0, 6.5),
(2, 26.0, 12.0, 38.0, 6.8),
(4, 24.0, 8.0, 45.0, 7.0),
(1, 29.0, 2.0, 28.0, 6.2),
(5, 25.0, 4.0, 30.0, 6.5);

INSERT INTO farm_financial_ledger (user_id, transaction_date, transaction_type, category_name, total_amount_kes, payment_method, transaction_description, associated_field_id, associated_item_id) VALUES
(1, '2026-06-15', 'Sales', 'Maize Sale', 50000.00, 'M-Pesa', 'Sale of maize harvested from Ngong Plains', 1, NULL),
(1, '2026-06-20', 'Expense', 'Fertilizer Purchase', 20000.00, 'M-Pesa', 'Purchase of fertilizer for Kiambu Greenhouse', 2, 1),
(1, '2026-06-25', 'Employee Payment', 'Wages for June', 15000.00, 'M-Pesa', 'Payment of wages to employees for June', NULL, NULL),
(3, '2026-07-01', 'Sales', 'Potato Sale', 35000.00, 'M-Pesa', 'Sale of potatoes harvested from Nanyuki Highveld', 4, NULL),
(3, '2026-07-05', 'Expense', 'Irrigation Setup', 25000.00, 'M-Pesa', 'Installation of drip irrigation on Meru Hillside', 5, 4);