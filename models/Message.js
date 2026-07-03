const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Minimal Message model (messages between users)
const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  recipientId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'messages',
  timestamps: true,
});

module.exports = { Message };
