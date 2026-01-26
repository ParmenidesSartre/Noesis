import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import compression = require('compression');
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';

async function bootstrap() {
  // Create app with custom logger
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService('Bootstrap'),
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Security middleware
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    }),
  );

  // Compression middleware
  app.use(compression());

  // Enable CORS with security
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

  // Global prefix (except health checks)
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1', {
    exclude: ['health', 'health/liveness', 'health/readiness'],
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
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Global interceptors
  app.useGlobalInterceptors(new CorrelationIdInterceptor(logger));

  // Swagger documentation (only in non-production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Tuition Centre Management API')
      .setDescription(
        'API documentation for Tuition Centre Management System\n\n' +
          'All endpoints (except health checks) are prefixed with `/api/v1`',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(`http://localhost:${process.env.PORT || 3001}`, 'Local')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // Log startup information
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`❤️  Health Check: http://localhost:${port}/health`);
  logger.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Graceful shutdown handlers
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      void (async () => {
        logger.warn(`Received ${signal}, starting graceful shutdown...`);

        try {
          await app.close();
          logger.log('Application closed successfully');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', (error as Error).stack);
          process.exit(1);
        }
      })();
    });
  });

  // Uncaught exception handler
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', error.stack);
    process.exit(1);
  });

  // Unhandled rejection handler
  process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection', reason.stack);
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
