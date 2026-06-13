const { sequelize } = require('../config/database');
const { WorkOrder, Diagnosis, Greenhouse, Feedback, PestType } = require('../models');
const log = require('../utils/logger');
const { QueryTypes } = require('sequelize');

exports.overview = async (req, res, next) => {
  try {
    const [pending, assigned, diagnosed, completed] = await Promise.all([
      WorkOrder.count({ where: { status: 'pending' } }),
      WorkOrder.count({ where: { status: 'assigned' } }),
      WorkOrder.count({ where: { status: 'diagnosed' } }),
      WorkOrder.count({ where: { status: 'completed' } })
    ]);

    res.json({
      code: 200,
      data: {
        pending,
        assigned,
        diagnosed,
        completed,
        total: pending + assigned + diagnosed + completed
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.pestDistribution = async (req, res, next) => {
  try {
    const { province, city, district, start_date, end_date } = req.query;
    let dateFilter = '';
    const replacements = [];

    if (start_date && end_date) {
      dateFilter = 'AND wo.created_at BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    } else {
      dateFilter = "AND wo.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    }

    let locationFilter = '';
    if (province) { locationFilter += ' AND g.province = ?'; replacements.push(province); }
    if (city) { locationFilter += ' AND g.city = ?'; replacements.push(city); }
    if (district) { locationFilter += ' AND g.district = ?'; replacements.push(district); }

    const sql = `
      SELECT 
        d.pest_name,
        d.severity,
        COUNT(*) as count,
        g.province,
        g.city,
        g.district
      FROM diagnoses d
      JOIN work_orders wo ON d.work_order_id = wo.id
      JOIN greenhouses g ON wo.greenhouse_id = g.id
      WHERE 1=1 ${dateFilter} ${locationFilter}
      GROUP BY d.pest_name, d.severity, g.province, g.city, g.district
      ORDER BY count DESC
      LIMIT 50
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ code: 200, data });
  } catch (error) {
    next(error);
  }
};

exports.regionSummary = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    let dateFilter = '';
    const replacements = [];

    if (start_date && end_date) {
      dateFilter = 'AND wo.created_at BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    } else {
      dateFilter = "AND wo.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    }

    const sql = `
      SELECT 
        g.province,
        g.city,
        g.district,
        COUNT(wo.id) as total_orders,
        SUM(CASE WHEN wo.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN wo.status IN ('assigned', 'diagnosed') THEN 1 ELSE 0 END) as processing_count,
        SUM(CASE WHEN wo.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        COUNT(DISTINCT d.pest_name) as pest_variety_count
      FROM work_orders wo
      JOIN greenhouses g ON wo.greenhouse_id = g.id
      LEFT JOIN diagnoses d ON wo.id = d.work_order_id
      WHERE 1=1 ${dateFilter}
      GROUP BY g.province, g.city, g.district
      ORDER BY total_orders DESC
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ code: 200, data });
  } catch (error) {
    next(error);
  }
};

exports.trendData = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const sql = `
      SELECT 
        DATE(wo.created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN wo.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN wo.status IN ('assigned', 'diagnosed') THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN wo.status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM work_orders wo
      WHERE wo.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(wo.created_at)
      ORDER BY date ASC
    `;

    const data = await sequelize.query(sql, {
      replacements: [parseInt(days)],
      type: QueryTypes.SELECT
    });

    res.json({ code: 200, data });
  } catch (error) {
    next(error);
  }
};

exports.topPests = async (req, res, next) => {
  try {
    const { province, city, limit = 10 } = req.query;
    const replacements = [];
    let locationFilter = '';

    if (province) { locationFilter += ' AND g.province = ?'; replacements.push(province); }
    if (city) { locationFilter += ' AND g.city = ?'; replacements.push(city); }

    const sql = `
      SELECT 
        d.pest_name,
        COUNT(*) as count,
        SUM(CASE WHEN d.severity = 'mild' THEN 1 ELSE 0 END) as mild_count,
        SUM(CASE WHEN d.severity = 'moderate' THEN 1 ELSE 0 END) as moderate_count,
        SUM(CASE WHEN d.severity = 'severe' THEN 1 ELSE 0 END) as severe_count,
        SUM(CASE WHEN f.result = 'recovered' THEN 1 ELSE 0 END) as recovered_count,
        SUM(CASE WHEN f.result = 'no_change' THEN 1 ELSE 0 END) as no_change_count,
        SUM(CASE WHEN f.result = 'worse' THEN 1 ELSE 0 END) as worse_count
      FROM diagnoses d
      JOIN work_orders wo ON d.work_order_id = wo.id
      JOIN greenhouses g ON wo.greenhouse_id = g.id
      LEFT JOIN feedbacks f ON wo.id = f.work_order_id
      WHERE wo.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ${locationFilter}
      GROUP BY d.pest_name
      ORDER BY count DESC
      LIMIT ?
    `;
    replacements.push(parseInt(limit));

    const data = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ code: 200, data });
  } catch (error) {
    next(error);
  }
};
