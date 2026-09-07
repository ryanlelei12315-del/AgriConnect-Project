const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Service listing — a provider's offer of agricultural services
const ServiceListing = sequelize.define(
  'ServiceListing',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    providerId: { type: DataTypes.INTEGER, allowNull: false, field: 'provider_id' },
    category: { type: DataTypes.STRING(50), allowNull: false, field: 'category' },
    title: { type: DataTypes.STRING(100), allowNull: false, field: 'title' },
    priceKes: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'price_kes' },
    county: { type: DataTypes.STRING(50), allowNull: false, field: 'county' },
    description: { type: DataTypes.TEXT, allowNull: true, field: 'description' },
    availability: {
      type: DataTypes.ENUM('AVAILABLE', 'BOOKED', 'UNAVAILABLE'),
      allowNull: false,
      defaultValue: 'AVAILABLE',
      field: 'availability',
    },
  },
  {
    tableName: 'services',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { ServiceListing };
