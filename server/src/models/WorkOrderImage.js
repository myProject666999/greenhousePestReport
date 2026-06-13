const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const WorkOrder = require('./WorkOrder');

const WorkOrderImage = sequelize.define('WorkOrderImage', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  work_order_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'work_order_images',
  timestamps: false
});

WorkOrderImage.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'work_order' });

module.exports = WorkOrderImage;
