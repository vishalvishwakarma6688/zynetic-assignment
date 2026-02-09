# Energy Ingestion Engine

A high-performance telemetry ingestion system for electric vehicle charging infrastructure, handling 10,000+ devices with 14.4M records/day.

## Architecture

```
┌─────────────────┐
│   API Layer     │  Express.js REST API
│  (Port 3000)    │  - Telemetry ingestion
└────────┬────────┘  - Analytics queries
         │
┌────────▼────────┐
│ Business Logic  │  - Validation Service
│                 │  - Correlation Service
└────────┬────────┘  - Repository Layer
         │
┌────────▼────────┐
│   PostgreSQL    │  Dual-Store Architecture:
│  (Port 5432)    │  - Historical (append-only)
└─────────────────┘  - Operational (upsert)
```

### Dual-Store Design
- **Historical Store**: Immutable time-series data for auditing
- **Operational Store**: Latest device state for real-time queries
- **Transaction Safety**: Both stores updated atomically

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Container**: Docker & Docker Compose
- **Testing**: Jest with fast-check (property-based testing)

## Prerequisites

Before running this project, ensure you have:

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
   - Must be installed and running
   - Verify: `docker --version` and `docker-compose --version`

2. **Node.js 18+** (optional, for local development only)
   - [Download here](https://nodejs.org/)
   - Verify: `node --version`

3. **Git** (to clone the repository)
   - [Download here](https://git-scm.com/)

## Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/vishalvishwakarma6688/zynetic-assignment.git
cd zynetic-assignment
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
copy .env.example .env
```

The `.env` file contains:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=energy_ingestion
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
```

**Note:** No changes needed for Docker setup. These defaults work out of the box.

### Step 4: Start the Application

**Option 1: Using batch script (Recommended)**
```bash
start.bat
```

**Option 2: Using Docker Compose directly**
```bash
docker-compose up
```

**Option 3: Run in background (detached mode)**
```bash
docker-compose up -d
```

### Step 5: Verify Services are Running

Check all containers are running:
```bash
docker ps
```

You should see 3 containers:
- `energy-ingestion-app` (API Server)
- `energy-ingestion-db` (PostgreSQL)
- `energy-ingestion-pgadmin` (pgAdmin GUI)

### Step 6: Test the API

Open your browser or use curl:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T15:30:00.123Z"
}
```

## Running the Application

### Start Services
```bash
start.bat
```
Or:
```bash
docker-compose up
```

### Stop Services
```bash
stop.bat
```
Or:
```bash
docker-compose down
```

### Restart Services
```bash
restart.bat
```
Or:
```bash
docker-compose down
docker-compose up
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

## API Endpoints

**Base URL:** `http://localhost:3000`

**Total Endpoints: 4**

---

### 1. Health Check
**GET** `/health`

**Example:**
```bash
curl http://localhost:3000/health
```

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T10:30:00.123Z"
}
```

---

### 2. Ingest Meter Telemetry
**POST** `/v1/telemetry/meter`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "meterId": "meter-001",
  "kwhConsumedAc": 125.5,
  "voltage": 220,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Example (Windows CMD):**
```bash
curl -X POST http://localhost:3000/v1/telemetry/meter ^
  -H "Content-Type: application/json" ^
  -d "{\"meterId\":\"meter-001\",\"kwhConsumedAc\":125.5,\"voltage\":220,\"timestamp\":\"2026-02-09T10:30:00Z\"}"
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "message": "Meter telemetry ingested successfully"
}
```

**Validation Error (400):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "meterId is required and must be a non-empty string"
  ]
}
```

---

### 3. Ingest Vehicle Telemetry
**POST** `/v1/telemetry/vehicle`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "vehicleId": "vehicle-001",
  "soc": 75,
  "kwhDeliveredDc": 95.3,
  "batteryTemp": 32.5,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Example (Windows CMD):**
```bash
curl -X POST http://localhost:3000/v1/telemetry/vehicle ^
  -H "Content-Type: application/json" ^
  -d "{\"vehicleId\":\"vehicle-001\",\"soc\":75,\"kwhDeliveredDc\":95.3,\"batteryTemp\":32.5,\"timestamp\":\"2026-02-09T10:30:00Z\"}"
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "message": "Vehicle telemetry ingested successfully"
}
```

---

### 4. Get Vehicle Performance Summary (24-hour)
**GET** `/v1/analytics/performance/:vehicleId`

**URL Parameters:**
- `vehicleId` (required): Vehicle identifier

**Example:**
```bash
curl http://localhost:3000/v1/analytics/performance/vehicle-001
```

**Success Response (200):**
```json
{
  "vehicleId": "vehicle-001",
  "periodStart": "2026-02-08T10:30:00.000Z",
  "periodEnd": "2026-02-09T10:30:00.000Z",
  "totalAcConsumed": 3012.5,
  "totalDcDelivered": 2650.8,
  "efficiencyRatio": 0.88,
  "avgBatteryTemp": 32.45,
  "faultDetected": false
}
```

**Fault Detection (efficiency < 0.85):**
```json
{
  "vehicleId": "vehicle-001",
  "efficiencyRatio": 0.797,
  "faultDetected": true
}
```

