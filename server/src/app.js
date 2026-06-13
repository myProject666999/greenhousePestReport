require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const log = require('./utils/logger');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { startScheduledTasks } = require('./tasks/feedbackReminder');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev', {
  stream: {
    write: (message) => log.api(message.trim())
  }
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    log.app('数据库连接成功');

    startScheduledTasks();
    log.app('定时任务启动成功');

    app.listen(PORT, () => {
      log.app('服务启动成功，端口: %d', PORT);
      log.app('接口地址: http://localhost:%d/api', PORT);
      log.app('Debug模式: %s', process.env.DEBUG || '未设置');
    });
  } catch (error) {
    log.error('服务启动失败: %s', error.message);
    process.exit(1);
  }
};

start();
