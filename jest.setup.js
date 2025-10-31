/**
 * Jest Setup File
 * 
 * This file runs after Jest is initialized but before tests are executed.
 * Use it for:
 * - Global test configuration
 * - Custom matchers
 * - Mock setup
 * - Test utilities
 */

// Set global test timeout to 10 seconds (10000ms)
// This prevents tests from hanging indefinitely
// Useful for async operations and API calls in tests
jest.setTimeout(10000)
