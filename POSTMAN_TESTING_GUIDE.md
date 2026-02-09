# Postman Testing Guide

Complete guide with dummy data to test all API endpoints.

## Base URL
```
http://localhost:3000
```

---

## 1. Health Check

**Method:** `GET`  
**URL:** `http://localhost:3000/health`  
**Headers:** None required

**Expected Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T15:25:30.123Z"
}
```

---

## 2. Ingest Meter Telemetry

**Method:** `POST`  
**URL:** `http://localhost:3000/v1/telemetry/meter`  
**Headers:**
```
Content-Type: application/json
```

### Test Case 1: Valid Meter Data
**Body (raw JSON):**
```json
{
  "meterId": "meter-001",
  "kwhConsumedAc": 125.5,
  "voltage": 220,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

### Test Case 2: Another Valid Meter
**Body (raw JSON):**
```json
{
  "meterId": "meter-002",
  "kwhConsumedAc": 200.75,
  "voltage": 230,
  "timestamp": "2026-02-09T11:00:00Z"
}
```

### Test Case 3: High Consumption Meter
**Body (raw JSON):**
```json
{
  "meterId": "meter-003",
  "kwhConsumedAc": 450.25,
  "voltage": 240,
  "timestamp": "2026-02-09T12:15:00Z"
}
```

### Test Case 4: Validation Error (Missing meterId)
**Body (raw JSON):**
```json
{
  "kwhConsumedAc": 125.5,
  "voltage": 220,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "meterId is required and must be a non-empty string"
  ]
}
```

### Test Case 5: Validation Error (Negative kwhConsumedAc)
**Body (raw JSON):**
```json
{
  "meterId": "meter-001",
  "kwhConsumedAc": -50,
  "voltage": 220,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "kwhConsumedAc must be a non-negative number"
  ]
}
```

---

## 3. Ingest Vehicle Telemetry

**Method:** `POST`  
**URL:** `http://localhost:3000/v1/telemetry/vehicle`  
**Headers:**
```
Content-Type: application/json
```

### Test Case 1: Valid Vehicle Data (Normal Efficiency)
**Body (raw JSON):**
```json
{
  "vehicleId": "vehicle-001",
  "soc": 75,
  "kwhDeliveredDc": 110.5,
  "batteryTemp": 32.5,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

### Test Case 2: Another Valid Vehicle
**Body (raw JSON):**
```json
{
  "vehicleId": "vehicle-002",
  "soc": 82,
  "kwhDeliveredDc": 175.8,
  "batteryTemp": 28.3,
  "timestamp": "2026-02-09T11:00:00Z"
}
```

### Test Case 3: High Temperature Vehicle
**Body (raw JSON):**
```json
{
  "vehicleId": "vehicle-003",
  "soc": 65,
  "kwhDeliveredDc": 380.0,
  "batteryTemp": 45.7,
  "timestamp": "2026-02-09T12:15:00Z"
}
```

### Test Case 4: Low Efficiency Vehicle (Will trigger fault)
**Body (raw JSON):**
```json
{
  "vehicleId": "vehicle-004",
  "soc": 55,
  "kwhDeliveredDc": 80.0,
  "batteryTemp": 38.2,
  "timestamp": "2026-02-09T13:00:00Z"
}
```

### Test Case 5: Validation Error (Missing soc)
**Body (raw JSON):**
```json
{
  "vehicleId": "vehicle-001",
  "kwhDeliveredDc": 110.5,
  "batteryTemp": 32.5,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "soc is required"
  ]
}
```

### Test Case 6: Validation Error (Invalid soc range)
**Body (raw JSON):**
```json
{
  "vehicleId": "vehicle-001",
  "soc": 150,
  "kwhDeliveredDc": 110.5,
  "batteryTemp": 32.5,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "soc must be between 0 and 100 percent"
  ]
}
```

---

## 4. Get Vehicle Performance Summary

**Method:** `GET`  
**URL:** `http://localhost:3000/v1/analytics/performance/:vehicleId`  
**Headers:** None required

### Test Case 1: Get Performance for vehicle-001
**URL:** `http://localhost:3000/v1/analytics/performance/vehicle-001`

**Expected Response (200):**
```json
{
  "vehicleId": "vehicle-001",
  "periodStart": "2026-02-08T15:25:00.000Z",
  "periodEnd": "2026-02-09T15:25:00.000Z",
  "totalAcConsumed": 125.5,
  "totalDcDelivered": 190.5,
  "efficiencyRatio": 1.5179,
  "avgBatteryTemp": 33.6,
  "faultDetected": false
}
```

### Test Case 2: Get Performance for vehicle-002
**URL:** `http://localhost:3000/v1/analytics/performance/vehicle-002`

### Test Case 3: Get Performance for vehicle-003
**URL:** `http://localhost:3000/v1/analytics/performance/vehicle-003`

### Test Case 4: Vehicle Not Found
**URL:** `http://localhost:3000/v1/analytics/performance/vehicle-999`

**Expected Response (404):**
```json
{
  "statusCode": 404,
  "message": "No data found for vehicle: vehicle-999"
}
```

### Test Case 5: Invalid vehicleId (empty)
**URL:** `http://localhost:3000/v1/analytics/performance/`

**Expected Response (404):**
```json
{
  "statusCode": 404,
  "message": "Route not found"
}
```

---

## Complete Testing Workflow

Follow this sequence to test the complete system:

