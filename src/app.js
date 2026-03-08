const express = require('express');
const routes = require('./modules');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});
// Mount all routes with /api prefix
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
    logger.info('Health check endpoint accessed');
    res.json({ status: 'OK', message: 'Server is running' });
});
app.get('/hello', (req, res) => {
    logger.info('Hello endpoint accessed');
    res.json({ status: 'OK', message: 'Hello World!' });
});
// 404 handler
app.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Internal server error: ' + err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;
