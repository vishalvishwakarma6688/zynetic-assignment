CREATE TABLE IF NOT EXISTS meter_telemetry (
  id BIGSERIAL PRIMARY KEY,
  meter_id VARCHAR(50) NOT NULL,
  kwh_consumed_ac DECIMAL(10, 3) NOT NULL,
  voltage DECIMAL(6, 2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meter_telemetry_meter_time 
  ON meter_telemetry(meter_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS vehicle_telemetry (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id VARCHAR(50) NOT NULL,
  soc DECIMAL(5, 2) NOT NULL,
  kwh_delivered_dc DECIMAL(10, 3) NOT NULL,
  battery_temp DECIMAL(5, 2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_telemetry_vehicle_time 
  ON vehicle_telemetry(vehicle_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS meter_status (
  meter_id VARCHAR(50) PRIMARY KEY,
  kwh_consumed_ac DECIMAL(10, 3) NOT NULL,
  voltage DECIMAL(6, 2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_status (
  vehicle_id VARCHAR(50) PRIMARY KEY,
  soc DECIMAL(5, 2) NOT NULL,
  kwh_delivered_dc DECIMAL(10, 3) NOT NULL,
  battery_temp DECIMAL(5, 2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_meter_associations (
  vehicle_id VARCHAR(50) PRIMARY KEY,
  meter_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_associations_meter 
  ON vehicle_meter_associations(meter_id);

INSERT INTO vehicle_meter_associations (vehicle_id, meter_id) VALUES
  ('vehicle-001', 'meter-001'),
  ('vehicle-002', 'meter-002'),
  ('vehicle-003', 'meter-003')
ON CONFLICT (vehicle_id) DO NOTHING;
