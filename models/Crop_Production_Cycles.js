const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Minimal Crop_Production_Cycles model (belongs to a user and a field)
const Crop_Production_Cycles = sequelize.define('Crop_Production_Cycles', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  fieldId: { type: DataTypes.INTEGER, allowNull: false },
  crop_name: { type: DataTypes.STRING(50), allowNull: false },
  variety: { type: DataTypes.STRING(50), allowNull: true },
  planting_date: { type: DataTypes.DATEONLY, allowNull: false },
  harvest_date: { type: DataTypes.DATEONLY, allowNull: true },
}, {
  tableName: 'crop_production_cycles',
  timestamps: false,
});

module.exports = { Crop_Production_Cycles };
