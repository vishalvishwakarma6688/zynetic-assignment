const express = require('express');
const { ingestMeterData, ingestVehicleData } = require('../controllers/TelemetryController');

const router = express.Router();

router.post('/meter', ingestMeterData);

router.post('/vehicle', ingestVehicleData);

module.exports = router;