**Not Found (404):**
```json
{
  "statusCode": 404,
  "message": "No data found for vehicle: vehicle-999"
}
```

---

## Testing with Postman

### Quick Setup
1. Open Postman
2. Create a new request
3. Set method and URL
4. Add header: `Content-Type: application/json`
5. Add body (raw JSON)
6. Send request

### Sample Test Data

**Meter Data:**
```json
{
  "meterId": "meter-001",
  "kwhConsumedAc": 125.5,
  "voltage": 220,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**Vehicle Data:**
```json
{
  "vehicleId": "vehicle-001",
  "soc": 75,
  "kwhDeliveredDc": 110.5,
  "batteryTemp": 32.5,
  "timestamp": "2026-02-09T10:30:00Z"
}
```

**See `POSTMAN_TESTING_GUIDE.md` for comprehensive test cases.**

## Validation Rules

### Meter Telemetry
- `meterId`: Required, non-empty string
- `kwhConsumedAc`: Required, non-negative number
- `voltage`: Required, number between 100-300
- `timestamp`: Required, valid ISO8601 format

### Vehicle Telemetry
- `vehicleId`: Required, non-empty string
- `soc`: Required, number between 0-100 (State of Charge %)
- `kwhDeliveredDc`: Required, non-negative number
- `batteryTemp`: Required, number between -40 and 80 (°C)
- `timestamp`: Required, valid ISO8601 format

## Database Access

### pgAdmin Web Interface

1. **Open pgAdmin:** http://localhost:5050
2. **Login:**
   - Email: `admin@admin.com`
   - Password: `admin`
3. **Add Server:**
   - Right-click "Servers" → "Register" → "Server"
   - **General Tab:**
     - Name: `Energy Ingestion DB`
   - **Connection Tab:**
     - Host: `postgres`
     - Port: `5432`
     - Database: `energy_ingestion`
     - Username: `postgres`
     - Password: `postgres`
4. **Click Save**

### Database Schema

**Historical Tables (append-only):**
- `meter_telemetry` - All meter readings with timestamps
- `vehicle_telemetry` - All vehicle readings with timestamps

**Operational Tables (latest state):**
- `meter_status` - Current meter state (upsert)
- `vehicle_status` - Current vehicle state (upsert)

**Correlation Table:**
- `vehicle_meter_associations` - Vehicle-meter relationships

## Useful Docker Commands

### View Running Containers
```bash
docker ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f pgadmin
```

### Restart Specific Service
```bash
docker-compose restart app
docker-compose restart postgres
```

### Stop and Remove All Containers
```bash
docker-compose down
```

### Remove Containers and Volumes (Clean Slate)
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Access Container Shell
```bash
# App container
docker exec -it energy-ingestion-app sh

# Database container
docker exec -it energy-ingestion-db psql -U postgres -d energy_ingestion
```

## Troubleshooting

### Issue: "Port already in use"
**Solution:**
```bash
docker-compose down
start.bat
```

Or find and kill the process using the port:
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Issue: "Docker daemon not running"
**Solution:**
- Open Docker Desktop
- Wait for it to start completely
- Try again: `start.bat`

### Issue: "Database connection failed"
**Solution:**
```bash
# Check if PostgreSQL container is running
docker ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Issue: "API not responding"
**Solution:**
```bash
# Check app logs
docker-compose logs app

# Restart app
docker-compose restart app

# Rebuild if code changed
docker-compose up -d --build
```

### Issue: "Cannot access pgAdmin"
**Solution:**
- Ensure port 5050 is not in use
- Check pgAdmin logs: `docker-compose logs pgadmin`
- Restart: `docker-compose restart pgadmin`

### Issue: "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

## Development

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Property-Based Tests
```bash
npm test -- ValidationService.property.test.js
```

### Local Development (without Docker)
```bash
# Start PostgreSQL separately (or use Docker for DB only)
docker-compose up -d postgres

# Run app locally
npm run dev
```

## Project Structure

```
.
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── TelemetryController.js
│   │   └── AnalyticsController.js
│   ├── services/          # Business logic
│   │   ├── ValidationService.js
│   │   └── CorrelationService.js
│   ├── repositories/      # Database operations
│   │   └── TelemetryRepository.js
│   ├── routes/            # API routes
│   │   ├── telemetry.js
│   │   └── analytics.js
│   ├── config/            # Configuration
│   │   └── database.js
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── database/
│   └── init.sql           # Database schema
├── docker-compose.yml     # Service orchestration
├── Dockerfile             # App container
├── package.json           # Dependencies
├── .env.example           # Environment template
├── start.bat              # Start services
├── stop.bat               # Stop services
├── restart.bat            # Restart services
└── README.md              # This file
```

## Performance Characteristics

- **Throughput**: 14.4M records/day (10,000+ devices)
- **Latency**: < 100ms per ingestion request
- **Analytics**: Indexed queries, no full table scans
- **Fault Detection**: Automatic efficiency monitoring (threshold: 85%)
- **Dual-Write**: Atomic transactions to both historical and operational stores

## Ports Used

- **3000** - API Server
- **5432** - PostgreSQL Database
- **5050** - pgAdmin Web Interface

Ensure these ports are available before starting the application.

## License

MIT
