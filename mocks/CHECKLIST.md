# MSW Setup Checklist

Use this checklist to verify your MSW setup is complete and working.

## Initial Setup

- [ ] Run `pnpm msw init public/ --save`
- [ ] Verify `public/mockServiceWorker.js` was created
- [ ] Check `.env.local` has `NEXT_PUBLIC_MSW_ENABLED=true`
- [ ] Verify `.gitignore` excludes `public/mockServiceWorker.js`

## Development Verification

- [ ] Run `pnpm dev`
- [ ] Open browser at http://localhost:3000
- [ ] Open browser DevTools Console
- [ ] Verify you see: `[MSW] Mock Service Worker started successfully`
- [ ] Check Application tab > Service Workers shows MSW worker running
- [ ] Run this in console:
  ```javascript
  fetch('http://localhost:3000/api/v1/health')
    .then(r => r.json())
    .then(console.log);
  ```
- [ ] Verify mock response with `success: true`
- [ ] Check Network tab shows requests to `/api/v1/*` (even though mocked)

## Testing Verification

- [ ] Run `pnpm test` (all tests should pass)
- [ ] Run `pnpm test __tests__/mocks/handlers.test.ts`
- [ ] Verify all handler tests pass (100+ test cases)
- [ ] Run `pnpm test __tests__/examples/msw-example.test.tsx`
- [ ] Verify example tests pass
- [ ] Check test output shows no real network requests

## File Structure Check

- [ ] `/mocks/data.ts` exists
- [ ] `/mocks/handlers.ts` exists
- [ ] `/mocks/server.ts` exists
- [ ] `/mocks/browser.ts` exists
- [ ] `/mocks/index.ts` exists
- [ ] `/mocks/README.md` exists
- [ ] `/mocks/QUICKSTART.md` exists
- [ ] `/mocks/META.md` exists
- [ ] `/__tests__/mocks/handlers.test.ts` exists
- [ ] `/__tests__/examples/msw-example.test.tsx` exists
- [ ] `/jest.config.ts` exists
- [ ] `/jest.setup.ts` exists

## Integration Check

- [ ] `app/providers.tsx` imports and initializes MSW
- [ ] MSW only runs in development mode
- [ ] App waits for MSW before rendering
- [ ] No MSW code in production bundle (verify with `pnpm build`)

## Functionality Check

Test each endpoint category:

### Documents
- [ ] POST /api/v1/documents (file upload)
- [ ] POST /api/v1/documents/from-url (URL extraction)
- [ ] GET /api/v1/documents/:id (get document)
- [ ] GET /api/v1/documents/:id/status (status polling)

### Graphs
- [ ] POST /api/v1/graphs/generate (start generation)
- [ ] GET /api/v1/graphs/:id (get graph)
- [ ] GET /api/v1/jobs/:id (job status)

### Connections
- [ ] POST /api/v1/connections/explain (get explanation)

### Quizzes
- [ ] POST /api/v1/quizzes/generate (generate quiz)
- [ ] POST /api/v1/quizzes/:id/submit (submit answers)

### Notes
- [ ] POST /api/v1/notes (create note)
- [ ] GET /api/v1/notes?graphId=:id (get notes)
- [ ] PUT /api/v1/notes/:id (update note)
- [ ] DELETE /api/v1/notes/:id (delete note)

### Health
- [ ] GET /health (basic health)
- [ ] GET /health/ready (readiness)
- [ ] GET /health/deep (deep check)

## Error Scenarios

- [ ] GET /documents/doc_notfound returns 404
- [ ] GET /documents/doc_failed/status returns failed status
- [ ] GET /graphs/graph_notfound returns 404
- [ ] POST /graphs/generate-ratelimit returns 429
- [ ] POST /connections/explain-unavailable returns 503

## Edge Cases

- [ ] Network delays are simulated (500-2000ms)
- [ ] Document status transitions: processing → ready
- [ ] Job status transitions: queued → processing → completed
- [ ] Validation errors return proper 400 responses
- [ ] All responses follow standardized format

## Performance

- [ ] Dev server starts quickly (MSW adds ~50ms)
- [ ] Tests run fast (no real network delays)
- [ ] Production build excludes MSW code
- [ ] No console errors or warnings

## Disable/Enable Toggle

- [ ] Set `NEXT_PUBLIC_MSW_ENABLED=false` in `.env.local`
- [ ] Restart dev server
- [ ] Verify no MSW logs in console
- [ ] Verify requests go to real backend (or fail if no backend)
- [ ] Set back to `NEXT_PUBLIC_MSW_ENABLED=true`
- [ ] Restart and verify MSW starts again

## Documentation

- [ ] Read `/mocks/QUICKSTART.md`
- [ ] Skim `/mocks/README.md`
- [ ] Understand `/mocks/META.md`
- [ ] Review example tests in `__tests__/examples/`

## Team Readiness

- [ ] Team knows how to enable/disable MSW
- [ ] Team knows where to find documentation
- [ ] Team knows how to add new handlers
- [ ] Team knows how to override handlers in tests
- [ ] Team knows how to use special IDs for error scenarios

## Troubleshooting Practice

If issues occur:

- [ ] Check `public/mockServiceWorker.js` exists
- [ ] Verify `NEXT_PUBLIC_MSW_ENABLED=true`
- [ ] Hard refresh browser (Cmd+Shift+R)
- [ ] Check DevTools > Application > Service Workers
- [ ] Clear browser cache and service workers
- [ ] Restart dev server
- [ ] Check console for errors
- [ ] Review `/mocks/README.md` troubleshooting section

## Completion

- [ ] All checkboxes above are checked
- [ ] MSW is working in development
- [ ] Tests pass with MSW
- [ ] Team is trained on MSW usage
- [ ] Documentation is accessible

---

**Note**: Keep this checklist in `/mocks/` for onboarding new developers.

**Last Updated**: 2025-11-11
