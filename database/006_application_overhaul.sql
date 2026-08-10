-- ============================================================
-- AgriConnect KE — Migration 006: Application Overhaul
-- Adds market_prices, notifications, service_requests, reviews,
-- and INACTIVE status for produce_listings.
-- ============================================================

USE Smart_Kilimo;

-- 1. Modify produce_listings to support INACTIVE
ALTER TABLE produce_listings
    MODIFY COLUMN status ENUM('LISTED','PENDING','SOLD','INACTIVE') NOT NULL DEFAULT 'LISTED';

-- 2. Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    requester_id INT NOT NULL,
    provider_id INT NOT NULL,
    description TEXT,
    location VARCHAR(100) NOT NULL,
    requested_date DATE NOT NULL,
    status ENUM('PENDING','ACCEPTED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Create market_prices table
CREATE TABLE IF NOT EXISTS market_prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produce_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    market_name VARCHAR(100) NOT NULL,
    county VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_change DECIMAL(5,2) DEFAULT 0.00,
    source VARCHAR(100) DEFAULT 'AgriConnect Data',
    recorded_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'ORDER', 'SYSTEM', 'MESSAGE'
    related_id INT, -- To optionally link to an order/message id
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    service_id INT,
    order_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Seed Market Prices Data
INSERT INTO market_prices (produce_name, category, market_name, county, price, unit, price_change, recorded_at) VALUES
('Dry Maize', 'Cereals', 'Eldoret Main Market', 'Uasin Gishu', 65.00, 'kg', 4.20, CURRENT_DATE),
('Yellow Beans', 'Legumes', 'Eldoret Main Market', 'Uasin Gishu', 135.00, 'kg', -1.80, CURRENT_DATE),
('Shangi Potatoes', 'Root Crops', 'Nakuru Wakulima', 'Nakuru', 52.00, 'kg', 2.10, CURRENT_DATE),
('Roma Tomatoes', 'Vegetables', 'Kongowea', 'Mombasa', 85.00, 'kg', 0.50, CURRENT_DATE),
('Red Onions', 'Vegetables', 'Marikiti', 'Nairobi', 110.00, 'kg', -0.50, CURRENT_DATE),
('Hass Avocados', 'Fruits', 'Muranga Market', 'Murang''a', 15.00, 'piece', 0.00, CURRENT_DATE);

-- 7. Seed Notifications Data (for demo users, user 1 and 2 usually exist from 003 seed)
INSERT INTO notifications (user_id, title, message, type, related_id) VALUES
(1, 'Welcome to AgriConnect KE', 'Complete your profile to start selling produce.', 'SYSTEM', NULL),
(2, 'Welcome to AgriConnect KE', 'Explore fresh produce directly from farmers.', 'SYSTEM', NULL);
