/**
 * Jest Configuration for AgroInsight
 * 
 * This file configures Jest testing framework with Next.js integration.
 * It sets up the test environment, module resolution, and coverage collection.
 */

// Import Next.js Jest configuration helper
const nextJest = require('next/jest')

// Create Jest config with Next.js defaults
// This loads next.config.js and .env files in the test environment
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Custom Jest configuration
const customJestConfig = {
  // Setup file to run after Jest is initialized
  // Used for global test configuration and custom matchers
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Use jsdom environment to simulate browser environment for React components
  testEnvironment: 'jest-environment-jsdom',
  
  // Module path aliases to match TypeScript paths
  // Maps @/* imports to root directory
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Pattern matching for test files
  // Only runs files with .test.ts or .test.tsx extension in __tests__ directory
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  
  // Files to collect coverage from
  // Includes lib and services directories, excludes type definitions and node_modules
  collectCoverageFrom: [
    'lib/**/*.ts',
    'services/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

// Export the config using createJestConfig to ensure Next.js config is loaded asynchronously
module.exports = createJestConfig(customJestConfig)
