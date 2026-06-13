const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/login', authCtrl.login);
router.post('/register', authCtrl.register);
router.get('/profile', auth, authCtrl.getProfile);

module.exports = router;
