import { LoggerService as NestLoggerService } from '@nestjs/common';
export declare class LoggerService implements NestLoggerService {
    private logger;
    private context?;
    constructor();
    static createWithContext(context: string): LoggerService;
    private createLogger;
    setContext(context: string): void;
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    http(message: string, meta?: Record<string, unknown>): void;
}
