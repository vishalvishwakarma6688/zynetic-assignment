const { validateMeterTelemetry, validateVehicleTelemetry } = require('../services/ValidationService');
const { saveMeterTelemetry, saveVehicleTelemetry } = require('../repositories/TelemetryRepository');

/**
 * Ingest meter telemetry data
 */
async function ingestMeterData(req, res) {
    try {
        const data = req.body;

        // Validate request body
        const validation = validateMeterTelemetry(data);
        if (!validation.valid) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Save to database (dual-write)
        await saveMeterTelemetry(data);

        return res.status(201).json({
            statusCode: 201,
            message: 'Meter telemetry ingested successfully'
        });
    } catch (error) {
        console.error('Error ingesting meter data:', error);
        return res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Ingest vehicle telemetry data
 */
async function ingestVehicleData(req, res) {
    try {
        const data = req.body;

        // Validate request body
        const validation = validateVehicleTelemetry(data);
        if (!validation.valid) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Save to database (dual-write)
        await saveVehicleTelemetry(data);

        return res.status(201).json({
            statusCode: 201,
            message: 'Vehicle telemetry ingested successfully'
        });
    } catch (error) {
        console.error('Error ingesting vehicle data:', error);
        return res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
}

module.exports = {
    ingestMeterData,
    ingestVehicleData
};
