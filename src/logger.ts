import * as winston from 'winston'
import 'winston-daily-rotate-file'
import * as path from 'path';

// Clear all logs
const LOGS_DIR: string = process.env.LOGS_DIR || path.join(__dirname, 'logs');

const defaultLogTransport = new winston.transports.DailyRotateFile({
    dirname: LOGS_DIR,
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',

    maxFiles: '14d',
    maxSize: '20m',

    utc: true,
    level: 'debug',
    auditFile: 'logs/audit.json'
});

const errorLogTransport = new winston.transports.DailyRotateFile({
    dirname: LOGS_DIR,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',

    maxFiles: '14d',
    maxSize: '20m',

    utc: true,
    level: 'error',
    auditFile: 'logs/error_audit.json'
});

const customFormat = winston.format.printf(({timestamp, level, message, stack}) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});


// Create the logger
export const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack: true}),
        customFormat
    ),
    defaultMeta: {service: "app"},
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({
                    format: 'HH:mm:ss.SSS A',
                }),
                winston.format.errors({stack: true}),
                customFormat
            )
        }),
        defaultLogTransport,
        errorLogTransport,
    ],
})