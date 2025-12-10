-- Blynk IoT Platform - Database Schema
-- PostgreSQL + TimescaleDB

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    device_limit INTEGER DEFAULT 5,
    user_limit INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'user', -- admin, user, viewer
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);

-- ============================================
-- TEMPLATES & DATASTREAMS
-- ============================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    hardware_type VARCHAR(50), -- ESP32, ESP8266, Arduino, Raspberry Pi
    connection_type VARCHAR(20) DEFAULT 'WiFi', -- WiFi, Ethernet, Cellular
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_user ON templates(user_id);
CREATE INDEX idx_templates_org ON templates(organization_id);

CREATE TABLE datastreams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    pin VARCHAR(10) NOT NULL, -- V0, V1, V2... V255
    name VARCHAR(255) NOT NULL,
    data_type VARCHAR(20) DEFAULT 'float', -- int, float, string, boolean
    min_value FLOAT,
    max_value FLOAT,
    unit VARCHAR(20),
    decimals INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(template_id, pin)
);

CREATE INDEX idx_datastreams_template ON datastreams(template_id);

-- ============================================
-- DEVICES
-- ============================================

CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_token VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'offline', -- online, offline, error
    last_seen TIMESTAMP,
    ip_address INET,
    firmware_version VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_devices_auth_token ON devices(auth_token);
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_devices_org ON devices(organization_id);
CREATE INDEX idx_devices_status ON devices(status);

-- ============================================
-- SENSOR DATA (TIME-SERIES)
-- ============================================

CREATE TABLE sensor_data (
    time TIMESTAMP NOT NULL,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    pin VARCHAR(10) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (device_id, pin, time)
);

-- Convert to TimescaleDB hypertable for efficient time-series storage
SELECT create_hypertable('sensor_data', 'time', if_not_exists => TRUE);

-- Create indexes for common queries
CREATE INDEX idx_sensor_data_device_time ON sensor_data (device_id, time DESC);
CREATE INDEX idx_sensor_data_pin ON sensor_data (pin, time DESC);

-- Data retention policy (auto-delete data older than 90 days)
SELECT add_retention_policy('sensor_data', INTERVAL '90 days', if_not_exists => TRUE);

-- ============================================
-- AUTOMATION RULES
-- ============================================

CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    condition JSONB NOT NULL, -- {"pin": "V0", "operator": ">", "value": 40}
    action JSONB NOT NULL, -- {"type": "notification", "message": "High temp!"}
    enabled BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rules_device ON automation_rules(device_id);
CREATE INDEX idx_rules_enabled ON automation_rules(enabled) WHERE enabled = true;

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, warning, error, success
    channel VARCHAR(20) DEFAULT 'in_app', -- in_app, email, push, sms
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- ============================================
-- DASHBOARD LAYOUTS
-- ============================================

CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    layout JSONB DEFAULT '[]', -- Array of widget configurations
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dashboards_device ON dashboards(device_id);
CREATE INDEX idx_dashboards_user ON dashboards(user_id);

-- ============================================
-- ACTIVITY LOGS
-- ============================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- login, device_created, rule_triggered
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_device ON activity_logs(device_id, created_at DESC);

-- ============================================
-- API KEYS (for programmatic access)
-- ============================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scopes JSONB DEFAULT '[]', -- ["devices:read", "devices:write"]
    last_used TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (for testing)
-- ============================================

-- Create default organization
INSERT INTO organizations (name, plan, device_limit, user_limit) 
VALUES ('Default Organization', 'pro', 100, 10);

-- Create admin user (password: admin123)
INSERT INTO users (email, password_hash, name, organization_id, role, email_verified)
VALUES (
    'admin@blynk.local',
    '$2b$10$rZ5YwDzkhKCZPNl/e.cWJOxL.qE2P8sH7cMh8kQGfKqJZ5jvQqGKm', -- bcrypt hash
    'Admin User',
    (SELECT id FROM organizations WHERE name = 'Default Organization'),
    'admin',
    true
);

COMMENT ON TABLE organizations IS 'Multi-tenant organizations for team collaboration';
COMMENT ON TABLE users IS 'User accounts with organization membership';
COMMENT ON TABLE templates IS 'Reusable device configurations';
COMMENT ON TABLE datastreams IS 'Virtual pin definitions for templates';
COMMENT ON TABLE devices IS 'Physical IoT devices';
COMMENT ON TABLE sensor_data IS 'Time-series sensor readings';
COMMENT ON TABLE automation_rules IS 'Conditional automation triggers';
COMMENT ON TABLE notifications IS 'User notifications across channels';
COMMENT ON TABLE dashboards IS 'Widget layouts for devices';
COMMENT ON TABLE activity_logs IS 'Audit trail of user and system actions';
