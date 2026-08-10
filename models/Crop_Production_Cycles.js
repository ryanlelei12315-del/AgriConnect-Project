const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Minimal Crop_Production_Cycles model (belongs to a user and a field)
const Crop_Production_Cycles = sequelize.define(
  'Crop_Production_Cycles',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    fieldId: { type: DataTypes.INTEGER, allowNull: false, field: 'field_id' },
    cropName: { type: DataTypes.STRING(50), allowNull: false, field: 'crop_name' },
    variety: { type: DataTypes.STRING(50), allowNull: true, field: 'variety' },
    plantingDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'planting_date' },
    harvestDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'harvest_date' },
  },
  {
    tableName: 'crop_production_cycles',
    timestamps: false,
    underscored: true,
  }
);

module.exports = { Crop_Production_Cycles };
