# TODO TRACKER
This tracker serves as a log of what we need to do in the next iteration of development. sections are separated by time(date granularity). APPEND ONLY.
## 2025-01-12 - Post-MVP Implementation

### 🚀 Immediate Next Steps (Before Launch)

#### 1. MSW Setup & Verification
- [ ] Run `pnpm msw init public/ --save` to generate service worker
- [ ] Verify MSW starts correctly in development mode
- [ ] Test all API endpoints with MSW mocking

#### 2. Integration & Wiring
- [ ] Wire up all event handlers in graph view page
- [ ] Add node interaction tracking for quiz trigger
- [ ] Integrate NoteModal, ConnectionModal, QuizModal with graph

#### 3. Testing & QA
- [ ] Fix Jest + MSW ESM configuration
- [ ] Manual test complete user flow
- [ ] Test responsive design and accessibility

#### 4. Performance & Polish
- [ ] Test graph rendering with 15+ nodes
- [ ] Optimize bundle size
- [ ] Add loading skeletons

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

