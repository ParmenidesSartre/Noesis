"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const logger_service_1 = require("./common/logger/logger.service");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const correlation_id_interceptor_1 = require("./common/interceptors/correlation-id.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: logger_service_1.LoggerService.createWithContext('Bootstrap'),
        bufferLogs: true,
    });
    const logger = app.get(logger_service_1.LoggerService);
    app.useLogger(logger);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
        crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    }));
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : [process.env.FRONTEND_URL || 'http://localhost:3000'];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
        exposedHeaders: ['X-Correlation-Id'],
    });
    app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1', {
        exclude: ['health', 'health/liveness', 'health/readiness'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(logger));
    app.useGlobalInterceptors(new correlation_id_interceptor_1.CorrelationIdInterceptor(logger));
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Tuition Centre Management API')
            .setDescription('API documentation for Tuition Centre Management System\n\n' +
            'All endpoints (except health checks) are prefixed with `/api/v1`')
            .setVersion('1.0')
            .addBearerAuth()
            .addServer(`http://localhost:${process.env.PORT || 3001}`, 'Local')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`❤️  Health Check: http://localhost:${port}/health`);
    logger.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
        process.on(signal, async () => {
            logger.warn(`Received ${signal}, starting graceful shutdown...`);
            try {
                await app.close();
                logger.log('Application closed successfully');
                process.exit(0);
            }
            catch (error) {
                logger.error('Error during graceful shutdown', error.stack);
                process.exit(1);
            }
        });
    });
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception', error.stack);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled Rejection', reason.stack);
        process.exit(1);
    });
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map