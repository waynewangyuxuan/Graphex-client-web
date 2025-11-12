# MSW Quick Start Guide

Get up and running with Mock Service Worker in 3 steps:

## Step 1: Initialize MSW Service Worker

Run this command **once** to generate the service worker file:

```bash
pnpm msw init public/ --save
```

This creates `public/mockServiceWorker.js` (already in `.gitignore`).

## Step 2: Verify Configuration

Check that `.env.local` has MSW enabled:

```bash
NEXT_PUBLIC_MSW_ENABLED=true
```

## Step 3: Start Development

```bash
pnpm dev
```

You should see in the browser console:

```
[MSW] Mock Service Worker started successfully
[MSW] API requests will be intercepted and mocked
```

## You're Done!

All API requests to `http://localhost:3000/api/v1/*` will now be mocked.

## Quick Test

Try this in your browser console while the dev server is running:

```javascript
fetch('http://localhost:3000/api/v1/health')
  .then(r => r.json())
  .then(console.log);

// Expected output:
// {
//   success: true,
//   data: { status: 'ok', timestamp: '...' },
//   meta: { timestamp: '...', requestId: '...' }
// }
```

## Disable Mocking

To use the real backend instead:

```bash
# In .env.local
NEXT_PUBLIC_MSW_ENABLED=false
```

Then restart the dev server.

## Troubleshooting

**Problem:** No MSW logs in console

**Solution:**
1. Ensure `pnpm msw init public/` was run
2. Check `public/mockServiceWorker.js` exists
3. Verify `NEXT_PUBLIC_MSW_ENABLED=true` in `.env.local`
4. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
5. Check browser DevTools > Application > Service Workers

**Problem:** Tests failing

**Solution:**
1. Check `jest.config.ts` and `jest.setup.ts` exist
2. Verify imports: `import { server } from '@/mocks/server'`
3. Ensure `beforeAll(() => server.listen())` in test file

## Next Steps

- Read [README.md](./README.md) for complete documentation
- Check [handlers.ts](./handlers.ts) to see all available endpoints
- Browse [data.ts](./data.ts) for mock data structure
- Run tests: `pnpm test`

## Support

If you encounter issues:
1. Check the [README.md](./README.md) troubleshooting section
2. Review [MSW documentation](https://mswjs.io/)
3. Ask the team in #dev-frontend

---

**Version:** 1.0
**Last Updated:** 2025-11-11
