const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceRequest = sequelize.define(
  'ServiceRequest',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    serviceId: { type: DataTypes.INTEGER, allowNull: false, field: 'service_id' },
    requesterId: { type: DataTypes.INTEGER, allowNull: false, field: 'requester_id' },
    providerId: { type: DataTypes.INTEGER, allowNull: false, field: 'provider_id' },
    description: { type: DataTypes.TEXT, allowNull: true, field: 'description' },
    location: { type: DataTypes.STRING(100), allowNull: false, field: 'location' },
    requestedDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'requested_date' },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
      field: 'status',
    },
  },
  {
    tableName: 'service_requests',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { ServiceRequest };
