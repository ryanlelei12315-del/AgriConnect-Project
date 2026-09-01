-- 010: Add a display unit to produce listings.
-- This guard makes the migration safe when an installation was prepared
-- manually before migration history was introduced.
SET @unit_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produce_listings' AND COLUMN_NAME = 'unit'
);
SET @unit_sql := IF(
  @unit_exists = 0,
  'ALTER TABLE produce_listings ADD COLUMN unit VARCHAR(20) NOT NULL DEFAULT ''kg'' AFTER category',
  'SELECT 1'
);
PREPARE stmt_unit FROM @unit_sql;
EXECUTE stmt_unit;
DEALLOCATE PREPARE stmt_unit;
