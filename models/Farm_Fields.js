const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Minimal Farm_Fields model (belongs to a user)
const Farm_Fields = sequelize.define(
  'Farm_Fields',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    fieldName: { type: DataTypes.STRING(50), allowNull: false, field: 'field_name' },
    totalAcres: { type: DataTypes.DECIMAL(6, 2), allowNull: false, field: 'total_acres' },
    acreage: { type: DataTypes.DECIMAL(6, 2), allowNull: false, field: 'acreage' },
  },
  {
    tableName: 'farm_fields',
    timestamps: false,
    underscored: true,
  }
);

module.exports = { Farm_Fields };
