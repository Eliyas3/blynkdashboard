const mqtt = require('mqtt');
const { query } = require('../database/connection');
const { broadcastToWebSocket } = require('../websocket/server');

let mqttClient = null;

async function startMQTTClient() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

    mqttClient = mqtt.connect(brokerUrl, {
        clientId: process.env.MQTT_CLIENT_ID || 'blynk-backend',
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        clean: true,
        reconnectPeriod: 5000
    });

    mqttClient.on('connect', () => {
        console.log('✅ MQTT Client connected to broker');

        // Subscribe to all device topics
        mqttClient.subscribe('devices/+/data', (err) => {
            if (err) {
                console.error('❌ Failed to subscribe to devices/+/data:', err);
            } else {
                console.log('📡 Subscribed to: devices/+/data');
            }
        });

        mqttClient.subscribe('devices/+/status', (err) => {
            if (err) {
                console.error('❌ Failed to subscribe to devices/+/status:', err);
            } else {
                console.log('📡 Subscribed to: devices/+/status');
            }
        });
    });

    mqttClient.on('message', async (topic, message) => {
        try {
            await handleMQTTMessage(topic, message);
        } catch (error) {
            console.error('❌ Error handling MQTT message:', error);
        }
    });

    mqttClient.on('error', (error) => {
        console.error('❌ MQTT Error:', error);
    });

    mqttClient.on('offline', () => {
        console.log('⚠️  MQTT Client offline');
    });

    return mqttClient;
}

async function handleMQTTMessage(topic, message) {
    const parts = topic.split('/');
    const deviceAuthToken = parts[1];
    const messageType = parts[2]; // 'data' or 'status'

    try {
        const data = JSON.parse(message.toString());

        // Verify device exists
        const deviceResult = await query(
            'SELECT id, user_id FROM devices WHERE auth_token = $1',
            [deviceAuthToken]
        );

        if (deviceResult.rows.length === 0) {
            console.log(`⚠️  Unknown device: ${deviceAuthToken}`);
            return;
        }

        const device = deviceResult.rows[0];

        if (messageType === 'data') {
            await handleDataMessage(device, data);
        } else if (messageType === 'status') {
            await handleStatusMessage(device, data);
        }

    } catch (error) {
        console.error('Error processing message:', error);
    }
}

async function handleDataMessage(device, data) {
    // data format: { "V0": 25.5, "V1": 60.2 }
    const timestamp = new Date();

    // Save to database
    const values = Object.entries(data).map(([pin, value], index) => {
        const offset = index * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
    }).join(',');

    const params = [];
    Object.entries(data).forEach(([pin, value]) => {
        params.push(timestamp, device.id, pin, parseFloat(value));
    });

    if (values) {
        await query(
            `INSERT INTO sensor_data (time, device_id, pin, value) 
             VALUES ${values}`,
            params.filter((_, i) => i % 4 !== 3).concat(params.filter((_, i) => i % 4 === 3))
        );
    }

    // Update device last_seen
    await query(
        'UPDATE devices SET last_seen = NOW(), status = $1 WHERE id = $2',
        ['online', device.id]
    );

    // Broadcast to WebSocket clients
    broadcastToWebSocket(device.user_id, {
        type: 'sensor_data',
        deviceId: device.id,
        data,
        timestamp
    });

    console.log(`📊 Data saved for device ${device.id}`);
}

async function handleStatusMessage(device, data) {
    // data format: { "status": "online", "ip": "192.168.1.100" }
    await query(
        'UPDATE devices SET status = $1, last_seen = NOW(), ip_address = $2 WHERE id = $3',
        [data.status, data.ip || null, device.id]
    );

    broadcastToWebSocket(device.user_id, {
        type: 'device_status',
        deviceId: device.id,
        status: data.status
    });
}

// Send command to device
function sendCommand(deviceAuthToken, command) {
    const topic = `devices/${deviceAuthToken}/command`;
    mqttClient.publish(topic, JSON.stringify(command));
}

module.exports = {
    startMQTTClient,
    sendCommand
};
