/* eslint-env node */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BuyerDemand = sequelize.define('BuyerDemand', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyerId: { type: DataTypes.INTEGER, allowNull: false, field: 'buyer_id' },
  cropName: { type: DataTypes.STRING(100), allowNull: false, field: 'crop_name' },
  category: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'Other' },
  quantityKg: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'quantity_kg' },
  maxPricePerKgKes: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'max_price_per_kg_kes' },
  county: { type: DataTypes.STRING(50), allowNull: false },
  requiredBy: { type: DataTypes.DATEONLY, allowNull: true, field: 'required_by' },
  qualityNotes: { type: DataTypes.STRING(1000), allowNull: true, field: 'quality_notes' },
  status: { type: DataTypes.ENUM('OPEN', 'CLOSED', 'FULFILLED'), allowNull: false, defaultValue: 'OPEN' },
}, { tableName: 'buyer_demands', timestamps: true, underscored: true });

module.exports = { BuyerDemand };
