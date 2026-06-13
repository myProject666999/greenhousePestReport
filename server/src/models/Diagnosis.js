const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const WorkOrder = require('./WorkOrder');
const User = require('./User');
const PestType = require('./PestType');

const Diagnosis = sequelize.define('Diagnosis', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  work_order_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  technician_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  pest_type_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  pest_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('mild', 'moderate', 'severe'),
    defaultValue: 'moderate'
  },
  diagnosis_result: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  treatment_plan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pesticide: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  dosage: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  frequency: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  precautions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'diagnoses'
});

Diagnosis.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'work_order' });
Diagnosis.belongsTo(User, { foreignKey: 'technician_id', as: 'technician' });
Diagnosis.belongsTo(PestType, { foreignKey: 'pest_type_id', as: 'pest_type' });

module.exports = Diagnosis;
