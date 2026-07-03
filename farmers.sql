create database Kilimo_Management_System;
use Kilimo_Management_System;
CREATE TABLE Farm_Employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    assigned_sector VARCHAR(50) NOT NULL, 
    job_title VARCHAR(50) NOT NULL,
    daily_wage_kes DECIMAL(10,2) NOT NULL,
    phone_number VARCHAR(20)
);


CREATE TABLE Farm_Fields (
    field_id INT PRIMARY KEY AUTO_INCREMENT,
    field_name VARCHAR(50) NOT NULL UNIQUE, 
    total_acres DECIMAL(6,2) NOT NULL, 
    acreage DECIMAL(6,2) NOT NULL
    
);


CREATE TABLE Crop_Production_Cycles (
    cycle_id INT PRIMARY KEY AUTO_INCREMENT,
    field_id INT NOT NULL,
    crop_name VARCHAR(50) NOT NULL,         
    variety VARCHAR(50),                     
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    cycle_status VARCHAR(30) DEFAULT 'Active',
    FOREIGN KEY (field_id) REFERENCES Farm_Fields(field_id) ON DELETE RESTRICT
);

CREATE TABLE Weather_And_Soil_Logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    recording_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    field_id INT NOT NULL, 
    air_temperature_celsius DECIMAL(4,1),
    rainfall_mm DECIMAL(5,2),
    soil_moisture_percentage DECIMAL(4,1),
    soil_ph DECIMAL(3,1),
    FOREIGN KEY (field_id) REFERENCES Farm_Fields(field_id) ON DELETE CASCADE
);


CREATE TABLE Livestock_Manager (
    animal_tag_id VARCHAR(50) PRIMARY KEY,
    animal_type VARCHAR(50) NOT NULL,       
    health_status VARCHAR(50) DEFAULT 'Healthy',
    daily_feed_intake_kg DECIMAL(5,2), --
    daily_production_yield DECIMAL(6,2),   -- e.g 200Liters of milk or 30 number of eggs
    assigned_handler_id INT,               -- Connects directly to the employee looking after them
    FOREIGN KEY (assigned_handler_id) REFERENCES Farm_Employees(employee_id) ON DELETE SET NULL
);


CREATE TABLE Farm_Inventory (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,        
    inventory_type ENUM('Consumable', 'Permanent Tool') NOT NULL,
    quantity_in_stock DECIMAL(10,2) NOT NULL,
    unit_of_measure ENUM('Bags', 'Liters', 'Units', 'Kilograms'),
    last_restock_date DATE,
    reorder_level DECIMAL(10,2) NOT NULL     
);

