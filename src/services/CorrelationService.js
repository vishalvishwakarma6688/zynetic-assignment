const pool = require('../config/database');

/**
 * Get associated meter ID for a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {string|null} - Meter ID or null if not found
 */
async function getAssociatedMeterId(vehicleId) {
    const result = await pool.query(
        'SELECT meter_id FROM vehicle_meter_associations WHERE vehicle_id = $1',
        [vehicleId]
    );
    return result.rows[0]?.meter_id || null;
}

/**
 * Get associated vehicle ID for a meter
 * @param {string} meterId - Meter ID
 * @returns {string|null} - Vehicle ID or null if not found
 */
async function getAssociatedVehicleId(meterId) {
    const result = await pool.query(
        'SELECT vehicle_id FROM vehicle_meter_associations WHERE meter_id = $1',
        [meterId]
    );
    return result.rows[0]?.vehicle_id || null;
}

/**
 * Get all meter IDs associated with a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {Array<string>} - Array of meter IDs
 */
async function getAllAssociatedMeterIds(vehicleId) {
    const result = await pool.query(
        'SELECT meter_id FROM vehicle_meter_associations WHERE vehicle_id = $1',
        [vehicleId]
    );
    return result.rows.map(row => row.meter_id);
}

/**
 * Create or update vehicle-meter association
 * @param {string} vehicleId - Vehicle ID
 * @param {string} meterId - Meter ID
 */
async function createAssociation(vehicleId, meterId) {
    await pool.query(
        `INSERT INTO vehicle_meter_associations (vehicle_id, meter_id)
         VALUES ($1, $2)
         ON CONFLICT (vehicle_id) 
         DO UPDATE SET meter_id = EXCLUDED.meter_id`,
        [vehicleId, meterId]
    );
}

module.exports = {
    getAssociatedMeterId,
    getAssociatedVehicleId,
    getAllAssociatedMeterIds,
    createAssociation
};
