# TODO TRACKER
This tracker serves as a log of what we need to do in the next iteration of development. sections are separated by time(date granularity). APPEND ONLY.
## 2025-01-12 - Post-MVP Implementation

### 🚀 Immediate Next Steps (Before Launch)

#### 1. MSW Setup & Verification
- [x] Run `pnpm msw init public/ --save` to generate service worker
- [x] Verify MSW starts correctly in development mode
- [x] Test all API endpoints with MSW mocking

#### 2. Integration & Wiring
- [x] Wire up all event handlers in graph view page
- [x] Add node interaction tracking for quiz trigger
- [x] Integrate NoteModal, ConnectionModal, QuizModal with graph

#### 3. Testing & QA
- [ ] Fix Jest + MSW ESM configuration
- [ ] Manual test complete user flow
- [ ] Test responsive design and accessibility

#### 4. Performance & Polish
- [ ] Test graph rendering with 15+ nodes
- [ ] Optimize bundle size
- [ ] Add loading skeletons

## 2025-11-15 - Upload Flow & Processing Page

### ✅ Completed Today

#### Bug Fixes
- [x] Fixed `DocumentUploadResponse` type definition (flat → nested structure)
- [x] Fixed MSW base URL configuration (now uses `NEXT_PUBLIC_API_URL`)
- [x] Enabled MSW for development (`NEXT_PUBLIC_MSW_ENABLED=true`)
- [x] Resolved duplicate toast issue on upload

#### New Features
- [x] Created `/processing` page with status polling
- [x] Implemented progress tracking with stage-based messages
- [x] Added automatic redirect to graph page when ready
- [x] Implemented comprehensive error handling
- [x] Added loading and error boundary components

### 🚧 In Progress

#### End-to-End Flow
- [x] Upload page → Processing page flow working
- [ ] Processing page → Graph page flow (requires graph page update)
- [ ] Complete user journey testing

### 📋 Next Tasks

#### Graph Page Integration
- [ ] Ensure graph page accepts document ID parameter
- [ ] Test redirect from processing page to graph page
- [ ] Verify graph data loads correctly from document

#### Testing & Validation
- [ ] Manual test: Upload → Processing → Graph flow
- [ ] Test error scenarios (failed processing, network errors)
- [ ] Verify MSW mocking works for all endpoints
- [ ] Test with real backend (set `NEXT_PUBLIC_MSW_ENABLED=false`)

### 🎨 Nice-to-Have Improvements

- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Note export (markdown)
- [ ] Graph search/filter

### 🚀 Post-MVP Features (Week 3+)

- [ ] Connection Notes (Feature 6)
- [ ] Multiple documents
- [ ] Spaced repetition
- [ ] Collaborative features

