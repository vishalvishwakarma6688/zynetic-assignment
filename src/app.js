const express = require('express');
const cors = require('cors');
require('dotenv').config();

const telemetryRoutes = require('./routes/telemetry');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.use('/v1/telemetry', telemetryRoutes);
app.use('/v1/analytics', analyticsRoutes);

app.use((req, res) => {
    res.status(404).json({
        statusCode: 404,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: err.message
    });
});

module.exports = app;
