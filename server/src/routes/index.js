const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const greenhouseRoutes = require('./greenhouses');
const workOrderRoutes = require('./workOrders');
const diagnosisRoutes = require('./diagnoses');
const feedbackRoutes = require('./feedbacks');
const pestTypeRoutes = require('./pestTypes');
const notificationRoutes = require('./notifications');
const statsRoutes = require('./stats');

router.use('/auth', authRoutes);
router.use('/greenhouses', greenhouseRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/diagnoses', diagnosisRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/pest-types', pestTypeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
