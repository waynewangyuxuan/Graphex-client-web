/**
 * Jest Setup File
 *
 * Runs before all tests to configure the test environment.
 * Includes MSW server setup for API mocking.
 *
 * Note: Polyfills are set up in jest.polyfills.js which runs before this file.
 */

import '@testing-library/jest-dom';

// Conditionally import and setup MSW (only for API tests)
// Skip MSW setup if running non-API tests to avoid ES module issues
const USE_MSW = process.env.USE_MSW !== 'false';

if (USE_MSW) {
  try {
    const { server } = require('@/mocks/server');

    // Enable API mocking with MSW before all tests
    beforeAll(() => {
      server.listen({
        onUnhandledRequest: 'warn',
      });
    });

    // Reset handlers after each test to prevent test pollution
    afterEach(() => {
      server.resetHandlers();
    });

    // Clean up after all tests
    afterAll(() => {
      server.close();
    });
  } catch (error) {
    console.warn('MSW server not available, skipping API mocking setup');
  }
}

// Suppress console errors in tests (optional - remove if you want to see errors)
// global.console.error = jest.fn();

// Mock window.matchMedia (required for components using media queries)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver (required for components using intersection observer)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver (required for components using resize observer)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
