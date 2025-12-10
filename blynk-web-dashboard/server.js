const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, 'sensor_data.csv');

// Initialize CSV if it doesn't exist
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, 'Timestamp,Device,Pin,Value\n');
}

// Function to append data to CSV
function appendToCsv(deviceId, pin, value) {
    const timestamp = new Date().toISOString();
    const line = `${timestamp},${deviceId},${pin},${value}\n`;
    fs.appendFile(CSV_FILE, line, (err) => {
        if (err) console.error('❌ Error writing to CSV:', err);
    });
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS for localhost
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.url === '/export-csv') {
        fs.readFile(CSV_FILE, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error reading CSV file');
                return;
            }
            res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="sensor_data_export.csv"'
            });
            res.end(data);
        });
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Blynk Dashboard WebSocket Server Running\n\n- WebSocket: ws://localhost:8080\n- Export Data: http://localhost:8080/export-csv');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

const clients = new Set();
let esp32Client = null;

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`🔗 New connection from ${clientIp}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📨 Received:', data);

            // Check if this is ESP32 identifying itself
            if (data.type === 'device' && data.name === 'ESP32') {
                esp32Client = ws;
                console.log('🤖 ESP32 device connected!');
                ws.send(JSON.stringify({ status: 'connected', message: 'Welcome ESP32!' }));

                // Notify all web clients that device is connected
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'deviceStatus',
                            deviceConnected: true
                        }));
                    }
                });
                return;
            }

            // Check if this is a web client identifying itself
            if (data.type === 'client') {
                clients.add(ws);
                console.log(`💻 Web client connected. Total clients: ${clients.size}`);
                ws.send(JSON.stringify({ status: 'connected', message: 'Welcome Web Client!' }));

                // Send current device connection status to the new client
                ws.send(JSON.stringify({
                    type: 'deviceStatus',
                    deviceConnected: esp32Client !== null
                }));
                return;
            }

            // Broadcast sensor data from ESP32 to all web clients
            if (data.V0 !== undefined || data.V1 !== undefined || data.V2 !== undefined) {
                console.log(`📡 Broadcasting sensor data to ${clients.size} clients:`, data);

                // Log to CSV
                const deviceId = data.deviceId || 'ESP32';
                if (data.V0 !== undefined) appendToCsv(deviceId, 'V0', data.V0);
                if (data.V1 !== undefined) appendToCsv(deviceId, 'V1', data.V1);
                if (data.V2 !== undefined) appendToCsv(deviceId, 'V2', data.V2);

                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }

        } catch (e) {
            console.error('❌ Error processing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('👋 Client disconnected');
        clients.delete(ws);
        if (ws === esp32Client) {
            esp32Client = null;
            console.log('🤖 ESP32 disconnected');

            // Notify all web clients that device is disconnected
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'deviceStatus',
                        deviceConnected: false
                    }));
                }
            });
        }
    });

    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
  ╔════════════════════════════════════════╗
  ║   Blynk Dashboard WebSocket Server    ║
  ╠════════════════════════════════════════╣
  ║  🌐 Server: http://localhost:${PORT}     ║
  ║  🔌 WebSocket: ws://localhost:${PORT}    ║
  ╚════════════════════════════════════════╝
  
  Waiting for connections...
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
