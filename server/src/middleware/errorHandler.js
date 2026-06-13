const log = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  log.error('请求异常: %s %s, error: %s', req.method, req.url, err.message);
  log.error('堆栈: %s', err.stack);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      code: 400,
      message: '数据重复',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      code: 400,
      message: '关联数据不存在'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ code: 401, message: 'Token无效' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ code: 401, message: 'Token已过期' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    message: err.message || '服务器内部错误'
  });
};

const notFound = (req, res) => {
  log.error('路由不存在: %s %s', req.method, req.url);
  res.status(404).json({ code: 404, message: '接口不存在' });
};

module.exports = { errorHandler, notFound };
