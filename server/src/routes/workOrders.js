const express = require('express');
const router = express.Router();
const workOrderCtrl = require('../controllers/workOrderController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.array('images', 3), workOrderCtrl.create);
router.get('/', auth, workOrderCtrl.list);
router.get('/pending-count', auth, workOrderCtrl.getPendingCount);
router.get('/:id', auth, workOrderCtrl.detail);
router.post('/:id/claim', auth, workOrderCtrl.claim);

module.exports = router;
