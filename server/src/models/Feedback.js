const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const WorkOrder = require('./WorkOrder');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  work_order_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  feedback_type: {
    type: DataTypes.ENUM('day3', 'day7'),
    allowNull: false
  },
  result: {
    type: DataTypes.ENUM('recovered', 'no_change', 'worse'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'feedbacks',
  indexes: [
    {
      unique: true,
      fields: ['work_order_id', 'feedback_type']
    }
  ]
});

Feedback.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'work_order' });

module.exports = Feedback;
