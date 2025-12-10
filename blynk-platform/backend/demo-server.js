const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));  // Allow all origins for demo
app.use(express.json());

// Serve static files (HTML pages)
app.use(express.static(__dirname));
app.use(express.static(require('path').join(__dirname, '../..')));

// Mock data for demonstration
const mockDevices = [
    {
        id: '1',
        name: 'ESP32 Temperature Sensor',
        authToken: 'demo_token_abc123',
        status: 'online',
        lastSeen: new Date()
    },
    {
        id: '2',
        name: 'ESP8266 Humidity Monitor',
        authToken: 'demo_token_xyz789',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000)
    }
];

const mockSensorData = [
    { time: new Date(), deviceId: '1', pin: 'V0', value: 24.5 },
    { time: new Date(), deviceId: '1', pin: 'V1', value: 62.3 },
];

// ==========================================
// DEMO ROUTES
// ==========================================

// Home page - redirect to device manager
app.get('/', (req, res) => {
    res.redirect('/device-manager.html');
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Blynk IoT Platform - Demo Mode',
        timestamp: new Date().toISOString(),
        note: 'Running without database - mock data only'
    });
});

// Auth (mock)
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    res.status(201).json({
        message: 'User registered (DEMO)',
        user: { id: 'demo-user-1', email, name },
        token: 'demo-jwt-token-12345'
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    res.json({
        message: 'Login successful (DEMO)',
        user: { id: 'demo-user-1', email: email || 'demo@example.com', name: 'Demo User' },
        token: 'demo-jwt-token-12345'
    });
});

// Devices
app.get('/api/devices', (req, res) => {
    res.json({
        devices: mockDevices,
        note: 'Mock data - database not connected'
    });
});

app.post('/api/devices', (req, res) => {
    const { name, description, hardwareType = 'ESP8266' } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Device name is required' });
    }

    const newDevice = {
        id: String(mockDevices.length + 1),
        name,
        description,
        authToken: `${Math.random().toString(36).slice(2, 9)}${Math.random().toString(36).slice(2, 9)}`,
        status: 'offline',
        hardwareType: hardwareType,
        createdAt: new Date()
    };
    mockDevices.push(newDevice);

    // Generate Arduino code
    const arduinoCode = generateArduinoCode(newDevice, hardwareType);

    res.status(201).json({
        message: 'Device created successfully!',
        device: newDevice,
        arduinoCode: arduinoCode,
        instructions: [
            '1. Copy the Arduino code below',
            '2. Update WiFi credentials (ssid, password)',
            '3. Update SERVER_IP with your computer IP',
            '4. Upload to ESP8266/ESP32',
            '5. Open Serial Monitor (115200 baud)'
        ]
    });
});

// Helper function to generate Arduino code
function generateArduinoCode(device, hardwareType) {
    return `/*************************************************************
  ${device.name} - Auto-Generated Code
  Auth Token: ${device.authToken}
  Hardware: ${hardwareType}
  Generated: ${new Date().toLocaleString()}
*************************************************************/

#include <${hardwareType === 'ESP32' ? 'WiFi' : 'ESP8266WiFi'}.h>
#include <ArduinoWebsockets.h>
#include <DHT.h>

using namespace websockets;

// WiFi - UPDATE THESE!
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* SERVER_IP = "YOUR_COMPUTER_IP";  // e.g., "192.168.1.100"
const int SERVER_PORT = 8080;

// Device Config (Auto-Generated)
const char* AUTH_TOKEN = "${device.authToken}";

// Sensor
#define DHTPIN D4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
WebsocketsClient client;

void setup() {
  Serial.begin(115200);
  dht.begin();
  delay(2000);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected!");
  
  String wsUrl = String("ws://") + SERVER_IP + ":" + SERVER_PORT;
  if (client.connect(wsUrl.c_str())) {
    Serial.println("WebSocket connected!");
    client.send("{\\"type\\":\\"device\\",\\"deviceId\\":\\"" + String(AUTH_TOKEN) + "\\"}");
  }
}

void loop() {
  if (!client.available()) {
    delay(5000);
    return;
  }
  
  client.poll();
  
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (!isnan(temp) && !isnan(hum)) {
    String json = "{\\"deviceId\\":\\"" + String(AUTH_TOKEN) + "\\",\\"V0\\":" + String(temp, 1) + ",\\"V1\\":" + String(hum, 1) + "}";
    client.send(json);
    Serial.println(json);
  }
  
  delay(2000);
}

/* Upload this code to your ${hardwareType} and watch your dashboard! */`;
}

app.get('/api/devices/:id', (req, res) => {
    const device = mockDevices.find(d => d.id === req.params.id);
    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ device });
});

app.get('/api/devices/:id/data', (req, res) => {
    const { pin, limit = 10 } = req.query;
    let data = mockSensorData.filter(d => d.deviceId === req.params.id);

    if (pin) {
        data = data.filter(d => d.pin === pin);
    }

    res.json({
        data: data.slice(0, limit),
        note: 'Mock sensor data'
    });
});

// Templates
app.get('/api/templates', (req, res) => {
    res.json({
        templates: [
            { id: '1', name: 'ESP32 Temperature & Humidity', hardwareType: 'ESP32' },
            { id: '2', name: 'ESP8266 Basic Sensor', hardwareType: 'ESP8266' }
        ]
    });
});

// API Documentation
app.get('/api', (req, res) => {
    res.json({
        name: 'Blynk IoT Platform API',
        version: '1.0.0',
        status: 'DEMO MODE - No database connected',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'Login',
                'GET /api/auth/me': 'Get current user'
            },
            devices: {
                'GET /api/devices': 'List all devices',
                'POST /api/devices': 'Create device',
                'GET /api/devices/:id': 'Get device details',
                'PUT /api/devices/:id': 'Update device',
                'DELETE /api/devices/:id': 'Delete device',
                'GET /api/devices/:id/data': 'Get sensor data'
            },
            templates: {
                'GET /api/templates': 'List templates',
                'POST /api/templates': 'Create template'
            }
        },
        note: 'Full functionality requires PostgreSQL database. See README.md for setup.'
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        suggestion: 'Visit /api for available endpoints'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║  Blynk IoT Platform - DEMO MODE         ║');
    console.log('╚═══════════════════════════════════════════╝\n');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌐 Device Manager: http://localhost:${PORT}/device-manager.html`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/health\n`);
    console.log('⚠️  NOTE: Running in DEMO mode without database');
    console.log('📚 For full setup, see README.md\n');
    console.log('👉 OPEN: http://localhost:3000 in your browser!\n');
});
