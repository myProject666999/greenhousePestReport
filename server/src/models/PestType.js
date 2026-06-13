const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PestType = sequelize.define('PestType', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('disease', 'pest'),
    defaultValue: 'disease',
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prevention: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'pest_types'
});

module.exports = PestType;
