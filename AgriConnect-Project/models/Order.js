const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Minimal Order model (belongs to a user)
const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    sellerId: { type: DataTypes.INTEGER, allowNull: true, field: 'seller_id' },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'completed', 'canceled'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'status',
    },
    totalKes: { type: DataTypes.DECIMAL(12, 2), allowNull: true, field: 'total_kes' },
    mpesaRef: { type: DataTypes.STRING(50), allowNull: true, field: 'mpesa_ref' },
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { Order };
