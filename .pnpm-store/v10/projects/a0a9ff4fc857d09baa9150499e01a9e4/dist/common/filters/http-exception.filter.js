"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../logger/logger.service");
let HttpExceptionFilter = class HttpExceptionFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
        this.logger.setContext('HttpExceptionFilter');
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors;
        if (exception instanceof common_1.HttpException) {
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object') {
                const response = exceptionResponse;
                message = response.message || message;
                errors = response.message;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        const correlationId = request.headers['x-correlation-id'];
        const errorResponse = {
            statusCode: status,
            message,
            ...(errors && { errors }),
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            ...(correlationId && { correlationId }),
        };
        const errorMessage = `${request.method} ${request.url} - ${status} - ${exception instanceof Error ? exception.message : 'Unknown error'}`;
        if (status >= 500) {
            this.logger.error(errorMessage, exception instanceof Error ? exception.stack : undefined);
        }
        else if (status >= 400) {
            this.logger.warn(errorMessage);
        }
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map