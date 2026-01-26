// eslint-disable-next-line @typescript-eslint/naming-convention
import * as Joi from 'joi';

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present and valid
 * Application will fail to start if validation fails
 */
export const envValidationSchema = Joi.object({
  // Node Environment
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  // Application
  PORT: Joi.number().default(3001),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database
  DATABASE_URL: Joi.string().required().description('PostgreSQL connection string'),
  DATABASE_READ_REPLICA_URL: Joi.string()
    .optional()
    .description('PostgreSQL read replica connection string (optional)'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // JWT
  JWT_SECRET: Joi.string().required().min(32).description('JWT secret key (minimum 32 characters)'),
  JWT_EXPIRATION: Joi.string().default('1d'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Frontend
  FRONTEND_URL: Joi.string().uri().required().description('Frontend application URL'),

  // Security (optional in development, required in production)
  ALLOWED_ORIGINS: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // Rate Limiting
  RATE_LIMIT_TTL: Joi.number().default(60), // seconds
  RATE_LIMIT_MAX: Joi.number().default(100), // requests per TTL

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),

  // Monitoring (optional)
  SENTRY_DSN: Joi.string().uri().optional(),
});

/**
 * Validate environment variables
 * @param config - Environment variables
 * @returns Validated configuration
 * @throws Error if validation fails
 */
export function validateEnv(config: Record<string, unknown>) {
  const { error, value } = envValidationSchema.validate(config, {
    allowUnknown: true, // Allow other env vars
    abortEarly: false, // Show all errors
  });

  if (error) {
    throw new Error(`❌ Environment validation failed:\n${error.message}`);
  }

  return value;
}
