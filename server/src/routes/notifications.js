const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/', auth, notificationCtrl.list);
router.get('/unread-count', auth, notificationCtrl.getUnreadCount);
router.put('/:id/read', auth, notificationCtrl.markRead);
router.put('/read-all', auth, notificationCtrl.markAllRead);

module.exports = router;
