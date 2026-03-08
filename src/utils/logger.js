const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(({ timestamp, level, message }) => {
            const lvl = level.toUpperCase().padEnd(5); // padding
            return `[${timestamp}] [${lvl}] ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;