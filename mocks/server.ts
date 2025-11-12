/**
 * MSW Server Setup for Node.js Testing
 *
 * Configures Mock Service Worker for use in Jest tests.
 * This setup intercepts network requests in Node.js environment.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server instance for testing
 *
 * Usage in tests:
 * ```typescript
 * import { server } from '@/mocks/server';
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */
export const server = setupServer(...handlers);

/**
 * Configure server to log unhandled requests
 */
server.events.on('request:unhandled', ({ request }) => {
  console.warn(
    `[MSW] Unhandled ${request.method} request to ${request.url}. ` +
      'Consider adding a handler for this endpoint.'
  );
});
