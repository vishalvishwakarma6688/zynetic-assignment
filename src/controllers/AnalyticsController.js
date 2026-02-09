const { getVehicleTelemetryRange, getMeterTelemetryRange } = require('../repositories/TelemetryRepository');
const { getAllAssociatedMeterIds } = require('../services/CorrelationService');

async function getPerformanceSummary(req, res) {
    try {
        const { vehicleId } = req.params;

        if (!vehicleId || typeof vehicleId !== 'string' || vehicleId.trim() === '') {
            return res.status(400).json({
                statusCode: 400,
                message: 'Invalid vehicleId format'
            });
        }

        const periodEnd = new Date();
        const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);

        const vehicleTelemetry = await getVehicleTelemetryRange(
            vehicleId,
            periodStart,
            periodEnd
        );

        if (vehicleTelemetry.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: `No data found for vehicle: ${vehicleId}`
            });
        }

        const meterIds = await getAllAssociatedMeterIds(vehicleId);

        let meterTelemetry = [];
        for (const meterId of meterIds) {
            const meterData = await getMeterTelemetryRange(
                meterId,
                periodStart,
                periodEnd
            );
            meterTelemetry = meterTelemetry.concat(meterData);
        }
        const totalDcDelivered = vehicleTelemetry.reduce(
            (sum, record) => sum + parseFloat(record.kwh_delivered_dc),
            0
        );

        const totalAcConsumed = meterTelemetry.reduce(
            (sum, record) => sum + parseFloat(record.kwh_consumed_ac),
            0
        );

        const avgBatteryTemp = vehicleTelemetry.reduce(
            (sum, record) => sum + parseFloat(record.battery_temp),
            0
        ) / vehicleTelemetry.length;

        let efficiencyRatio = null;
        if (totalAcConsumed > 0) {
            efficiencyRatio = totalDcDelivered / totalAcConsumed;
        }

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
