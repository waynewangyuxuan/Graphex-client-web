# PROGRESS TRACKER
This tracker serves as a log of what we have accomplished. sections are separated by time(date granularity). APPEND ONLY.

---

## 2025-12-01

### Design System Decision: Retro → Paper Canvas

**Decision:** Abandoned Windows 3.1 retro aesthetic in favor of "Paper Canvas" design system.

**Rationale:** The retro style was visually interesting but "self-entertained" — optimized for novelty over usability. The new Paper Canvas design:
- Feels like a serious productivity tool
- Uses warm, paper-like aesthetics appropriate for knowledge work
- Has proper visual hierarchy and modern UX patterns
- Still maintains personality (terracotta accents, serif headings, paper textures)

**Tech Change:** Adding Tailwind CSS (utility-first) to replace inline styles and retro.ts tokens.

**Documentation Updated:**
- META/MVP/UI.md — Complete rewrite with Paper Canvas spec
- META/MVP/SETUP.md — Added Tailwind CSS, updated file structure
- META/Core/TODO.md — Added restyle task backlog

---

### Restyle Implementation Complete

**Dashboard (Paper Canvas):**
- Installed Tailwind CSS v3 with custom theme (sand/terra/accent colors)
- Added Google Fonts: Inter (UI), Lora (serif headings)
- Created `src/index.css` with paper texture utilities (paper-bg, paper-card, paper-stack)
- Rewrote Dashboard.tsx with new layout:
  - Header component with nav and user avatar
  - Stats cards row (entities, nodes, explored %, streak)
  - Collections sidebar with folder-item styling
  - Entity list with colorful avatars and tags
- Created `src/components/layout/Header.tsx`

**EntityViewer (Paper Canvas):**
- Restyled with Tailwind classes
- Basic shell with toolbar, split view placeholder, status bar

**Removed:**
- All `src/components/retro/*` components
- All `src/components/dashboard/*` (integrated into Dashboard.tsx)
- `src/styles/retro.ts` and `src/styles/global.css`

**Bug Fixes:**
- Fixed folder icon sizing (added shrink-0)
- Fixed paper-stack overflow at bottom

---

## 2025-12-02

### TypeScript & Tooling Hardening

**ESLint Configuration:**
- Created `eslint.config.js` (flat config for ESLint 9)
- Enabled `@typescript-eslint/strictTypeChecked` ruleset
- Added `no-unsafe-*` rules to catch `any` at network boundaries
- Configured React hooks and refresh plugins

**TypeScript Strictness:**
- Added 5 new compiler flags to `tsconfig.json`:
  - `noImplicitReturns` — catch missing return statements
  - `noImplicitOverride` — require `override` keyword
  - `useUnknownInCatchVariables` — `catch(e)` is `unknown` not `any`
  - `exactOptionalPropertyTypes` — stricter optional property handling
  - `noPropertyAccessFromIndexSignature` — require bracket notation for index access

**Typed API Layer:**
- Created `src/api/index.ts` with Zod runtime validation
- Full schema definitions for `Folder`, `EntitySummary`, `KnowledgeEntity`
- `ApiError` class for structured error handling
- Replaced raw `fetch().then(res.json())` with validated `fetchFolders()`, `fetchEntities()`, `fetchEntity()`

**MSW Handlers Typed:**
- Added explicit type parameters to all handlers in `src/mocks/handlers.ts`
- `EntityParams` interface for route params

**Route Guard:**
- Added `useParams` guard in `EntityViewer.tsx` — redirects to `/` if `id` is undefined

**Cleanup:**
- Deleted `demo.jsx` prototype (700 lines of untyped JS)
- Fixed `main.tsx` promise handling and null check
- Fixed `vite.config.ts` ESM `__dirname` usage

---

### Architecture Refactor

**Icons Extracted:**
- Created `src/components/icons/index.tsx` with 12 reusable icon components
- Removed ~60 lines of inline SVG from Dashboard.tsx

**Data Fetching Hooks:**
- Created `src/hooks/useAsync.ts` — generic async state hook with loading/error
- Created `src/hooks/useLibraryData.ts`:
  - `useLibraryData()` — fetches folders + entities with loading/error states
  - `useFilteredEntities()` — filters by folder and sorts by recent/name/nodes
  - `getFolderEntityCount()` — utility for folder counts

**Dashboard Decomposed:**
- Created `src/components/library/StatsRow.tsx` — stats cards row
- Created `src/components/library/CollectionsSidebar.tsx` — folder navigation
- Created `src/components/library/EntityTable.tsx` — entity list with search/sort
- Reduced `Dashboard.tsx` from 438 lines to 75 lines

**Layout with Outlet:**
- Created `src/components/layout/AppLayout.tsx` — wraps Header + Footer
- Updated `App.tsx` to use nested routes with `<Outlet />`
- Removed duplicate Header/Footer from page components

---

### Testing & CI

**Vitest Setup:**
- Installed `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- Created `vitest.config.ts` with jsdom environment
- Created `src/test/setup.ts` with MSW server for tests
- Added scripts: `test`, `test:run`, `test:coverage`

**Sample Tests:**
- Created `src/hooks/useLibraryData.test.ts` — 9 passing tests
  - Tests for `useLibraryData` hook (fetching)
  - Tests for `useFilteredEntities` (filtering, sorting)
  - Tests for `getFolderEntityCount` utility

**GitHub Actions CI:**
- Created `.github/workflows/ci.yml`
- Runs on push/PR to main and v* branches
- Pipeline: checkout → install → tsc → lint → test → build → upload artifacts

---

### Documentation

**README.md Created:**
- Quick start instructions
- Scripts table
- Project structure overview
- Tech stack summary
- API layer usage examples

**Environment:**
- Created `.env.example` template

---

### File Stats After Cleanup

| Metric | Value |
|--------|-------|
| Dashboard.tsx | 75 lines (was 438) |
| New icons module | 160 lines |
| New library components | ~300 lines |
| New hooks | ~100 lines |
| Build size | 238KB JS (73KB gzip) |
| Tests | 9 passing |
| Lint/TSC | Clean |