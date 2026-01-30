import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private logger = new WinstonLoggerService();

    constructor() {
        this.logger.setContext('HttpExceptionFilter');
    }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message:
                typeof message === 'string'
                    ? message
                    : (message as any).message || message,
            ...(process.env.NODE_ENV === 'development' &&
                exception instanceof Error && {
                stack: exception.stack,
            }),
        };

        this.logger.error(
            `HTTP ${status} Error: ${JSON.stringify(errorResponse)}`,
            exception instanceof Error ? exception.stack : String(exception),
        );

        response.status(status).json(errorResponse);
    }
}
