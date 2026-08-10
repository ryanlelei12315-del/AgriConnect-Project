-- ============================================================
-- AgriConnect KE — Migration 003: User county
-- Adds county to users so listings can show farmer/provider location.
--
-- Run: mysql -u root -p Smart_Kilimo < database/003_user_county.sql
-- ============================================================

USE Smart_Kilimo;

-- NOTE: plain ADD COLUMN (no IF NOT EXISTS) for MySQL < 8.0.29 compatibility.
ALTER TABLE users
    ADD COLUMN county VARCHAR(50) NULL AFTER phone_number;

-- Backfill seed users with realistic counties
UPDATE users SET county = 'Kiambu'   WHERE id = 1;
UPDATE users SET county = 'Nairobi'  WHERE id = 2;
UPDATE users SET county = 'Meru'     WHERE id = 3;
UPDATE users SET county = 'Uasin Gishu' WHERE id = 4;
UPDATE users SET county = 'Nairobi'  WHERE id = 5;