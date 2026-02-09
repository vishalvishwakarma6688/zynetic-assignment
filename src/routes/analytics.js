const express = require('express');
const { getPerformanceSummary } = require('../controllers/AnalyticsController');

const router = express.Router();

router.get('/performance/:vehicleId', getPerformanceSummary);

module.exports = router;
