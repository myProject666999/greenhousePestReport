const { WorkOrder, WorkOrderImage, Diagnosis, Feedback, User, Greenhouse } = require('../models');
const { sequelize } = require('../config/database');
const log = require('../utils/logger');
const dayjs = require('dayjs');

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
    } else if (req.user.role === 'technician') {
      if (status === 'pending') {
        where.status = 'pending';
      } else {
        where.technician_id = req.user.id;
      }
    }

    if (status && status !== 'pending') {
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
        { model: Diagnosis, as: 'diagnosis', include: [{ model: require('../models/PestType'), as: 'pest_type' }] },
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
  try {
    const { id } = req.params;
    const technician_id = req.user.id;
    log.api('认领工单: order_id=%s, technician_id=%s', id, technician_id);

    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }

    if (workOrder.status !== 'pending') {
      return res.status(400).json({ code: 400, message: '该工单已被认领' });
    }

    await workOrder.update({
      status: 'assigned',
      technician_id,
      assigned_at: new Date()
    });

    const result = await WorkOrder.findByPk(id, {
      include: [
        { model: WorkOrderImage, as: 'images' },
        { model: User, as: 'farmer', attributes: ['id', 'real_name', 'phone'] },
        { model: User, as: 'technician', attributes: ['id', 'real_name', 'phone'] },
        { model: Greenhouse, as: 'greenhouse' }
      ]
    });

    log.api('认领成功: order_id=%s', id);
    res.json({ code: 200, message: '认领成功', data: result });
  } catch (error) {
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
