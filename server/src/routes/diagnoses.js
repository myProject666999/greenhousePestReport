const express = require('express');
const router = express.Router();
const diagnosisCtrl = require('../controllers/diagnosisController');
const { auth, roleCheck } = require('../middleware/auth');

router.post('/', auth, roleCheck('technician', 'admin'), diagnosisCtrl.create);
router.get('/work-order/:work_order_id', auth, diagnosisCtrl.getByWorkOrder);

module.exports = router;