CREATE TABLE Farm_Financial_Ledger (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_date DATE NOT NULL,
    transaction_type ENUM('Sales', 'Expense', 'Employee Payment') NOT NULL,    
    category_name VARCHAR(50) NOT NULL,         -- 'Maize Sale', 'Fuel Purchase', 'Wages'
    total_amount_kes DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'M-Pesa',
    transaction_description TEXT,
    associated_employee_id INT NULL,            
    associated_field_id INT NULL,              
    associated_item_id INT NULL,                
    associated_animal_tag VARCHAR(50) NULL,    
    FOREIGN KEY (associated_employee_id) REFERENCES Farm_Employees(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (associated_field_id) REFERENCES Farm_Fields(field_id) ON DELETE SET NULL,
    FOREIGN KEY (associated_item_id) REFERENCES Farm_Inventory(item_id) ON DELETE SET NULL,
    FOREIGN KEY (associated_animal_tag) REFERENCES Livestock_Manager(animal_tag_id) ON DELETE SET NULL
);


-- seed data to the database but use kenyan names and realistic values

INSERT INTO Farm_Fields (field_name, total_acres, acreage) VALUES
('Field 1', 10.5, 2.5),
('Field 2', 8.2, 1.8),
('Field 3', 12.3, 3.0),
('Field 4', 15.0, 4.0),
('Field 5', 20.0, 5.0);
INSERT INTO Farm_Employees (full_name, assigned_sector, job_title, daily_wage_kes, phone_number) VALUES
('John Mwangi', 'Crop Management', 'Field Supervisor', 1500.00, '0712345678'),
('Grace Njeri', 'Livestock Management', 'Animal Handler', 1200.00, '0723456789'),
('Peter Otieno', 'Irrigation Management', 'Irrigation Technician', 1300.00, '0734567890'),
('Mary Wanjiku', 'Pest Control', 'Pest Control Officer', 1100.00, '0745678901'),
('David Kimani', 'Harvesting and Post-Harvest Management', 'Harvesting Supervisor', 1400.00, '0756789012');
INSERT INTO Crop_Production_Cycles (field_id, crop_name, variety, planting_date, expected_harvest_date) VALUES
(1, 'Maize', 'Dekalb', '2023-06-15', '2023-08-15'),
(2, 'Cotton', 'Dekalb', '2023-07-10', '2023-09-10'),
(3, 'Wheat', 'Kenya Seed Company', '2023-05-20', '2023-07-20'),
(4, 'Sorghum', 'Serengeti', '2023-06-01', '2023-08-01'),
(5, 'Beans', 'Rosecoco', '2023-07-01', '2023-09-01');
INSERT INTO Livestock_Manager (animal_tag_id, animal_type, health_status, daily_feed_intake_kg, daily_production_yield, assigned_handler_id) VALUES
('COW001', 'Cow', 'Healthy', 15.0, 20.0, 2),
('SHEEP001', 'Sheep', 'Healthy', 5.0, 1.0, 2),
('GOAT001', 'Goat', 'Healthy', 4.0, 0.5, 2),
('PIG001', 'Pig', 'Healthy', 10.0, 5.0, 2),
('CHICKEN001', 'Chicken', 'Healthy', 0.5, 0.3, 2);
INSERT INTO Farm_Inventory (item_name, inventory_type, quantity_in_stock, unit_of_measure, last_restock_date, reorder_level) VALUES
('Fertilizer', 'Consumable', 100.0, 'Bags', '2023-06-01', 20.0),
('Pesticide', 'Consumable', 50.0, 'Liters', '2023-06-10', 10.0),
('Tractor', 'Permanent Tool', 2.0, 'Units', '2023-05-15', 1.0),
('Irrigation Pump', 'Permanent Tool', 1.0, 'Units', '2023-05-20', 1.0),
('Seeds - Maize', 'Consumable', 200.0, 'Kilograms', '2023-06-05', 50.0);    
INsert into Weather_And_Soil_Logs (field_id, air_temperature_celsius, rainfall_mm, soil_moisture_percentage, soil_ph) VALUES
(1, 25.5, 10.0, 30.0, 6.5),
(2, 26.0, 15.0, 35.0, 6.8),
(3, 24.0, 5.0, 25.0, 6.2),
(4, 27.0, 20.0, 40.0, 7.0),
(5, 23.5, 8.0, 28.0, 6.4);
 INSERT INTO Farm_Fields (field_name, total_acres, acreage) VALUES
('Field 1', 10.5, 2.5),
('Field 2', 8.2, 1.8),
('Field 3', 12.3, 3.0),
('Field 4', 15.0, 4.0),
('Field 5', 20.0, 5.0);
INSERT INTO Farm_Financial_Ledger (transaction_date, transaction_type, category_name, total_amount_kes, payment_method, transaction_description, associated_employee_id, associated_field_id, associated_item_id, associated_animal_tag) VALUES
('2023-06-15', 'Sales', 'Maize Sale', 50000.00, 'M-Pesa', 'Sale of maize harvested from Field 1', NULL, 1, NULL, NULL),
('2023-06-20', 'Expense', 'Fertilizer Purchase', 20000.00, 'M-Pesa', 'Purchase of fertilizer for Field 2', NULL, 2, 1, NULL),
('2023-06-25', 'Employee Payment', 'Wages for June', 15000.00, 'M-Pesa', 'Payment of wages to employees for June', 1, NULL, NULL, NULL),
('2023-07-01', 'Sales', 'Cotton Sale', 30000.00, 'M-Pesa', 'Sale of cotton harvested from Field 2', NULL, 2, NULL, NULL),
('2023-07-05', 'Expense', 'Pesticide Purchase', 10000.00, 'M-Pesa', 'Purchase of pesticide for Field 3', NULL, 3, 2, NULL);
--: Which crops are currently in which fields, and when are they expected to be harvested?
--: Gives you a quick list of what crops are currently in which fields and when you should prepare to harvest them.
SELECT 
    f.field_name, 
    c.crop_name, 
    c.variety, 
    c.expected_harvest_date
FROM Crop_Production_Cycles c
JOIN Farm_Fields f ON c.field_id = f.field_id
WHERE c.cycle_status = 'Active';
+------------+-----------+--------------------+-----------------------+
| field_name | crop_name | variety            | expected_harvest_date |
+------------+-----------+--------------------+-----------------------+
| Field 1    | Maize     | Dekalb             | 2023-08-15            |
| Field 2    | Cotton    | Dekalb             | 2023-09-10            |
| Field 3    | Wheat     | Kenya Seed Company | 2023-07-20            |
| Field 4    | Sorghum   | Serengeti          | 2023-08-01            |
| Field 5    | Beans     | Rosecoco           | 2023-09-01            |
| Field 1    | Maize     | Dekalb             | 2023-08-15            |
| Field 2    | Cotton    | Dekalb             | 2023-09-10            |
| Field 3    | Wheat     | Kenya Seed Company | 2023-07-20            |
| Field 4    | Sorghum   | Serengeti          | 2023-08-01            |
| Field 5    | Beans     | Rosecoco           | 2023-09-01            |
+------------+-----------+---
-- How much cash have we spent on expenses for each individual field?--
--Tallies up all recorded expenses for each specific field so you can see where your money is going.
SELECT 
    f.field_name, 
    SUM(l.total_amount_kes) AS total_expenses
FROM Farm_Financial_Ledger l
JOIN Farm_Fields f ON l.associated_field_id = f.field_id
WHERE l.transaction_type = 'Expense'
GROUP BY f.field_name;
+------------+----------------+
| field_name | total_expenses |
+------------+----------------+
| Field 2    |       20000.00 |
| Field 3    |       10000.00 |
+------------+----------------+
--. Which high-performing livestock are yielding over 5 units, and who is looking after them?
--Lists all livestock that are producing above a certain yield threshold, along with the name of their assigned caretaker, so you can quickly identify high-performing animals and who is responsible for them.
SELECT 
    l.animal_tag_id, 
    l.animal_type, 
    l.daily_production_yield, 
    e.full_name AS caretaker_name
FROM Livestock_Manager l
LEFT JOIN Farm_Employees e ON l.assigned_handler_id = e.employee_id
WHERE l.daily_production_yield > 5.0;
+---------------+-------------+------------------------+----------------+
| animal_tag_id | animal_type | daily_production_yield | caretaker_name |
+---------------+-------------+------------------------+----------------+
| COW001        | Cow         |                  20.00 | Grace Njeri    |
+---------------+-------------+------------------------+----------------+
--Which fields have recently experienced high heat and low rainfall?
--Pulls a list of fields that have recently experienced high heat (above 25°C) and low rainfall, which might indicate a need for irrigation.
SELECT 
    field_id, 
    air_temperature_celsius, 
    rainfall_mm, 
    recording_time
FROM Weather_And_Soil_Logs
WHERE air_temperature_celsius > 25.0 AND rainfall_mm < 15.0;
+----------+-------------------------+-------------+---------------------+
| field_id | air_temperature_celsius | rainfall_mm | recording_time      |
+----------+-------------------------+-------------+---------------------+
|        1 |                    25.5 |       10.00 | 2026-06-02 12:23:51 |
|        1 |                    25.5 |       10.00 | 2026-06-02 22:08:00 |
+----------+-------------------------+-------------+---------------------+
-- What are the daily wage rates and job roles of our farm employees?
--Displays all employees, their job titles, and what it costs the farm to pay them for a single day.
SELECT 
    full_name, 
    job_title, 
    assigned_sector, 
    daily_wage_kes
FROM Farm_Employees
ORDER BY daily_wage_kes DESC;
+--------------+-----------------------+----------------------------------------+----------------+
| full_name    | job_title             | assigned_sector                        | daily_wage_kes |
+--------------+-----------------------+----------------------------------------+----------------+
| John Mwangi  | Field Supervisor      | Crop Management                        |        1500.00 |
| David Kimani | Harvesting Supervisor | Harvesting and Post-Harvest Management |        1400.00 |
| Peter Otieno | Irrigation Technician | Irrigation Management                  |        1300.00 |
| Grace Njeri  | Animal Handler        | Livestock Management                   |        1200.00 |
| Mary Wanjiku | Pest Control Officer  | Pest Control                           |        1100.00 |
+--------------+-----------------------+----------------------------------------+---------------