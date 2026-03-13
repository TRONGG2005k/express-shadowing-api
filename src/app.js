const express = require('express');
const routes = require('./modules');
const logger = require('./utils/logger');
const { prisma } = require('./config/prisma');
const errorHandler = require('./error/middleware/error_handler');
const { z } = require('zod');

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
app.get('/api/health', (req, res) => {
    logger.info('Health check endpoint accessed');
    res.json({ status: 'OK', message: 'Server is running' });
});
app.get('/api/hello', async (req, res) => {
    logger.info('Hello endpoint accessed');
    res.json({ status: 'OK', message: 'Hello World!' });
});
// 404 handler
app.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route not found' });
});

// Zod validation error handler
app.use((err, req, res, next) => {
    if (err instanceof z.ZodError) {
        logger.error(`Zod validation error: ${JSON.stringify(err.errors)}`);
        return res.status(400).json({
            message: 'Dữ liệu không hợp lệ',
            status: 400,
            error_code: 'E99998',
            errors: err.errors
        });
    }
    next(err);
});

// Global error handler
app.use(errorHandler);

module.exports = app;
