-- ============================================================
-- AgriConnect KE — Marketplace Schema & Seed Data
-- Compatible with the live database (Smart_Kilimo).
--
-- Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS Smart_Kilimo;
USE Smart_Kilimo;

-- ------------------------------------------------------------
-- Listings: produce posted by farmers for buyers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    county VARCHAR(100) NOT NULL,
    sub_county VARCHAR(100) NOT NULL,
    farmer_name VARCHAR(150) NOT NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Seed: 6 hyper-realistic listings from active trading hubs
-- ------------------------------------------------------------
INSERT INTO listings (title, category, quantity, unit, price_per_unit, county, sub_county, farmer_name, farmer_phone, image_url) VALUES
('F1 Shangi Potatoes',       'Root Crops',      120, '90kg Bag',       3500.00, 'Nakuru',        'Molo',            'Joseph Kiprotich',  '0712345678', NULL),
('Premium White Maize',      'Cereals',          80, '90kg Bag',       4200.00, 'Trans Nzoia',   'Kitale',          'Eunice Wanjiku',   '0723456789', NULL),
('Fresh Roma Tomatoes',       'Vegetables',      60, 'Crate',          2800.00, 'Uasin Gishu',   'Moiben',          'Peter Kipkoech',   '0734567890', NULL),
('Hass Avocados',            'Fruits',           50, '50kg Crate',     4500.00, 'Murang''a',     'Kandara',         'Mary Nyambura',    '0745678901', NULL),
('Sukuma Wiki (Kales)',      'Vegetables',     300, 'Bunch Crate',      500.00, 'Kiambu',        'Juja',            'Samuel Mwangi',    '0756789012', NULL),
('Red Creole Onions',        'Vegetables',      90, '90kg Bag',       3200.00, 'Kajiado',       'Ngong',           'Grace Wambui',     '0767890123', NULL);