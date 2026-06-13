const User = require('./User');
const Greenhouse = require('./Greenhouse');
const PestType = require('./PestType');
const WorkOrder = require('./WorkOrder');
const WorkOrderImage = require('./WorkOrderImage');
const Diagnosis = require('./Diagnosis');
const Feedback = require('./Feedback');
const Notification = require('./Notification');

User.hasMany(Greenhouse, { foreignKey: 'farmer_id', as: 'greenhouses' });
User.hasMany(WorkOrder, { foreignKey: 'farmer_id', as: 'farmer_orders' });
User.hasMany(WorkOrder, { foreignKey: 'technician_id', as: 'technician_orders' });
User.hasMany(Diagnosis, { foreignKey: 'technician_id', as: 'diagnoses' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

Greenhouse.hasMany(WorkOrder, { foreignKey: 'greenhouse_id', as: 'work_orders' });

WorkOrder.hasMany(WorkOrderImage, { foreignKey: 'work_order_id', as: 'images' });
WorkOrder.hasOne(Diagnosis, { foreignKey: 'work_order_id', as: 'diagnosis' });
WorkOrder.hasMany(Feedback, { foreignKey: 'work_order_id', as: 'feedbacks' });
WorkOrder.hasMany(Notification, { foreignKey: 'work_order_id', as: 'notifications' });

PestType.hasMany(Diagnosis, { foreignKey: 'pest_type_id', as: 'diagnoses' });

module.exports = {
  User,
  Greenhouse,
  PestType,
  WorkOrder,
  WorkOrderImage,
  Diagnosis,
  Feedback,
  Notification
};
