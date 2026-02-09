const express = require('express');
const { ingestMeterData, ingestVehicleData } = require('../controllers/TelemetryController');

const router = express.Router();

// POST /v1/telemetry/meter - Ingest meter telemetry
router.post('/meter', ingestMeterData);

// POST /v1/telemetry/vehicle - Ingest vehicle telemetry
router.post('/vehicle', ingestVehicleData);

module.exports = router;
