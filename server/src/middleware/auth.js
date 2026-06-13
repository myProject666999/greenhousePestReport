const jwt = require('jsonwebtoken');
const log = require('../utils/logger');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录，请先登录' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    log.auth('Token验证通过, userId=%s, role=%s', decoded.id, decoded.role);
    req.user = decoded;
    next();
  } catch (error) {
    log.auth('Token验证失败: %s', error.message);
    return res.status(401).json({ code: 401, message: 'Token无效或已过期' });
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }
    if (!roles.includes(req.user.role)) {
      log.auth('权限不足, userId=%s, role=%s, required=%s', req.user.id, req.user.role, roles.join(','));
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    next();
  };
};

module.exports = { auth, roleCheck };
