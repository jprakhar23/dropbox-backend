const express = require('express');
const cors = require('cors');
const path = require('path');

const config = require('./config');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const healthRoutes = require('./routes/health');
const fileRoutes = require('./routes/files');

const { initializeDatabase } = require('./database');

const app = express();

app.use(cors(config.cors));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(logger);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/health', healthRoutes);
app.use('/api/files', fileRoutes);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

app.use(errorHandler);

const startServer = async () => {
    try {
        await initializeDatabase();
        console.log('Database initialized successfully');

        app.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
            console.log(`Frontend URL: ${config.cors.origin}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

startServer();

module.exports = app;