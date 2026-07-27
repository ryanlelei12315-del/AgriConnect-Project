const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// User model representing farmers, buyers, service providers, and admins
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true,
    validate: { isEmail: value => { if (value) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { throw new Error('Invalid email format'); } } } },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('farmer', 'buyer', 'provider', 'admin'),
    allowNull: false,
    defaultValue: 'farmer',
  },
  county: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = { User };
