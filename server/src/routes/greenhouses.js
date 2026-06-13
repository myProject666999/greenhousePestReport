const express = require('express');
const router = express.Router();
const greenhouseCtrl = require('../controllers/greenhouseController');
const { auth } = require('../middleware/auth');

router.get('/qr/:qr_code', greenhouseCtrl.getByQrCode);
router.get('/', auth, greenhouseCtrl.list);
router.post('/', auth, greenhouseCtrl.create);
router.put('/:id', auth, greenhouseCtrl.update);
router.get('/farmer/:farmer_id', auth, greenhouseCtrl.getByFarmer);

module.exports = router;
