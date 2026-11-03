const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Minimal Message model (messages between users)
const Message = sequelize.define(
  'Message',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    senderId: { type: DataTypes.INTEGER, allowNull: false, field: 'sender_id' },
    recipientId: { type: DataTypes.INTEGER, allowNull: false, field: 'recipient_id' },
    content: { type: DataTypes.TEXT, allowNull: false, field: 'content' },
    read: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'read' },
  },
  {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { Message };
