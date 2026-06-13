const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Greenhouse = sequelize.define('Greenhouse', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  farmer_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  qr_code: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  crop_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'greenhouses'
});

Greenhouse.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

module.exports = Greenhouse;
