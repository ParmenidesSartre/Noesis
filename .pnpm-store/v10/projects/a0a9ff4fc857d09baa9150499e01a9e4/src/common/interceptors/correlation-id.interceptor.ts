import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

/**
 * Correlation ID interceptor
 * Adds unique correlation ID to each request for distributed tracing
 * Useful for tracking requests across microservices
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('CorrelationIdInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Get or generate correlation ID
    const correlationId = (request.headers['x-correlation-id'] as string) || uuidv4();

    // Set correlation ID in request for downstream use
    request.headers['x-correlation-id'] = correlationId;

    // Add correlation ID to response headers
    response.setHeader('X-Correlation-Id', correlationId);

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.http(
            `${request.method} ${request.url} - ${response.statusCode} - ${duration}ms`,
            {
              correlationId,
              method: request.method,
              url: request.url,
              statusCode: response.statusCode,
              duration,
              userAgent: request.headers['user-agent'],
              ip: request.ip,
            },
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `${request.method} ${request.url} - Error: ${error.message} - ${duration}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}
