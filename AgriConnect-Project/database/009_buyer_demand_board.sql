-- AgriConnect KE — Migration 009: Buyer demand board
-- Buyers can publish crop requirements; farmers can discover demand.
CREATE TABLE IF NOT EXISTS buyer_demands (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Other',
  quantity_kg DECIMAL(10,2) NOT NULL,
  max_price_per_kg_kes DECIMAL(10,2) NULL,
  county VARCHAR(50) NOT NULL,
  required_by DATE NULL,
  quality_notes VARCHAR(1000) NULL,
  status ENUM('OPEN','CLOSED','FULFILLED') NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_buyer_demands_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_buyer_demands_open_crop (status, crop_name),
  INDEX idx_buyer_demands_county (county, status),
  INDEX idx_buyer_demands_buyer (buyer_id, status)
) ENGINE=InnoDB;
