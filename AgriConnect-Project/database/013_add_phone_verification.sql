-- Migration: Add phone verification fields to users table
-- Adds is_phone_verified and phone_verified_at (phone_number column already exists).
-- Idempotent: safe to run multiple times.

-- Add is_phone_verified column
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'is_phone_verified'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN is_phone_verified TINYINT(1) DEFAULT 0 NOT NULL AFTER phone_number',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add phone_verified_at timestamp
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'phone_verified_at'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN phone_verified_at DATETIME NULL AFTER is_phone_verified',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;