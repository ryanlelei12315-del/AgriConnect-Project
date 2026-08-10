-- ============================================================
-- AgriConnect KE — Migration 002: Marketplace Engine
-- Adds produce listings, services, order items, and fixes
-- column naming so Sequelize models map cleanly.
--
-- Run: mysql -u root -p Smart_Kilimo < database/002_marketplace_engine.sql
-- ============================================================

USE Smart_Kilimo;

-- ------------------------------------------------------------
-- 1. Produce listings (the farmer's "sell" side)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produce_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Other',
    quantity_kg DECIMAL(10,2) NOT NULL,
    price_per_kg_kes DECIMAL(10,2) NOT NULL,
    county VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    status ENUM('LISTED','PENDING','SOLD') NOT NULL DEFAULT 'LISTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_listings_county_status (county, status),
    INDEX idx_listings_farmer (farmer_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. Service listings (the provider's "sell" side)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    price_kes DECIMAL(10,2) NOT NULL,
    county VARCHAR(50) NOT NULL,
    description TEXT,
    availability ENUM('AVAILABLE','BOOKED','UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_services_county (county),
    INDEX idx_services_provider (provider_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. Order items — real line items on an order
--    (orders table already exists; we attach line items to it)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    listing_id INT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    unit_price_kes DECIMAL(10,2) NOT NULL,
    total_kes DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES produce_listings(id) ON DELETE RESTRICT,
    INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. Add buyer_id to orders (currently only has user_id = owner)
--    We keep user_id as the buyer for backward compat, and add
--    seller_id so the farmer can see incoming orders.
-- ------------------------------------------------------------
ALTER TABLE orders
    ADD COLUMN seller_id INT NULL AFTER user_id,
    ADD COLUMN total_kes DECIMAL(12,2) NULL AFTER status,
    ADD COLUMN mpesa_ref VARCHAR(50) NULL AFTER total_kes,
    ADD CONSTRAINT fk_orders_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 5. Seed a few realistic listings + services so the app
--    demos beautifully on first run.
-- ------------------------------------------------------------
INSERT INTO produce_listings (farmer_id, name, category, quantity_kg, price_per_kg_kes, county, description, status) VALUES
(1, 'Cherry Tomatoes', 'Vegetables', 120.00, 90.00, 'Uasin Gishu', 'Fresh greenhouse cherry tomatoes, harvested this morning.', 'LISTED'),
(1, 'White Maize', 'Cereals', 500.00, 55.00, 'Nakuru', 'Grade A white maize, dry and ready for milling.', 'LISTED'),
(3, 'Irish Potatoes', 'Root Crops', 300.00, 70.00, 'Meru', 'Shangi variety, clean and sorted.', 'LISTED'),
(3, 'Red Onions', 'Vegetables', 200.00, 65.00, 'Kajiado', 'Red creole onions, medium size.', 'LISTED');

INSERT INTO services (provider_id, category, title, price_kes, county, description, availability) VALUES
(4, 'Machinery', 'Tractor Repair', 3500.00, 'Uasin Gishu', 'On-farm tractor and implement repair.', 'AVAILABLE'),
(4, 'Transport', 'Farm Transport', 2000.00, 'Nakuru', 'Pickup and lorry transport for produce.', 'AVAILABLE'),
(4, 'Infrastructure', 'Irrigation Setup', 5000.00, 'Meru', 'Drip and sprinkler irrigation installation.', 'AVAILABLE'),
(4, 'Labour', 'Harvest Labor', 800.00, 'Kajiado', 'Daily harvest labor crew.', 'AVAILABLE');