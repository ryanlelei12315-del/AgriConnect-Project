const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Produce listing — a farmer's offer to sell a crop
const ProduceListing = sequelize.define(
  'ProduceListing',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    farmerId: { type: DataTypes.INTEGER, allowNull: false, field: 'farmer_id' },
    name: { type: DataTypes.STRING(100), allowNull: false, field: 'name' },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Other',
      field: 'category',
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'kg',
      field: 'unit',
    },
    quantityKg: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'quantity_kg' },
    pricePerKgKes: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'price_per_kg_kes' },
    county: { type: DataTypes.STRING(50), allowNull: false, field: 'county' },
    description: { type: DataTypes.TEXT, allowNull: true, field: 'description' },
    imageUrl: { type: DataTypes.STRING(255), allowNull: true, field: 'image_url' },
    status: {
      type: DataTypes.ENUM('LISTED', 'PENDING', 'SOLD', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'LISTED',
      field: 'status',
    },
  },
  {
    tableName: 'produce_listings',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { ProduceListing };
