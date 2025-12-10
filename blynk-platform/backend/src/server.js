const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./api/auth');
const deviceRoutes = require('./api/devices');
const templateRoutes = require('./api/templates');
const datastreamRoutes = require('./api/datastreams');
const dataRoutes = require('./api/data');
const automationRoutes = require('./api/automation');
const notificationRoutes = require('./api/notifications');

const { initializeDatabase } = require('./database/connection');
const { startMQTTClient } = require('./mqtt/client');
const { startWebSocketServer } = require('./websocket/server');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// MIDDLEWARE
// ===========================================

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`, req.body);
        next();
    });
}

// ===========================================
// ROUTES
// ===========================================

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/datastreams', datastreamRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/notifications', notificationRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ===========================================
// STARTUP
// ===========================================

async function startServer() {
    try {
        // Initialize database
        console.log('🔌 Connecting to database...');
        await initializeDatabase();
        console.log('✅ Database connected');

        // Start MQTT client
        console.log('📡 Connecting to MQTT broker...');
        await startMQTTClient();
        console.log('✅ MQTT connected');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n╔═══════════════════════════════════╗`);
            console.log(`║  Blynk IoT Platform - Backend    ║`);
            console.log(`╚═══════════════════════════════════╝`);
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 API: http://localhost:${PORT}/api`);
            console.log(`💚 Health: http://localhost:${PORT}/health\n`);
        });

        // Start WebSocket server
        console.log('🔀 Starting WebSocket server...');
        await startWebSocketServer();
        console.log('✅ WebSocket server ready\n');

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

startServer();

module.exports = app;
