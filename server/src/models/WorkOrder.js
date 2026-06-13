const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Greenhouse = require('./Greenhouse');

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  order_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  farmer_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  greenhouse_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'diagnosed', 'feedback_pending', 'completed', 'closed'),
    defaultValue: 'pending',
    allowNull: false
  },
  technician_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  diagnosed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'work_orders'
});

WorkOrder.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });
WorkOrder.belongsTo(User, { foreignKey: 'technician_id', as: 'technician' });
WorkOrder.belongsTo(Greenhouse, { foreignKey: 'greenhouse_id', as: 'greenhouse' });

module.exports = WorkOrder;
