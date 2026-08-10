const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Order item — a line item on an order referencing a produce listing
const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
    listingId: { type: DataTypes.INTEGER, allowNull: false, field: 'listing_id' },
    quantityKg: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'quantity_kg' },
    unitPriceKes: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'unit_price_kes' },
    totalKes: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'total_kes' },
  },
  {
    tableName: 'order_items',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { OrderItem };
