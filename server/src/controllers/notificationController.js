const { Notification } = require('../models');
const log = require('../utils/logger');

exports.list = async (req, res, next) => {
  try {
    const { is_read, page = 1, pageSize = 20 } = req.query;
    const where = { user_id: req.user.id };
    if (is_read !== undefined) where.is_read = parseInt(is_read);

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id }
    });
    if (!notification) {
      return res.status(404).json({ code: 404, message: '通知不存在' });
    }
    await notification.update({ is_read: 1 });
    res.json({ code: 200, message: '已标记为已读' });
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: 1 },
      { where: { user_id: req.user.id, is_read: 0 } }
    );
    res.json({ code: 200, message: '全部标记为已读' });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: { user_id: req.user.id, is_read: 0 }
    });
    res.json({ code: 200, data: { count } });
  } catch (error) {
    next(error);
  }
};

exports.createNotification = async (user_id, work_order_id, type, content) => {
  try {
    await Notification.create({
      user_id,
      work_order_id,
      type,
      content
    });
    log.api('创建通知成功: user_id=%s, type=%s', user_id, type);
  } catch (error) {
    log.error('创建通知失败: %s', error.message);
    throw error;
  }
};
