const pool = require('../config/database');

/**
 * Save meter telemetry with dual-write (historical + operational)
 * @param {Object} data - Meter telemetry data
 */
async function saveMeterTelemetry(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert into historical store (append-only)
        await client.query(
            `INSERT INTO meter_telemetry (meter_id, kwh_consumed_ac, voltage, timestamp)
             VALUES ($1, $2, $3, $4)`,
            [data.meterId, data.kwhConsumedAc, data.voltage, data.timestamp]
        );

        // Upsert into operational store (latest reading)
        await client.query(
            `INSERT INTO meter_status (meter_id, kwh_consumed_ac, voltage, timestamp, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (meter_id) 
             DO UPDATE SET 
               kwh_consumed_ac = EXCLUDED.kwh_consumed_ac,
               voltage = EXCLUDED.voltage,
               timestamp = EXCLUDED.timestamp,
               updated_at = NOW()`,
            [data.meterId, data.kwhConsumedAc, data.voltage, data.timestamp]
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Save vehicle telemetry with dual-write (historical + operational)
 * @param {Object} data - Vehicle telemetry data
 */
async function saveVehicleTelemetry(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert into historical store (append-only)
        await client.query(
            `INSERT INTO vehicle_telemetry (vehicle_id, soc, kwh_delivered_dc, battery_temp, timestamp)
             VALUES ($1, $2, $3, $4, $5)`,
            [data.vehicleId, data.soc, data.kwhDeliveredDc, data.batteryTemp, data.timestamp]
        );

        // Upsert into operational store (latest reading)
        await client.query(
            `INSERT INTO vehicle_status (vehicle_id, soc, kwh_delivered_dc, battery_temp, timestamp, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (vehicle_id) 
             DO UPDATE SET 
               soc = EXCLUDED.soc,
               kwh_delivered_dc = EXCLUDED.kwh_delivered_dc,
               battery_temp = EXCLUDED.battery_temp,
               timestamp = EXCLUDED.timestamp,
               updated_at = NOW()`,
            [data.vehicleId, data.soc, data.kwhDeliveredDc, data.batteryTemp, data.timestamp]
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Get current meter status from operational store
 * @param {string} meterId - Meter ID
 */
async function getCurrentMeterStatus(meterId) {
    const result = await pool.query(
        'SELECT * FROM meter_status WHERE meter_id = $1',
        [meterId]
    );
    return result.rows[0] || null;
}

/**
 * Get current vehicle status from operational store
 * @param {string} vehicleId - Vehicle ID
 */
async function getCurrentVehicleStatus(vehicleId) {
    const result = await pool.query(
        'SELECT * FROM vehicle_status WHERE vehicle_id = $1',
        [vehicleId]
    );
    return result.rows[0] || null;
}

/**
 * Get meter telemetry within time range from historical store
 * @param {string} meterId - Meter ID
 * @param {Date} start - Start timestamp
 * @param {Date} end - End timestamp
 */
async function getMeterTelemetryRange(meterId, start, end) {
    const result = await pool.query(
        `SELECT * FROM meter_telemetry 
         WHERE meter_id = $1 AND timestamp >= $2 AND timestamp <= $3
         ORDER BY timestamp ASC`,
        [meterId, start, end]
    );
    return result.rows;
}

/**
 * Get vehicle telemetry within time range from historical store
 * @param {string} vehicleId - Vehicle ID
 * @param {Date} start - Start timestamp
 * @param {Date} end - End timestamp
 */
async function getVehicleTelemetryRange(vehicleId, start, end) {
    const result = await pool.query(
        `SELECT * FROM vehicle_telemetry 
         WHERE vehicle_id = $1 AND timestamp >= $2 AND timestamp <= $3
         ORDER BY timestamp ASC`,
        [vehicleId, start, end]
    );
    return result.rows;
}

module.exports = {
    saveMeterTelemetry,
    saveVehicleTelemetry,
    getCurrentMeterStatus,
    getCurrentVehicleStatus,
    getMeterTelemetryRange,
    getVehicleTelemetryRange
};
