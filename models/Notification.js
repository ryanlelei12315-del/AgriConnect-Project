const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define(
  'Notification',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    title: { type: DataTypes.STRING(100), allowNull: false, field: 'title' },
    message: { type: DataTypes.TEXT, allowNull: false, field: 'message' },
    type: { type: DataTypes.STRING(50), allowNull: false, field: 'type' },
    relatedId: { type: DataTypes.INTEGER, allowNull: true, field: 'related_id' },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_read' },
  },
  {
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { Notification };
