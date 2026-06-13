const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const WorkOrder = require('./WorkOrder');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  work_order_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('system', 'feedback_reminder', 'new_order', 'diagnosis_done'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  }
}, {
  tableName: 'notifications'
});

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notification.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'work_order' });

module.exports = Notification;
