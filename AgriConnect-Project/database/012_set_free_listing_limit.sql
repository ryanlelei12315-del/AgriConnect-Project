-- Align the configurable Starter plan with the public free-tier policy.
-- Active published listings count; drafts, sold, pending and inactive records do not.
UPDATE plans SET max_listings = 10 WHERE slug = 'starter';
UPDATE plan_features
SET limit_value = 10
WHERE plan_id = (SELECT id FROM plans WHERE slug = 'starter')
  AND feature_key = 'active_listings';
