const { WorkOrder, WorkOrderImage, Diagnosis, Feedback, User, Greenhouse, PestType } = require('../models');
const { sequelize } = require('../config/database');
const log = require('../utils/logger');
const dayjs = require('dayjs');
const { createNotification } = require('./notificationController');

const generateOrderNo = () => {
  return 'WO' + dayjs().format('YYYYMMDDHHmmss') + Math.random().toString(36).substring(2, 6).toUpperCase();
};

exports.create = async (req, res, next) => {
  try {
    const { greenhouse_id, description } = req.body;
    const farmer_id = req.user.id;
    log.api('创建工单: farmer_id=%s, greenhouse_id=%s', farmer_id, greenhouse_id);

    if (!greenhouse_id || !description) {
      return res.status(400).json({ code: 400, message: '大棚和描述不能为空' });
    }

    const greenhouse = await Greenhouse.findByPk(greenhouse_id);
    if (!greenhouse) {
      return res.status(404).json({ code: 404, message: '大棚不存在' });
    }

    const order_no = generateOrderNo();
    const workOrder = await WorkOrder.create({
      order_no,
      farmer_id,
      greenhouse_id,
      description,
      status: 'pending'
    });

    if (req.files && req.files.length > 0) {
      const images = req.files.map((file, index) => ({
        work_order_id: workOrder.id,
        image_url: `/uploads/${file.filename}`,
        sort_order: index
      }));
      await WorkOrderImage.bulkCreate(images);
      log.api('保存图片 %d 张', images.length);
    }

    const result = await WorkOrder.findByPk(workOrder.id, {
      include: [
        { model: WorkOrderImage, as: 'images' },
        { model: Greenhouse, as: 'greenhouse' }
      ]
    });

    log.api('工单创建成功: order_no=%s', order_no);
    res.status(201).json({ code: 201, message: '上报成功', data: result });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;
    const where = {};

    if (req.user.role === 'farmer') {
      where.farmer_id = req.user.id;
    } else if (req.user.role === 'technician' && status !== 'pending') {
      where.technician_id = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      include: [
        { model: WorkOrderImage, as: 'images' },
        { model: User, as: 'farmer', attributes: ['id', 'real_name', 'phone'] },
        { model: User, as: 'technician', attributes: ['id', 'real_name', 'phone'] },
        { model: Greenhouse, as: 'greenhouse' },
        { model: Diagnosis, as: 'diagnosis' },
        { model: Feedback, as: 'feedbacks' }
      ],
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

exports.detail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findByPk(id, {
      include: [
        { model: WorkOrderImage, as: 'images' },
        { model: User, as: 'farmer', attributes: ['id', 'real_name', 'phone'] },
        { model: User, as: 'technician', attributes: ['id', 'real_name', 'phone'] },
        { model: Greenhouse, as: 'greenhouse' },
        { model: Diagnosis, as: 'diagnosis', include: [{ model: PestType, as: 'pest_type' }] },
        { model: Feedback, as: 'feedbacks' }
      ]
    });

    if (!workOrder) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }

    res.json({ code: 200, data: workOrder });
  } catch (error) {
    next(error);
  }
};

exports.claim = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const technician_id = req.user.id;
    log.api('认领工单: order_id=%s, technician_id=%s', id, technician_id);

    const workOrder = await WorkOrder.findByPk(id, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!workOrder) {
      await transaction.rollback();
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }

    if (workOrder.status === 'assigned' || workOrder.status === 'diagnosed' || 
        workOrder.status === 'feedback_pending' || workOrder.status === 'completed' || 
        workOrder.status === 'closed') {
      await transaction.rollback();
      if (Number(workOrder.technician_id) === Number(technician_id)) {
        return res.status(400).json({ code: 400, message: '您已认领该工单' });
      }
      return res.status(400).json({ code: 400, message: '该工单已被其他农技员认领' });
    }

    if (workOrder.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ code: 400, message: `工单当前状态为「${workOrder.status}」，无法认领` });
    }

    await workOrder.update({
      status: 'assigned',
      technician_id,
      assigned_at: new Date()
    }, { transaction });

    await transaction.commit();

    const result = await WorkOrder.findByPk(id, {
      include: [
        { model: WorkOrderImage, as: 'images' },
        { model: User, as: 'farmer', attributes: ['id', 'real_name', 'phone'] },
        { model: User, as: 'technician', attributes: ['id', 'real_name', 'phone'] },
        { model: Greenhouse, as: 'greenhouse' }
      ]
    });

    try {
      await createNotification(workOrder.farmer_id, workOrder.id, 'order_assigned', 
        `工单 ${workOrder.order_no} 已被农技员认领`);
    } catch (notifyErr) {
      log.error('创建通知失败: %s', notifyErr.message);
    }

    log.api('认领成功: order_id=%s', id);
    res.json({ code: 200, message: '认领成功', data: result });
  } catch (error) {
    try { await transaction.rollback(); } catch (e) { log.error('事务回滚失败: %s', e.message); }
    next(error);
  }
};

exports.getPendingCount = async (req, res, next) => {
  try {
    const count = await WorkOrder.count({ where: { status: 'pending' } });
    res.json({ code: 200, data: { count } });
  } catch (error) {
    next(error);
  }
};