### Step 1: Check Health
```
GET http://localhost:3000/health
```

### Step 2: Ingest Meter Data (3 meters)
```
POST http://localhost:3000/v1/telemetry/meter
Body: meter-001 data (125.5 kWh)

POST http://localhost:3000/v1/telemetry/meter
Body: meter-002 data (200.75 kWh)

POST http://localhost:3000/v1/telemetry/meter
Body: meter-003 data (450.25 kWh)
```

### Step 3: Ingest Vehicle Data (4 vehicles)
```
POST http://localhost:3000/v1/telemetry/vehicle
Body: vehicle-001 data (75% SoC, 110.5 kWh DC, 32.5°C)

POST http://localhost:3000/v1/telemetry/vehicle
Body: vehicle-002 data (82% SoC, 175.8 kWh DC, 28.3°C)

POST http://localhost:3000/v1/telemetry/vehicle
Body: vehicle-003 data (65% SoC, 380.0 kWh DC, 45.7°C)

POST http://localhost:3000/v1/telemetry/vehicle
Body: vehicle-004 data (55% SoC, 80.0 kWh DC, 38.2°C) - Low efficiency
```

### Step 4: Query Analytics
```
GET http://localhost:3000/v1/analytics/performance/vehicle-001
GET http://localhost:3000/v1/analytics/performance/vehicle-002
GET http://localhost:3000/v1/analytics/performance/vehicle-003
GET http://localhost:3000/v1/analytics/performance/vehicle-004
```

### Step 5: Test Error Cases
```
POST http://localhost:3000/v1/telemetry/meter
Body: Invalid data (missing meterId)

POST http://localhost:3000/v1/telemetry/vehicle
Body: Invalid data (missing soc field)

POST http://localhost:3000/v1/telemetry/vehicle
Body: Invalid data (soc > 100)

GET http://localhost:3000/v1/analytics/performance/vehicle-999
(Non-existent vehicle)
```

---

## Postman Collection Setup

### Create a New Collection

1. Open Postman
2. Click "New" → "Collection"
3. Name it "Energy Ingestion Engine"

### Add Environment Variables

1. Click "Environments" → "Create Environment"
2. Name it "Local Development"
3. Add variable:
   - Variable: `base_url`
   - Initial Value: `http://localhost:3000`
   - Current Value: `http://localhost:3000`

### Use Variables in Requests

Replace `http://localhost:3000` with `{{base_url}}` in all requests:
```
{{base_url}}/health
{{base_url}}/v1/telemetry/meter
{{base_url}}/v1/telemetry/vehicle
{{base_url}}/v1/analytics/performance/vehicle-001
```

---

## Expected Behavior

### Normal Operation
- Meter ingestion returns 201 with ingested data
- Vehicle ingestion returns 201 with ingested data
- Analytics returns 200 with performance summary
- Efficiency ratio > 0.85 → `faultDetected: false`

### Fault Detection
- Efficiency ratio < 0.85 → `faultDetected: true`
- This happens when DC delivered is much less than AC consumed

### Error Handling
- Missing required fields → 400 with validation errors
- Invalid data types → 400 with validation errors
- Non-existent vehicle → 404 with error message
- Invalid routes → 404 with "Route not found"

---

## Quick Copy-Paste Data Sets

### Meter Data Set (Copy all 3)
```json
{"meterId":"meter-001","kwhConsumedAc":125.5,"voltage":220,"timestamp":"2026-02-09T10:30:00Z"}
{"meterId":"meter-002","kwhConsumedAc":200.75,"voltage":230,"timestamp":"2026-02-09T11:00:00Z"}
{"meterId":"meter-003","kwhConsumedAc":450.25,"voltage":240,"timestamp":"2026-02-09T12:15:00Z"}
```

### Vehicle Data Set (Copy all 4)
```json
{"vehicleId":"vehicle-001","soc":75,"kwhDeliveredDc":110.5,"batteryTemp":32.5,"timestamp":"2026-02-09T10:30:00Z"}
{"vehicleId":"vehicle-002","soc":82,"kwhDeliveredDc":175.8,"batteryTemp":28.3,"timestamp":"2026-02-09T11:00:00Z"}
{"vehicleId":"vehicle-003","soc":65,"kwhDeliveredDc":380.0,"batteryTemp":45.7,"timestamp":"2026-02-09T12:15:00Z"}
{"vehicleId":"vehicle-004","soc":55,"kwhDeliveredDc":80.0,"batteryTemp":38.2,"timestamp":"2026-02-09T13:00:00Z"}
```

### Analytics URLs (Copy all 4)
```
http://localhost:3000/v1/analytics/performance/vehicle-001
http://localhost:3000/v1/analytics/performance/vehicle-002
http://localhost:3000/v1/analytics/performance/vehicle-003
http://localhost:3000/v1/analytics/performance/vehicle-004
```

---

## Troubleshooting

**"Connection refused" error:**
- Ensure Docker containers are running: `docker ps`
- Start services: `start.bat`

**"Route not found" error:**
- Check the URL path is correct
- Ensure you're using `/v1/telemetry/` not `/api/telemetry/`

**"Validation failed" error:**
- Check all required fields are present
- Verify data types (numbers not strings)
- Ensure timestamp is valid ISO8601 format

**"No data found" error:**
- Ingest vehicle data first before querying analytics
- Wait a few seconds after ingestion
- Check the vehicleId matches what you ingested
