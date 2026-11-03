-- 009: profile customization (profile image + short bio)
-- Idempotent: only adds the columns if they do not already exist.

SET @exists_profile := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_image'
);
SET @sql_profile := IF(
  @exists_profile = 0,
  "ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL AFTER county",
  "SELECT 1"
);
PREPARE stmt_profile FROM @sql_profile;
EXECUTE stmt_profile;
DEALLOCATE PREPARE stmt_profile;

SET @exists_bio := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'bio'
);
SET @sql_bio := IF(
  @exists_bio = 0,
  "ALTER TABLE users ADD COLUMN bio VARCHAR(500) NULL AFTER profile_image",
  "SELECT 1"
);
PREPARE stmt_bio FROM @sql_bio;
EXECUTE stmt_bio;
DEALLOCATE PREPARE stmt_bio;
