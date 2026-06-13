const { PestType } = require('../models');
const log = require('../utils/logger');

exports.list = async (req, res, next) => {
  try {
    const { category, keyword } = req.query;
    const where = {};
    if (category) where.category = category;
    if (keyword) where.name = { [require('sequelize').Op.like]: `%${keyword}%` };

    const pestTypes = await PestType.findAll({
      where,
      order: [['id', 'ASC']]
    });

    res.json({ code: 200, data: pestTypes });
  } catch (error) {
    next(error);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const pestType = await PestType.findByPk(req.params.id);
    if (!pestType) {
      return res.status(404).json({ code: 404, message: '病虫害类型不存在' });
    }
    res.json({ code: 200, data: pestType });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const pestType = await PestType.create(req.body);
    log.api('创建病虫害类型: name=%s', pestType.name);
    res.status(201).json({ code: 201, message: '创建成功', data: pestType });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const pestType = await PestType.findByPk(req.params.id);
    if (!pestType) {
      return res.status(404).json({ code: 404, message: '病虫害类型不存在' });
    }
    await pestType.update(req.body);
    res.json({ code: 200, message: '更新成功', data: pestType });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const pestType = await PestType.findByPk(req.params.id);
    if (!pestType) {
      return res.status(404).json({ code: 404, message: '病虫害类型不存在' });
    }
    await pestType.destroy();
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    next(error);
  }
};
