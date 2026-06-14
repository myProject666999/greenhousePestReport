const { Diagnosis, WorkOrder, PestType, User } = require('../models');
const { createNotification } = require('./notificationController');
const log = require('../utils/logger');

exports.create = async (req, res, next) => {
  try {
    const {
      work_order_id, pest_type_id, pest_name, severity,
      diagnosis_result, treatment_plan, pesticide, dosage,
      frequency, precautions, remarks
    } = req.body;

    const technician_id = req.user.id;
    log.api('创建诊断: work_order_id=%s, technician_id=%s', work_order_id, technician_id);

    if (!work_order_id || !diagnosis_result || !treatment_plan) {
      return res.status(400).json({ code: 400, message: '工单ID、诊断结论和处置方案不能为空' });
    }

    const workOrder = await WorkOrder.findByPk(work_order_id);
    if (!workOrder) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }

    if (req.user.role !== 'admin' && Number(workOrder.technician_id) !== Number(technician_id)) {
      return res.status(403).json({ code: 403, message: '您无权诊断此工单' });
    }

    const existing = await Diagnosis.findOne({ where: { work_order_id } });
    if (existing) {
      return res.status(400).json({ code: 400, message: '该工单已有诊断结果' });
    }

    const diagnosis = await Diagnosis.create({
      work_order_id,
      technician_id,
      pest_type_id,
      pest_name,
      severity: severity || 'moderate',
      diagnosis_result,
      treatment_plan,
      pesticide,
      dosage,
      frequency,
      precautions,
      remarks
    });

    await workOrder.update({
      status: 'diagnosed',
      diagnosed_at: new Date()
    });

    try {
      await createNotification(
        workOrder.farmer_id,
        workOrder.id,
        'diagnosis_done',
        `工单${workOrder.order_no}已被诊断为${pest_name || '病虫害'}，请查看处置方案。`
      );
    } catch (notifyErr) {
      log.error('创建通知失败: %s', notifyErr.message);
    }

    log.api('诊断创建成功: diagnosis_id=%s', diagnosis.id);
    res.status(201).json({ code: 201, message: '诊断成功', data: diagnosis });
  } catch (error) {
    next(error);
  }
};

exports.getByWorkOrder = async (req, res, next) => {
  try {
    const { work_order_id } = req.params;
    const diagnosis = await Diagnosis.findOne({
      where: { work_order_id },
      include: [
        { model: WorkOrder, as: 'work_order' },
        { model: PestType, as: 'pest_type' },
        { model: User, as: 'technician', attributes: ['id', 'real_name', 'phone'] }
      ]
    });

    if (!diagnosis) {
      return res.status(404).json({ code: 404, message: '暂无诊断结果' });
    }

    res.json({ code: 200, data: diagnosis });
  } catch (error) {
    next(error);
  }
};
