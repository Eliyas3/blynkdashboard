const WebSocket = require('ws');

let wss = null;
const clients = new Map(); // userId → WebSocket connection

function startWebSocketServer() {
    const port = parseInt(process.env.WS_PORT) || 8080;

    wss = new WebSocket.Server({ port });

    wss.on('connection', (ws, req) => {
        console.log('🔗 New WebSocket connection');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                handleWebSocketMessage(ws, data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        ws.on('close', () => {
            // Remove from clients map
            for (const [userId, client] of clients.entries()) {
                if (client === ws) {
                    clients.delete(userId);
                    console.log(`🔌 User ${userId} disconnected`);
                    break;
                }
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    console.log(`✅ WebSocket server listening on port ${port}`);
    return wss;
}

function handleWebSocketMessage(ws, data) {
    const { type, userId } = data;

    if (type === 'subscribe' && userId) {
        // Register this WebSocket connection for the user
        clients.set(userId, ws);
        console.log(`📬 User ${userId} subscribed to updates`);

        ws.send(JSON.stringify({
            type: 'subscribed',
            message: 'Successfully subscribed to updates'
        }));
    }
}

function broadcastToWebSocket(userId, data) {
    const ws = clients.get(userId);

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function broadcastToAll(data) {
    clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    });
}

module.exports = {
    startWebSocketServer,
    broadcastToWebSocket,
    broadcastToAll
};
