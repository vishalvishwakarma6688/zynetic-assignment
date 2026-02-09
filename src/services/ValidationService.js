/**
 * Validates meter telemetry data
 * @param {Object} data - Meter telemetry data
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateMeterTelemetry(data) {
    const errors = [];

    // Field presence validation
    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ['Data must be an object'] };
    }

    if (!data.meterId) {
        errors.push('meterId is required');
    }
    if (data.kwhConsumedAc === undefined || data.kwhConsumedAc === null) {
        errors.push('kwhConsumedAc is required');
    }
    if (data.voltage === undefined || data.voltage === null) {
        errors.push('voltage is required');
    }
    if (!data.timestamp) {
        errors.push('timestamp is required');
    }

    // Type validation
    if (data.meterId && typeof data.meterId !== 'string') {
        errors.push('meterId must be a string');
    }
    if (data.kwhConsumedAc !== undefined && typeof data.kwhConsumedAc !== 'number') {
        errors.push('kwhConsumedAc must be a number');
    }
    if (data.voltage !== undefined && typeof data.voltage !== 'number') {
        errors.push('voltage must be a number');
    }

    // Range validation
    if (typeof data.kwhConsumedAc === 'number' && data.kwhConsumedAc < 0) {
        errors.push('kwhConsumedAc must be a non-negative number');
    }
    if (typeof data.voltage === 'number' && (data.voltage < 100 || data.voltage > 300)) {
        errors.push('voltage must be between 100 and 300 volts');
    }

    // Timestamp validation - Just check if it's a valid date
    if (data.timestamp) {
        const timestamp = new Date(data.timestamp);
        if (isNaN(timestamp.getTime())) {
            errors.push('timestamp must be a valid ISO8601 date string');
        }
        // Removed time window check to allow any valid timestamp
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validates vehicle telemetry data
 * @param {Object} data - Vehicle telemetry data
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateVehicleTelemetry(data) {
    const errors = [];

    // Field presence validation
    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ['Data must be an object'] };
    }

    if (!data.vehicleId) {
        errors.push('vehicleId is required');
    }
    if (data.soc === undefined || data.soc === null) {
        errors.push('soc is required');
    }
    if (data.kwhDeliveredDc === undefined || data.kwhDeliveredDc === null) {
        errors.push('kwhDeliveredDc is required');
    }
    if (data.batteryTemp === undefined || data.batteryTemp === null) {
        errors.push('batteryTemp is required');
    }
    if (!data.timestamp) {
        errors.push('timestamp is required');
    }

    // Type validation
    if (data.vehicleId && typeof data.vehicleId !== 'string') {
        errors.push('vehicleId must be a string');
    }
    if (data.soc !== undefined && typeof data.soc !== 'number') {
        errors.push('soc must be a number');
    }
    if (data.kwhDeliveredDc !== undefined && typeof data.kwhDeliveredDc !== 'number') {
        errors.push('kwhDeliveredDc must be a number');
    }
    if (data.batteryTemp !== undefined && typeof data.batteryTemp !== 'number') {
        errors.push('batteryTemp must be a number');
    }

    // Range validation
    if (typeof data.soc === 'number' && (data.soc < 0 || data.soc > 100)) {
        errors.push('soc must be between 0 and 100 percent');
    }
    if (typeof data.kwhDeliveredDc === 'number' && data.kwhDeliveredDc < 0) {
        errors.push('kwhDeliveredDc must be a non-negative number');
    }
    if (typeof data.batteryTemp === 'number' && (data.batteryTemp < -40 || data.batteryTemp > 80)) {
        errors.push('batteryTemp must be between -40 and 80 degrees Celsius');
    }

    // Timestamp validation - Just check if it's a valid date
    if (data.timestamp) {
        const timestamp = new Date(data.timestamp);
        if (isNaN(timestamp.getTime())) {
            errors.push('timestamp must be a valid ISO8601 date string');
        }
        // Removed time window check to allow any valid timestamp
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    validateMeterTelemetry,
    validateVehicleTelemetry
};
