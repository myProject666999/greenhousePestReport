const express = require('express');
const router = express.Router();
const statsCtrl = require('../controllers/statsController');
const { auth, roleCheck } = require('../middleware/auth');

router.get('/overview', auth, statsCtrl.overview);
router.get('/pest-distribution', auth, statsCtrl.pestDistribution);
router.get('/region-summary', auth, statsCtrl.regionSummary);
router.get('/trend', auth, statsCtrl.trendData);
router.get('/top-pests', auth, statsCtrl.topPests);

module.exports = router;
