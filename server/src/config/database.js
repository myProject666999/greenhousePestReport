const { Sequelize } = require('sequelize');
const log = require('../utils/logger');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: (msg) => log.db(msg),
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    log.db('数据库连接成功');
  } catch (error) {
    log.db('数据库连接失败:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
