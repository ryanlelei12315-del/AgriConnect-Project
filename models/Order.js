const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Minimal Order model (belongs to a user)
const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'completed', 'canceled'), allowNull: false, defaultValue: 'pending' },
  // Other fields like total_price, createdAt can be added later
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = { Order };
