-- ============================================================
-- AgriConnect KE — Migration 007: Security & Performance
--
-- Adds:
--   1. users.is_active             → allow deactivation (login check)
--   2. orders.payment_status/method → M-Pesa integration boundary (never
--      faked; stores the status reported by a verified server callback)
--   3. Targeted indexes for the highest-frequency queries
--        (joins, filters, order lookups, messaging, notifications)
--
-- Index rationale (documented per line):
--   * orders (seller_id, status)     → farmer dashboard "pending orders" +
--     "orders for my listings" filter and status-grouped analytics.
--   * orders (user_id, status)       → buyer order list + status filter.
--   * order_items (listing_id)       → the common "orders for a listing" join
--     and the cancel/restock lookup.
--   * notifications (user_id, is_read)→ badge counts + "mark all read" scan.
--   * service_requests (provider_id, status) → provider inbox filter.
--   * service_requests (service_id)  → join between request and service.
--   * messages (recipient_id, read)  → the unread-badge count query.
--   * reviews UNIQUE (order_id, reviewer_id) → prevents duplicate reviews at
--     the DB level (the application already enforces it; this is defense in depth).
--   * reviews (reviewee_id)          → average-rating aggregation on profiles.
--   * produce_listings (category)    → marketplace category filter.
--
-- Reversible (up): re-run the dropped index names in reverse order.
-- ============================================================

USE Smart_Kilimo;

-- 1. users.is_active (1 = active, 0 = deactivated)
ALTER TABLE users
    ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;

-- 2. orders payment columns (integration boundary)
ALTER TABLE orders
    ADD COLUMN payment_status VARCHAR(20) NULL AFTER mpesa_ref,
    ADD COLUMN payment_method VARCHAR(20) NULL AFTER payment_status;

-- 3. Indexes
CREATE INDEX idx_orders_seller_status ON orders (seller_id, status);
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

CREATE INDEX idx_order_items_listing ON order_items (listing_id);

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);

CREATE INDEX idx_sr_provider_status ON service_requests (provider_id, status);
CREATE INDEX idx_sr_service ON service_requests (service_id);

CREATE INDEX idx_messages_recipient_read ON messages (recipient_id, read);

CREATE INDEX idx_reviews_reviewee ON reviews (reviewee_id);
ALTER TABLE reviews ADD UNIQUE INDEX uq_reviews_order_reviewer (order_id, reviewer_id);

CREATE INDEX idx_listings_category ON produce_listings (category);