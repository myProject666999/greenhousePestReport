const express = require('express');
const router = express.Router();
const pestTypeCtrl = require('../controllers/pestTypeController');
const { auth, roleCheck } = require('../middleware/auth');

router.get('/', auth, pestTypeCtrl.list);
router.get('/:id', auth, pestTypeCtrl.detail);
router.post('/', auth, roleCheck('admin'), pestTypeCtrl.create);
router.put('/:id', auth, roleCheck('admin'), pestTypeCtrl.update);
router.delete('/:id', auth, roleCheck('admin'), pestTypeCtrl.remove);

module.exports = router;
