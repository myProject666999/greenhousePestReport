const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const log = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, real_name: user.real_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    log.auth('用户登录: username=%s', username);

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      log.auth('用户不存在: username=%s', username);
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    if (user.status !== 1) {
      return res.status(403).json({ code: 403, message: '账号已被禁用' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      log.auth('密码错误: username=%s', username);
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    const token = generateToken(user);
    log.auth('登录成功: userId=%s, role=%s', user.id, user.role);

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          real_name: user.real_name,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, password, real_name, phone, role } = req.body;
    log.api('用户注册: username=%s, role=%s', username, role);

    if (!username || !password || !real_name || !phone) {
      return res.status(400).json({ code: 400, message: '必填字段不能为空' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPassword,
      real_name,
      phone,
      role: role || 'farmer'
    });

    const token = generateToken(user);
    log.api('注册成功: userId=%s', user.id);

    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          real_name: user.real_name,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({ code: 200, data: user });
  } catch (error) {
    next(error);
  }
};
