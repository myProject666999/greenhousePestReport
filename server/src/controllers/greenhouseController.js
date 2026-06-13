const { Greenhouse } = require('../models');
const log = require('../utils/logger');

exports.getByQrCode = async (req, res, next) => {
  try {
    const { qr_code } = req.params;
    log.api('扫码进棚: qr_code=%s', qr_code);

    const greenhouse = await Greenhouse.findOne({
      where: { qr_code, status: 1 },
      attributes: { exclude: ['created_at', 'updated_at'] }
    });

    if (!greenhouse) {
      return res.status(404).json({ code: 404, message: '大棚不存在或已停用' });
    }

    res.json({ code: 200, data: greenhouse });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { farmer_id, province, city, district, page = 1, pageSize = 20 } = req.query;
    const where = { status: 1 };

    if (farmer_id) where.farmer_id = farmer_id;
    if (province) where.province = province;
    if (city) where.city = city;
    if (district) where.district = district;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const { count, rows } = await Greenhouse.findAndCountAll({
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

exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    log.api('创建大棚: name=%s, farmer_id=%s', data.name, data.farmer_id);

    if (!data.qr_code) {
      data.qr_code = 'GH' + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    const greenhouse = await Greenhouse.create(data);
    res.status(201).json({ code: 201, message: '创建成功', data: greenhouse });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const greenhouse = await Greenhouse.findByPk(id);
    if (!greenhouse) {
      return res.status(404).json({ code: 404, message: '大棚不存在' });
    }

    await greenhouse.update(req.body);
    res.json({ code: 200, message: '更新成功', data: greenhouse });
  } catch (error) {
    next(error);
  }
};

exports.getByFarmer = async (req, res, next) => {
  try {
    const farmerId = req.params.farmer_id || req.user.id;
    const greenhouses = await Greenhouse.findAll({
      where: { farmer_id: farmerId, status: 1 },
      order: [['created_at', 'DESC']]
    });
    res.json({ code: 200, data: greenhouses });
  } catch (error) {
    next(error);
  }
};
