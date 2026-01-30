import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonLoggerService } from '@shared/logger/winston-logger.service';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });

    // Logger personalizado con Winston
    const logger = app.get(WinstonLoggerService);
    app.useLogger(logger);

    // Global prefix
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(apiPrefix);

    // API Versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });

    // Global pipes
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global interceptors
    app.useGlobalInterceptors(new TransformInterceptor());

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('API Solicitud de Tarjeta de Crédito')
        .setDescription(
            'API REST para la gestión de solicitudes de tarjetas de crédito digitales - Banco BCS',
        )
        .setVersion('1.0')
        .addTag('solicitudes', 'Gestión de solicitudes de tarjetas de crédito')
        .addTag('integracion-core', 'Integración con Core Bancario')
        .addTag('health', 'Health checks y monitoring')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
