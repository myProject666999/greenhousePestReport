const express = require('express');
const router = express.Router();
const feedbackCtrl = require('../controllers/feedbackController');
const { auth } = require('../middleware/auth');

router.post('/', auth, feedbackCtrl.create);
router.get('/work-order/:work_order_id', auth, feedbackCtrl.getByWorkOrder);

module.exports = router;
