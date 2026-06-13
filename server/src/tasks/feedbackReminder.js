const { WorkOrder, Diagnosis, Feedback, Notification } = require('../models');
const log = require('../utils/logger');
const dayjs = require('dayjs');

const checkFeedbackReminders = async () => {
  try {
    log.worker('开始检查反馈提醒...');

    const diagnosedOrders = await WorkOrder.findAll({
      where: { status: 'diagnosed' },
      include: [{ model: Diagnosis, as: 'diagnosis' }]
    });

    for (const order of diagnosedOrders) {
      const diagnosedAt = dayjs(order.diagnosed_at);
      const now = dayjs();
      const daysSinceDiagnosis = now.diff(diagnosedAt, 'day');

      const existingFeedback = await Feedback.findAll({
        where: { work_order_id: order.id }
      });
      const feedbackTypes = existingFeedback.map(f => f.feedback_type);

      if (daysSinceDiagnosis >= 3 && daysSinceDiagnosis < 7 && !feedbackTypes.includes('day3')) {
        const existing = await Notification.findOne({
          where: {
            work_order_id: order.id,
            type: 'feedback_reminder',
            content: { [require('sequelize').Op.like]: '%3天%' }
          }
        });
        if (!existing) {
          await Notification.create({
            user_id: order.farmer_id,
            work_order_id: order.id,
            type: 'feedback_reminder',
            title: '3天反馈提醒',
            content: `您的工单${order.order_no}已诊断3天，请反馈治疗效果。`
          });
          log.worker('发送3天提醒: order_id=%s', order.id);
        }
      }

      if (daysSinceDiagnosis >= 7 && !feedbackTypes.includes('day7')) {
        const existing = await Notification.findOne({
          where: {
            work_order_id: order.id,
            type: 'feedback_reminder',
            content: { [require('sequelize').Op.like]: '%7天%' }
          }
        });
        if (!existing) {
          await Notification.create({
            user_id: order.farmer_id,
            work_order_id: order.id,
            type: 'feedback_reminder',
            title: '7天反馈提醒',
            content: `您的工单${order.order_no}已诊断7天，请反馈治疗效果。`
          });
          log.worker('发送7天提醒: order_id=%s', order.id);
        }
      }
    }

    log.worker('反馈提醒检查完成');
  } catch (error) {
    log.worker('反馈提醒检查失败: %s', error.message);
  }
};

const startScheduledTasks = () => {
  log.worker('启动定时任务...');

  const INTERVAL = 60 * 60 * 1000;

  checkFeedbackReminders();

  setInterval(checkFeedbackReminders, INTERVAL);
};

module.exports = { startScheduledTasks, checkFeedbackReminders };
