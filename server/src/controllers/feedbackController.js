const { Feedback, WorkOrder, Diagnosis } = require('../models');
const { createNotification } = require('./notificationController');
const log = require('../utils/logger');

exports.create = async (req, res, next) => {
  try {
    const { work_order_id, feedback_type, result, description } = req.body;
    const farmer_id = req.user.id;
    log.api('创建反馈: work_order_id=%s, type=%s, result=%s', work_order_id, feedback_type, result);

    if (!work_order_id || !feedback_type || !result) {
      return res.status(400).json({ code: 400, message: '工单ID、反馈类型和效果不能为空' });
    }

    const workOrder = await WorkOrder.findByPk(work_order_id);
    if (!workOrder) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }

    if (workOrder.farmer_id !== farmer_id) {
      return res.status(403).json({ code: 403, message: '您无权反馈此工单' });
    }

    const existing = await Feedback.findOne({
      where: { work_order_id, feedback_type }
    });
    if (existing) {
      return res.status(400).json({ code: 400, message: `该工单${feedback_type === 'day3' ? '3天' : '7天'}反馈已提交` });
    }

    const feedback = await Feedback.create({
      work_order_id,
      feedback_type,
      result,
      description
    });

    if (feedback_type === 'day7' || result === 'recovered') {
      await workOrder.update({
        status: 'completed',
        completed_at: new Date()
      });
    } else if (feedback_type === 'day3' && result !== 'recovered') {
      await workOrder.update({ status: 'feedback_pending' });
    }

    try {
      const resultText = result === 'recovered' ? '好转' : result === 'no_change' ? '无变化' : '加重';
      await createNotification(
        workOrder.technician_id,
        workOrder.id,
        'feedback_submitted',
        `工单${workOrder.order_no}收到农户反馈：${resultText}`
      );
    } catch (notifyErr) {
      log.error('创建通知失败: %s', notifyErr.message);
    }

    log.api('反馈创建成功: feedback_id=%s', feedback.id);
    res.status(201).json({ code: 201, message: '反馈提交成功', data: feedback });
  } catch (error) {
    next(error);
  }
};

exports.getByWorkOrder = async (req, res, next) => {
  try {
    const { work_order_id } = req.params;
    const feedbacks = await Feedback.findAll({
      where: { work_order_id },
      order: [['created_at', 'ASC']]
    });
    res.json({ code: 200, data: feedbacks });
  } catch (error) {
    next(error);
  }
};
