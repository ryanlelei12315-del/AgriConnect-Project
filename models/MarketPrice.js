const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarketPrice = sequelize.define(
  'MarketPrice',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    produceName: { type: DataTypes.STRING(100), allowNull: false, field: 'produce_name' },
    category: { type: DataTypes.STRING(50), allowNull: false, field: 'category' },
    marketName: { type: DataTypes.STRING(100), allowNull: false, field: 'market_name' },
    county: { type: DataTypes.STRING(50), allowNull: false, field: 'county' },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'price' },
    unit: { type: DataTypes.STRING(20), allowNull: false, field: 'unit' },
    priceChange: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.0, field: 'price_change' },
    source: { type: DataTypes.STRING(100), defaultValue: 'AgriConnect Data', field: 'source' },
    recordedAt: { type: DataTypes.DATEONLY, allowNull: false, field: 'recorded_at' },
  },
  {
    tableName: 'market_prices',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { MarketPrice };
