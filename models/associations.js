/* eslint-env node */
const { User } = require('./User');
const { ProduceListing } = require('./ProduceListing');
const { ServiceListing } = require('./ServiceListing');
const { Order } = require('./Order');
const { OrderItem } = require('./OrderItem');
const { Message } = require('./Message');
const { MarketPrice } = require('./MarketPrice');
const { Notification } = require('./Notification');
const { ServiceRequest } = require('./ServiceRequest');
const { Review } = require('./Review');

// Important: `foreignKey` references the MODEL ATTRIBUTE name (camelCase).
// The `underscored: true` + explicit `field:` in each model maps it to
// the snake_case MySQL column automatically.

// ── Produce listings ─────────────────────────────────────────────
User.hasMany(ProduceListing, { foreignKey: 'farmerId', as: 'produceListings' });
ProduceListing.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

// ── Service listings ─────────────────────────────────────────────
User.hasMany(ServiceListing, { foreignKey: 'providerId', as: 'serviceListings' });
ServiceListing.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

// ── Orders ───────────────────────────────────────────────────────
User.hasMany(Order, { foreignKey: 'userId', as: 'buyerOrders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'buyer' });

User.hasMany(Order, { foreignKey: 'sellerId', as: 'sellerOrders' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// ── Order items ──────────────────────────────────────────────────
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(ProduceListing, { foreignKey: 'listingId', as: 'listing' });

// ── Messages ─────────────────────────────────────────────────────
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

// ── Notifications ────────────────────────────────────────────────
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Service Requests ─────────────────────────────────────────────
ServiceListing.hasMany(ServiceRequest, { foreignKey: 'serviceId', as: 'requests' });
ServiceRequest.belongsTo(ServiceListing, { foreignKey: 'serviceId', as: 'service' });

User.hasMany(ServiceRequest, { foreignKey: 'requesterId', as: 'madeServiceRequests' });
ServiceRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });

User.hasMany(ServiceRequest, { foreignKey: 'providerId', as: 'receivedServiceRequests' });
ServiceRequest.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

// ── Reviews ──────────────────────────────────────────────────────
User.hasMany(Review, { foreignKey: 'reviewerId', as: 'givenReviews' });
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });

User.hasMany(Review, { foreignKey: 'revieweeId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'revieweeId', as: 'reviewee' });

ServiceListing.hasMany(Review, { foreignKey: 'serviceId', as: 'reviews' });
Review.belongsTo(ServiceListing, { foreignKey: 'serviceId' });

Order.hasMany(Review, { foreignKey: 'orderId', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = { User, ProduceListing, ServiceListing, Order, OrderItem, Message, MarketPrice, Notification, ServiceRequest, Review };
