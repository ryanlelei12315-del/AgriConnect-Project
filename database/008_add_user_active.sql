-- ============================================================
-- AgriConnect KE — Migration 008: Add users.is_active (guarded)
--
-- Adds the is_active flag introduced by the current User model
-- (models/User.js) and originally staged in 007_add_indexes.sql.
-- 007 was never applied on this database (no schema_migrations
-- table), so this applies ONLY the users.is_active change in a
-- way that is safe to run repeatedly:
--   * checks the information_schema before ALTERing
--   * MySQL 8.0.29+ can also use another guard path, but this
--     works on all versions.
-- ============================================================

USE Smart_Kilimo;

-- Add the column only if it does not already exist
SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'Smart_Kilimo'
      AND TABLE_NAME   = 'users'
      AND COLUMN_NAME  = 'is_active'
);

SET @ddl := IF(
    @col_exists = 0,
    'ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1',
    'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;