const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// User model representing farmers, buyers, service providers, and admins
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'full_name',
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      field: 'email',
      validate: {
        isEmail: (value) => {
          if (value) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              throw new Error('Invalid email format');
            }
          }
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password',
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      field: 'phone_number',
    },
    county: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'county',
    },
    role: {
      type: DataTypes.ENUM('farmer', 'buyer', 'provider', 'admin'),
      allowNull: false,
      defaultValue: 'farmer',
      field: 'role',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { User };
