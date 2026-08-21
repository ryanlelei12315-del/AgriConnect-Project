-- Add unit column to produce_listings
-- Run: mysql -u root -p Smart_Kilimo < database/010_add_unit_to_listings.sql

ALTER TABLE produce_listings
  ADD COLUMN unit VARCHAR(20) NOT NULL DEFAULT 'kg' AFTER category;
