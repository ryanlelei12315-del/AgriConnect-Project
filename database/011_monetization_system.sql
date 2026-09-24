-- ============================================================
-- AgriConnect KE — Migration 011: Monetization System
-- Core monetization subsystem: plans, entitlements, payments,
-- subscriptions, listing promotions, leads, business profiles,
-- revenue ledger, audit logs, and platform configuration.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Platform configuration (pricing, commission, PayBill info)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_config (
    `key`           VARCHAR(100) PRIMARY KEY,
    `value`         TEXT NOT NULL,
    `data_type`     ENUM('string','number','json','boolean') NOT NULL DEFAULT 'string',
    `description`   VARCHAR(255) NULL,
    `updated_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO platform_config (`key`, `value`, `data_type`, `description`) VALUES
('transaction_commission_pct', '3.0',   'number',  'Platform commission percentage on marketplace transactions'),
('currency',                   'KES',   'string',  'Default platform currency'),
('paybill_number',             '',      'string',  'M-Pesa PayBill number for manual payments'),
('till_number',                '',      'string',  'M-Pesa Till number for manual payments'),
('default_free_plan_id',       '1',     'number',  'Plan ID to assign new users by default');

-- ------------------------------------------------------------
-- 2. Subscription plans
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(50)  NOT NULL UNIQUE,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    billing_interval VARCHAR(20) NOT NULL DEFAULT 'month',
    currency        VARCHAR(10)  NOT NULL DEFAULT 'KES',
    max_listings    INT          NOT NULL DEFAULT 3,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_public       BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order      INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plans_slug (slug),
    INDEX idx_plans_active (is_active, is_public)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. Plan features (configurable entitlements)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_features (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    plan_id     INT NOT NULL,
    feature_key VARCHAR(100) NOT NULL,
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    limit_value INT NULL,
    feature_value VARCHAR(255) NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    UNIQUE KEY uq_plan_feature (plan_id, feature_key),
    INDEX idx_plan_features_key (feature_key)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. Payments (generic, provider-agnostic)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    user_id             INT NOT NULL,
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'KES',
    payment_type        ENUM('SUBSCRIPTION','LISTING_BOOST','FEATURED_LISTING','ADVERTISEMENT','TRANSACTION','LEAD_PACKAGE','BUSINESS_PROMOTION','OTHER') NOT NULL,
    provider            ENUM('MANUAL','PAYHERO') NOT NULL DEFAULT 'MANUAL',
    provider_reference  VARCHAR(255) NULL,
    internal_reference  VARCHAR(100) NOT NULL UNIQUE,
    status              ENUM('PENDING','PROCESSING','PAID','FAILED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    price_snapshot      DECIMAL(10,2) NULL,
    metadata_json       TEXT NULL,
    paid_at             TIMESTAMP NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_user (user_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_provider_ref (provider_reference),
    INDEX idx_payments_type (payment_type)
) ENGINE=InnoDB;
-- ------------------------------------------------------------
-- 5. Subscriptions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    user_id             INT NOT NULL,
    plan_id             INT NOT NULL,
    status              ENUM('ACTIVE','EXPIRED','CANCELLED','PENDING','SUSPENDED') NOT NULL DEFAULT 'PENDING',
    start_at            TIMESTAMP NULL,
    end_at              TIMESTAMP NOT NULL,
    auto_renew          BOOLEAN NOT NULL DEFAULT FALSE,
    price_paid          DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'KES',
    billing_cycle       VARCHAR(20) NOT NULL DEFAULT 'month',
    payment_id          INT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_subs_user_status (user_id, status),
    INDEX idx_subs_end (end_at),
    INDEX idx_subs_active (status, end_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. Listing promotions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing_promotions (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    listing_id          INT NOT NULL,
    listing_type        ENUM('PRODUCE','SERVICE') NOT NULL,
    user_id             INT NOT NULL,
    promotion_type      ENUM('BOOST','FEATURED','SPONSORED') NOT NULL,
    start_at            TIMESTAMP NULL,
    end_at              TIMESTAMP NOT NULL,
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'KES',
    payment_status      ENUM('PENDING','PAID','FAILED','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    activation_status   ENUM('PENDING','ACTIVE','EXPIRED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
    payment_reference   VARCHAR(255) NULL,
    payment_id          INT NULL,
    metadata_json       TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_promos_listing (listing_id, listing_type),
    INDEX idx_promos_user (user_id),
    INDEX idx_promos_active (activation_status, end_at),
    INDEX idx_promos_payment_ref (payment_reference)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. Leads (potential customer interactions)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    listing_id          INT NULL,
    listing_type        ENUM('PRODUCE','SERVICE') NULL,
    seller_id           INT NOT NULL,
    buyer_id            INT NOT NULL,
    source              ENUM('LISTING','PROFILE','SEARCH','ADVERTISEMENT','REFERRAL','DIRECT') NOT NULL DEFAULT 'LISTING',
    message             TEXT NOT NULL,
    status              ENUM('NEW','CONTACTED','QUALIFIED','NEGOTIATING','CONVERTED','LOST','SPAM') NOT NULL DEFAULT 'NEW',
    price_snapshot      DECIMAL(10,2) NULL,
    metadata_json       TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_leads_seller (seller_id, status),
    INDEX idx_leads_buyer (buyer_id),
    INDEX idx_leads_created (created_at),
    INDEX idx_leads_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. Business profiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_profiles (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    user_id             INT NOT NULL,
    business_name       VARCHAR(150) NOT NULL,
    business_type       VARCHAR(100) NULL,
    description         TEXT,
    logo_url            VARCHAR(255) NULL,
    whatsapp_number     VARCHAR(20) NULL,
    phone_number        VARCHAR(20) NULL,
    website             VARCHAR(255) NULL,
    address             VARCHAR(255) NULL,
    county              VARCHAR(50) NULL,
    business_hours_json TEXT NULL,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token  VARCHAR(100) NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    metadata_json       TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_business_user (user_id),
    INDEX idx_business_verified (is_verified),
    INDEX idx_business_county (county)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. Business profile promotions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_promotions (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    business_profile_id INT NOT NULL,
    user_id             INT NOT NULL,
    start_at            TIMESTAMP NULL,
    end_at              TIMESTAMP NOT NULL,
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'KES',
    payment_status      ENUM('PENDING','PAID','FAILED','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    activation_status   ENUM('PENDING','ACTIVE','EXPIRED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
    payment_reference   VARCHAR(255) NULL,
    payment_id          INT NULL,
    metadata_json       TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_bpromos_active (activation_status, end_at),
    INDEX idx_bpromos_user (user_id),
    INDEX idx_bpromos_payment_ref (payment_reference)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. Revenue ledger
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS revenue_records (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    payment_id          INT NULL,
    user_id             INT NULL,
    revenue_type        ENUM('SUBSCRIPTION','PROMOTION','ADVERTISEMENT','TRANSACTION_COMMISSION','LEAD','OTHER') NOT NULL,
    gross_amount        DECIMAL(10,2) NOT NULL,
    platform_fee        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_revenue         DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'KES',
    status              ENUM('PENDING','RECEIVED','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    metadata_json       TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_revenue_type (revenue_type),
    INDEX idx_revenue_status (status),
    INDEX idx_revenue_created (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 11. Audit logs (admin overrides + financial operations)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    admin_id            INT NULL,
    action              VARCHAR(100) NOT NULL,
    target_type         VARCHAR(50) NULL,
    target_id           INT NULL,
    reason              TEXT NULL,
    metadata_json       TEXT NULL,
    ip_address          VARCHAR(45) NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_admin (admin_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_target (target_type, target_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 12. Seed default plans (Starter, Pro, Business)
-- ------------------------------------------------------------
INSERT IGNORE INTO plans (id, name, slug, description, price, billing_interval, currency, max_listings, is_active, is_public, sort_order) VALUES
(1, 'Starter',              'starter',    'Basic marketplace participation with limited listings.',              0.00,   'month', 'KES',  3,  TRUE, TRUE, 0),
(2, 'Pro',                  'pro',        'Serious farmers, sellers and small agricultural operators.',        500.00, 'month', 'KES',  20, TRUE, TRUE, 1),
(3, 'AgriConnect Business', 'business',  'Premium plan for established agricultural businesses.',            1500.00, 'month', 'KES', 100, TRUE, TRUE, 2);

-- ------------------------------------------------------------
-- 13. Seed plan features — Starter (id=1)
-- ------------------------------------------------------------
INSERT IGNORE INTO plan_features (plan_id, feature_key, enabled, limit_value) VALUES
(1, 'active_listings',           TRUE, 3),
(1, 'images_per_listing',        TRUE, 5),
(1, 'priority_search',           FALSE, NULL),
(1, 'listing_analytics',         FALSE, NULL),
(1, 'lead_analytics',            FALSE, NULL),
(1, 'advanced_analytics',        FALSE, NULL),
(1, 'business_profile',          FALSE, NULL),
(1, 'verified_badge',            FALSE, NULL),
(1, 'featured_listings',         FALSE, NULL),
(1, 'profile_promotion',         FALSE, NULL),
(1, 'advertising',               FALSE, NULL),
(1, 'business_description',      FALSE, NULL),
(1, 'whatsapp_contact',          FALSE, NULL),
(1, 'priority_support',          FALSE, NULL),
(1, 'multiple_services',         FALSE, NULL);

-- ------------------------------------------------------------
-- 14. Seed plan features — Pro (id=2)
-- ------------------------------------------------------------
INSERT IGNORE INTO plan_features (plan_id, feature_key, enabled, limit_value) VALUES
(2, 'active_listings',           TRUE, 20),
(2, 'images_per_listing',        TRUE, 10),
(2, 'priority_search',           TRUE, NULL),
(2, 'listing_analytics',         TRUE, NULL),
(2, 'lead_analytics',            TRUE, NULL),
(2, 'advanced_analytics',        TRUE, NULL),
(2, 'business_profile',          TRUE, NULL),
(2, 'verified_badge',            TRUE, NULL),
(2, 'featured_listings',         TRUE, 2),
(2, 'profile_promotion',         TRUE, NULL),
(2, 'advertising',               FALSE, NULL),
(2, 'business_description',      TRUE, NULL),
(2, 'whatsapp_contact',          TRUE, NULL),
(2, 'priority_support',          FALSE, NULL),
(2, 'multiple_services',         TRUE, NULL);

-- ------------------------------------------------------------
-- 15. Seed plan features — Business (id=3)
-- ------------------------------------------------------------
INSERT IGNORE INTO plan_features (plan_id, feature_key, enabled, limit_value) VALUES
(3, 'active_listings',           TRUE, 100),
(3, 'images_per_listing',        TRUE, 20),
(3, 'priority_search',           TRUE, NULL),
(3, 'listing_analytics',         TRUE, NULL),
(3, 'lead_analytics',            TRUE, NULL),
(3, 'advanced_analytics',        TRUE, NULL),
(3, 'business_profile',          TRUE, NULL),
(3, 'verified_badge',            TRUE, NULL),
(3, 'featured_listings',         TRUE, 5),
(3, 'profile_promotion',         TRUE, NULL),
(3, 'advertising',               TRUE, NULL),
(3, 'business_description',      TRUE, NULL),
(3, 'whatsapp_contact',          TRUE, NULL),
(3, 'priority_support',          TRUE, NULL),
(3, 'multiple_services',         TRUE, NULL);

-- ------------------------------------------------------------
-- 16. Seed promotion pricing (configurable via platform_config)
-- ------------------------------------------------------------
INSERT IGNORE INTO platform_config (`key`, `value`, `data_type`, `description`) VALUES
('promo_boost_price',            '100',  'number', 'Default price for a 7-day listing Boost'),
('promo_boost_days',             '7',    'number', 'Default duration for listing Boost (days)'),
('promo_featured_price',         '250',  'number', 'Default price for a 14-day Featured listing'),
('promo_featured_days',          '14',   'number', 'Default duration for Featured listing (days)'),
('promo_sponsored_price',        '500',  'number', 'Default price for a 30-day Sponsored listing'),
('promo_sponsored_days',         '30',   'number', 'Default duration for Sponsored listing (days)'),
('profile_boost_price',          '200',  'number', 'Default price for a 7-day profile Boost'),
('profile_boost_days',           '7',    'number', 'Default duration for profile Boost (days)');