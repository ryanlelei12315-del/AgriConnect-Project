-- AgriConnect KE - Migration 005: Add updated_at to order_items
-- order_items was created with only created_at; the model needs both timestamps.
ALTER TABLE order_items
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
