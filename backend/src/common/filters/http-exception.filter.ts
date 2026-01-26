import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService} from '../logger/logger.service';

/**
 * Global HTTP exception filter
 * Provides consistent error responses across the application
 * Logs all errors with request context
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HttpExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get error message
    let message: string | object = 'Internal server error';
    let errors: unknown[] | undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const response = exceptionResponse as Record<string, unknown>;
        message = (response.message as string) || message;
        errors = response.message as unknown[];
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Extract request correlation ID if present
    const correlationId = request.headers['x-correlation-id'] as string;

    // Error response payload
    const errorResponse = {
      statusCode: status,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(correlationId && { correlationId }),
    };

    // Log error with context
    const errorMessage = `${request.method} ${request.url} - ${status} - ${
      exception instanceof Error ? exception.message : 'Unknown error'
    }`;

    if (status >= 500) {
      // Server errors
      this.logger.error(
        errorMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      // Client errors (4xx)
      this.logger.warn(errorMessage);
    }

    // Send response
    response.status(status).json(errorResponse);
  }
}
