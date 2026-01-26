/**
 * E2E Test Setup
 *
 * This file runs before all E2E tests
 * Sets up test environment, database, and global test utilities
 */

// Increase timeout for E2E tests
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Add any global setup here
  console.log('🧪 Starting E2E test suite...');
});

// Global test teardown
afterAll(async () => {
  // Add any global cleanup here
  console.log('✅ E2E test suite completed');
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_characters_for_testing';
process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests
