"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
exports.validateEnv = validateEnv;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3001),
    API_PREFIX: Joi.string().default('api/v1'),
    DATABASE_URL: Joi.string().required().description('PostgreSQL connection string'),
    DATABASE_READ_REPLICA_URL: Joi.string()
        .optional()
        .description('PostgreSQL read replica connection string (optional)'),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    JWT_SECRET: Joi.string().required().min(32).description('JWT secret key (minimum 32 characters)'),
    JWT_EXPIRATION: Joi.string().default('1d'),
    JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
    FRONTEND_URL: Joi.string().uri().required().description('Frontend application URL'),
    ALLOWED_ORIGINS: Joi.string().when('NODE_ENV', {
        is: 'production',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    RATE_LIMIT_TTL: Joi.number().default(60),
    RATE_LIMIT_MAX: Joi.number().default(100),
    LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
        .default('info'),
    SENTRY_DSN: Joi.string().uri().optional(),
});
function validateEnv(config) {
    const { error, value } = exports.envValidationSchema.validate(config, {
        allowUnknown: true,
        abortEarly: false,
    });
    if (error) {
        throw new Error(`❌ Environment validation failed:\n${error.message}`);
    }
    return value;
}
//# sourceMappingURL=env.validation.js.map