const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('farmer', 'technician', 'admin'),
    defaultValue: 'farmer',
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'users'
});

module.exports = User;
