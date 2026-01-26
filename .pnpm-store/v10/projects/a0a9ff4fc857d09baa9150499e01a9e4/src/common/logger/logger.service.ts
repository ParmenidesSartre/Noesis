import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import dailyRotateFile from 'winston-daily-rotate-file';

/**
 * Custom logger service using Winston
 * Provides structured logging with daily file rotation
 * Replaces console.log with proper logging
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    this.logger = this.createLogger();
  }

  /**
   * Create a logger with an initial context for manual instantiation
   */
  static createWithContext(context: string): LoggerService {
    const logger = new LoggerService();
    logger.setContext(context);
    return logger;
  }

  /**
   * Create Winston logger instance
   */
  private createLogger(): winston.Logger {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL || 'info';

    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, context, trace }: winston.Logform.TransformableInfo) => {
        const contextStr = context ? ` [${String(context)}]` : '';
        const traceStr = trace ? `\n${String(trace)}` : '';
        return `${String(timestamp)} ${String(level)}${contextStr}: ${String(message)}${traceStr}`;
      }),
    );

    const transports: winston.transport[] = [];

    // Console transport (always)
    transports.push(
      new winston.transports.Console({
        format: isProduction ? logFormat : consoleFormat,
        level: logLevel,
      }),
    );

    // File transports (production only or if explicitly enabled)
    if (isProduction || process.env.ENABLE_FILE_LOGS === 'true') {
      // Error logs
      transports.push(
        new dailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
        }),
      );

      // Combined logs
      transports.push(
        new dailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
        }),
      );
    }

    return winston.createLogger({
      level: logLevel,
      format: logFormat,
      transports,
      exitOnError: false,
    });
  }

  /**
   * Set context for subsequent log messages
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Log message
   */
  log(message: string, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }

  /**
   * Log error message
   */
  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
  }

  /**
   * Log verbose message
   */
  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  /**
   * Log HTTP request
   */
  http(message: string, meta?: Record<string, unknown>): void {
    this.logger.http(message, { ...meta, context: this.context });
  }
}
