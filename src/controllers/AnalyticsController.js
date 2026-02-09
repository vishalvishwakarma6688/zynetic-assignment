const { getVehicleTelemetryRange, getMeterTelemetryRange } = require('../repositories/TelemetryRepository');
const { getAllAssociatedMeterIds } = require('../services/CorrelationService');

/**
 * Get 24-hour performance summary for a vehicle
 */
async function getPerformanceSummary(req, res) {
    try {
        const { vehicleId } = req.params;

        // Validate vehicleId
        if (!vehicleId || typeof vehicleId !== 'string' || vehicleId.trim() === '') {
            return res.status(400).json({
                statusCode: 400,
                message: 'Invalid vehicleId format'
            });
        }

        // Define 24-hour time window
        const periodEnd = new Date();
        const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);

        // Get vehicle telemetry for last 24 hours
        const vehicleTelemetry = await getVehicleTelemetryRange(
            vehicleId,
            periodStart,
            periodEnd
        );

        // If no vehicle data found, return 404
        if (vehicleTelemetry.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: `No data found for vehicle: ${vehicleId}`
            });
        }

        // Get associated meter IDs
        const meterIds = await getAllAssociatedMeterIds(vehicleId);

        // Get meter telemetry for all associated meters
        let meterTelemetry = [];
        for (const meterId of meterIds) {
            const meterData = await getMeterTelemetryRange(
                meterId,
                periodStart,
                periodEnd
            );
            meterTelemetry = meterTelemetry.concat(meterData);
        }

        // Compute totalDcDelivered (sum of kwhDeliveredDc)
        const totalDcDelivered = vehicleTelemetry.reduce(
            (sum, record) => sum + parseFloat(record.kwh_delivered_dc),
            0
        );

        // Compute totalAcConsumed (sum of kwhConsumedAc from all associated meters)
        const totalAcConsumed = meterTelemetry.reduce(
            (sum, record) => sum + parseFloat(record.kwh_consumed_ac),
            0
        );

        // Compute avgBatteryTemp (average of batteryTemp)
        const avgBatteryTemp = vehicleTelemetry.reduce(
            (sum, record) => sum + parseFloat(record.battery_temp),
            0
        ) / vehicleTelemetry.length;

        // Compute efficiencyRatio (DC/AC)
        let efficiencyRatio = null;
        if (totalAcConsumed > 0) {
            efficiencyRatio = totalDcDelivered / totalAcConsumed;
        }

        // Detect fault (efficiency < 0.85)
        const faultDetected = efficiencyRatio !== null && efficiencyRatio < 0.85;

        return res.status(200).json({
            vehicleId,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            totalAcConsumed: parseFloat(totalAcConsumed.toFixed(3)),
            totalDcDelivered: parseFloat(totalDcDelivered.toFixed(3)),
            efficiencyRatio: efficiencyRatio !== null ? parseFloat(efficiencyRatio.toFixed(4)) : null,
            avgBatteryTemp: parseFloat(avgBatteryTemp.toFixed(2)),
            faultDetected
        });
    } catch (error) {
        console.error('Error computing performance summary:', error);
        return res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
}

module.exports = {
    getPerformanceSummary
};
