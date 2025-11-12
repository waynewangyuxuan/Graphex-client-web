/**
 * MSW Browser Worker Setup
 *
 * Configures Mock Service Worker for use in browser development mode.
 * This setup intercepts network requests in the browser via a Service Worker.
 *
 * IMPORTANT: Before using this file, run the following command to generate
 * the service worker file:
 *
 *   pnpm msw init public/ --save
 *
 * This only needs to be done once per project.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW browser worker instance
 *
 * This worker intercepts fetch requests in the browser and responds
 * with mock data according to the configured handlers.
 */
export const worker = setupWorker(...handlers);

/**
 * Start the MSW worker with default options
 *
 * Options:
 * - onUnhandledRequest: 'warn' - Log warnings for requests without handlers
 * - quiet: false - Show MSW logs in console
 */
export async function startMockWorker() {
  if (typeof window === 'undefined') {
    // Skip in SSR/Node environment
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: 'warn',
      quiet: false,
    });

    console.log('[MSW] Mock Service Worker started successfully');
    console.log('[MSW] API requests will be intercepted and mocked');
    console.log('[MSW] To disable mocking, set NEXT_PUBLIC_MSW_ENABLED=false');
  } catch (error) {
    console.error('[MSW] Failed to start Mock Service Worker:', error);
    console.error('[MSW] Did you run "pnpm msw init public/" ?');
  }
}

/**
 * Stop the MSW worker
 */
export function stopMockWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  worker.stop();
  console.log('[MSW] Mock Service Worker stopped');
}
