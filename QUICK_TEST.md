# Quick Test - Correct Payloads

## Vehicle Telemetry - CORRECT PAYLOAD

**URL:** `POST http://localhost:3000/v1/telemetry/vehicle`

**Headers:**
```
Content-Type: application/json
```

**Body (CORRECT - includes soc field):**
```json
{
  "vehicleId": "vehicle-001",
  "soc": 75,
  "kwhDeliveredDc": 110.5,
  "batteryTemp": 32.5,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

## Required Fields for Vehicle Telemetry

1. **vehicleId** - string (e.g., "vehicle-001")
2. **soc** - number 0-100 (State of Charge percentage, e.g., 75)
3. **kwhDeliveredDc** - number >= 0 (e.g., 110.5)
4. **batteryTemp** - number -40 to 80 (degrees Celsius, e.g., 32.5)
5. **timestamp** - ISO8601 string (e.g., "2026-02-09T10:30:00Z")

## More Test Data

### Vehicle 1 (Normal)
```json
{
  "vehicleId": "vehicle-001",
  "soc": 75,
  "kwhDeliveredDc": 110.5,
  "batteryTemp": 32.5,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

### Vehicle 2 (High SoC)
```json
{
  "vehicleId": "vehicle-002",
  "soc": 95,
  "kwhDeliveredDc": 175.8,
  "batteryTemp": 28.3,
  "timestamp": "2026-02-09T11:00:00Z"
}
```

### Vehicle 3 (Low SoC, High Temp)
```json
{
  "vehicleId": "vehicle-003",
  "soc": 25,
  "kwhDeliveredDc": 380.0,
  "batteryTemp": 45.7,
  "timestamp": "2026-02-09T12:15:00Z"
}
```

### Vehicle 4 (Medium SoC)
```json
{
  "vehicleId": "vehicle-004",
  "soc": 60,
  "kwhDeliveredDc": 80.0,
  "batteryTemp": 38.2,
  "timestamp": "2026-02-09T13:00:00Z"
}
```

## Expected Success Response

```json
{
  "statusCode": 201,
  "message": "Vehicle telemetry ingested successfully"
}
```
