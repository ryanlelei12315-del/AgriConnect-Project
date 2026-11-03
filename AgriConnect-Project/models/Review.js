const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define(
  'Review',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    reviewerId: { type: DataTypes.INTEGER, allowNull: false, field: 'reviewer_id' },
    revieweeId: { type: DataTypes.INTEGER, allowNull: false, field: 'reviewee_id' },
    serviceId: { type: DataTypes.INTEGER, allowNull: true, field: 'service_id' },
    orderId: { type: DataTypes.INTEGER, allowNull: true, field: 'order_id' },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'rating',
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: { type: DataTypes.TEXT, allowNull: true, field: 'comment' },
  },
  {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { Review };
