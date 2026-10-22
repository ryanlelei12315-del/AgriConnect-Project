# Data model

| Area | Primary models/tables | Relationships |
| --- | --- | --- |
| Identity | `User` / `users` | One user owns listings, orders, messages, notifications, reviews. Roles: farmer, buyer, provider, admin. |
| Marketplace | `ProduceListing` / `produce_listings` | belongs to farmer; order items reference listings. Active published status is `LISTED`. |
| Services | `ServiceListing`, `ServiceRequest` | service belongs to provider; request links requester and provider. |
| Commerce | `Order`, `OrderItem` | order links buyer and seller; items link listing. |
| Engagement | `Message`, `Notification`, `Review`, `BuyerDemand` | user-linked and association definitions live in `models/associations.js`. |
| Market data | `MarketPrice` | independent price record model. |

Migration 011 defines optional monetization tables (`plans`, `plan_features`, `payments`, `subscriptions`, etc.), but no root Sequelize models or mounted payment routes use them. The entitlement service intentionally falls back to 10 for a database before these optional tables are installed.

Active-listing policy: only `produce_listings.status = 'LISTED'` counts. `PENDING`, `SOLD`, and `INACTIVE` do not. Editing an existing row does not consume a new slot.
