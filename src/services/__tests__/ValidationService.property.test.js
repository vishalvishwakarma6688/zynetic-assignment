const fc = require('fast-check');
const ValidationService = require('../ValidationService');

describe('ValidationService - Property-Based Tests', () => {
    let validationService;

    beforeEach(() => {
        validationService = new ValidationService();
    });

    describe('Property 1: Meter Telemetry Validation Completeness', () => {
        it('should accept meter telemetry if and only if all fields are valid', () => {
            // Feature: energy-ingestion-engine, Property 1: Meter Telemetry Validation Completeness
            // Validates: Requirements 1.1, 1.3, 1.4, 2.1, 2.2, 2.6

            fc.assert(
                fc.property(
                    fc.record({
                        meterId: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
                        kwhConsumedAc: fc.oneof(fc.float(), fc.constant(null), fc.constant(undefined)),
                        voltage: fc.oneof(fc.float(), fc.constant(null), fc.constant(undefined)),
                        timestamp: fc.oneof(
                            fc.date({ min: new Date(Date.now() - 4 * 60 * 1000), max: new Date(Date.now() + 4 * 60 * 1000) }),
                            fc.date({ min: new Date(Date.now() - 60 * 60 * 1000), max: new Date(Date.now() - 6 * 60 * 1000) }),
                            fc.date({ min: new Date(Date.now() + 6 * 60 * 1000), max: new Date(Date.now() + 60 * 60 * 1000) }),
                            fc.constant(null),
                            fc.constant(undefined)
                        )
                    }),
                    (data) => {
                        const result = validationService.validateMeterTelemetry(data);

                        // Determine if data should be valid
                        const hasAllFields =
                            !!data.meterId &&
                            data.kwhConsumedAc !== null &&
                            data.kwhConsumedAc !== undefined &&
                            data.voltage !== null &&
                            data.voltage !== undefined &&
                            !!data.timestamp;

                        if (!hasAllFields) {
                            // If missing fields, should be invalid
                            expect(result.valid).toBe(false);
                            expect(result.errors.length).toBeGreaterThan(0);
                            return;
                        }

                        const hasValidTypes =
                            typeof data.meterId === 'string' &&
                            typeof data.kwhConsumedAc === 'number' &&
                            typeof data.voltage === 'number';

                        if (!hasValidTypes) {
                            // If invalid types, should be invalid
                            expect(result.valid).toBe(false);
                            expect(result.errors.length).toBeGreaterThan(0);
                            return;
                        }

                        const hasValidRanges =
                            data.kwhConsumedAc >= 0 &&
                            data.voltage >= 100 &&
                            data.voltage <= 300;

                        if (!hasValidRanges) {
                            // If out of range, should be invalid
                            expect(result.valid).toBe(false);
                            expect(result.errors.length).toBeGreaterThan(0);
                            return;
                        }

                        // Check timestamp validity
                        const timestamp = new Date(data.timestamp);
                        if (isNaN(timestamp.getTime())) {
                            expect(result.valid).toBe(false);
                            expect(result.errors.length).toBeGreaterThan(0);
                            return;
                        }

                        const now = new Date();
                        const diffMinutes = Math.abs(now - timestamp) / (1000 * 60);
                        const hasValidTimestamp = diffMinutes <= 5;

                        if (!hasValidTimestamp) {
                            // If timestamp out of range, should be invalid
                            expect(result.valid).toBe(false);
                            expect(result.errors.length).toBeGreaterThan(0);
                            return;
                        }

                        // All checks passed, should be valid
                        expect(result.valid).toBe(true);
                        expect(result.errors.length).toBe(0);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});

describe('Property 2: Vehicle Telemetry Validation Completeness', () => {
    it('should accept vehicle telemetry if and only if all fields are valid', () => {
        // Feature: energy-ingestion-engine, Property 2: Vehicle Telemetry Validation Completeness
        // Validates: Requirements 1.2, 1.3, 1.4, 2.3, 2.4, 2.5, 2.6

        fc.assert(
            fc.property(
                fc.record({
                    vehicleId: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
                    soc: fc.oneof(fc.float(), fc.constant(null), fc.constant(undefined)),
                    kwhDeliveredDc: fc.oneof(fc.float(), fc.constant(null), fc.constant(undefined)),
                    batteryTemp: fc.oneof(fc.float(), fc.constant(null), fc.constant(undefined)),
                    timestamp: fc.oneof(
                        fc.date({ min: new Date(Date.now() - 4 * 60 * 1000), max: new Date(Date.now() + 4 * 60 * 1000) }),
                        fc.date({ min: new Date(Date.now() - 60 * 60 * 1000), max: new Date(Date.now() - 6 * 60 * 1000) }),
                        fc.date({ min: new Date(Date.now() + 6 * 60 * 1000), max: new Date(Date.now() + 60 * 60 * 1000) }),
                        fc.constant(null),
                        fc.constant(undefined)
                    )
                }),
                (data) => {
                    const result = validationService.validateVehicleTelemetry(data);

                    // Determine if data should be valid
                    const hasAllFields =
                        !!data.vehicleId &&
                        data.soc !== null &&
                        data.soc !== undefined &&
                        data.kwhDeliveredDc !== null &&
                        data.kwhDeliveredDc !== undefined &&
                        data.batteryTemp !== null &&
                        data.batteryTemp !== undefined &&
                        !!data.timestamp;

                    if (!hasAllFields) {
                        // If missing fields, should be invalid
                        expect(result.valid).toBe(false);
                        expect(result.errors.length).toBeGreaterThan(0);
                        return;
                    }

                    const hasValidTypes =
                        typeof data.vehicleId === 'string' &&
                        typeof data.soc === 'number' &&
                        typeof data.kwhDeliveredDc === 'number' &&
                        typeof data.batteryTemp === 'number';

                    if (!hasValidTypes) {
                        // If invalid types, should be invalid
                        expect(result.valid).toBe(false);
                        expect(result.errors.length).toBeGreaterThan(0);
                        return;
                    }

                    const hasValidRanges =
                        data.soc >= 0 && data.soc <= 100 &&
                        data.kwhDeliveredDc >= 0 &&
                        data.batteryTemp >= -40 && data.batteryTemp <= 80;

                    if (!hasValidRanges) {
                        // If out of range, should be invalid
                        expect(result.valid).toBe(false);
                        expect(result.errors.length).toBeGreaterThan(0);
                        return;
                    }

                    // Check timestamp validity
                    const timestamp = new Date(data.timestamp);
                    if (isNaN(timestamp.getTime())) {
                        expect(result.valid).toBe(false);
                        expect(result.errors.length).toBeGreaterThan(0);
                        return;
                    }

                    const now = new Date();
                    const diffMinutes = Math.abs(now - timestamp) / (1000 * 60);
                    const hasValidTimestamp = diffMinutes <= 5;

                    if (!hasValidTimestamp) {
                        // If timestamp out of range, should be invalid
                        expect(result.valid).toBe(false);
                        expect(result.errors.length).toBeGreaterThan(0);
                        return;
                    }

                    // All checks passed, should be valid
                    expect(result.valid).toBe(true);
                    expect(result.errors.length).toBe(0);
                }
            ),
            { numRuns: 100 }
        );
    });
});
