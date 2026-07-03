const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Minimal Farm_Fields model (belongs to a user)
const Farm_Fields = sequelize.define('Farm_Fields', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  field_name: { type: DataTypes.STRING(50), allowNull: false },
  total_acres: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  acreage: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
}, {
  tableName: 'farm_fields',
  timestamps: false,
});

module.exports = { Farm_Fields };
