import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonLoggerService implements LoggerService {
    private logger: winston.Logger;
    private context?: string;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.json(),
            ),
            defaultMeta: { service: 'tarjeta-credito-api' },
            transports: [
                // Console transport
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                            const contextStr = context ? `[${context}]` : '';
                            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                            return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
                        }),
                    ),
                }),
            ],
        });

        // Add file transport if enabled
        if (process.env.LOG_FILE_ENABLED === 'true') {
            this.logger.add(
                new DailyRotateFile({
                    dirname: 'logs',
                    filename: 'app-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: process.env.LOG_FILE_MAX_SIZE || '20m',
                    maxFiles: process.env.LOG_FILE_MAX_FILES || '14d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json(),
                    ),
                }),
            );
        }
    }

    setContext(context: string) {
        this.context = context;
    }

    log(message: any, context?: string) {
        this.logger.info(message, { context: context || this.context });
    }

    error(message: any, trace?: string, context?: string) {
        this.logger.error(message, {
            trace,
            context: context || this.context,
        });
    }

    warn(message: any, context?: string) {
        this.logger.warn(message, { context: context || this.context });
    }

    debug(message: any, context?: string) {
        this.logger.debug(message, { context: context || this.context });
    }

    verbose(message: any, context?: string) {
        this.logger.verbose(message, { context: context || this.context });
    }
}
