# Claude Agent Workflow Guide

**Purpose**: Guide for implementing Graphex using core documentation and specialized sub-agents.

---

## Quick Start

**For any task:**
1. Read relevant docs in `/META/Core/` (see below)
2. Follow [REGULATION.md](/META/Core/REGULATION.md) principles (atomic structure, test first, clean code)
3. Use specialized sub-agents for implementation

---

## Core Documentation

| File | When to Read | Key Contents |
|------|--------------|--------------|
| [META.md](/META/Core/META.md) | **Start here** | Project overview, doc navigation, status |
| [MVP.md](/META/Core/MVP.md) | **Before any feature** | 2-week sprint plan, priorities, feature cuts |
| [TECHNICAL.md](/META/Core/TECHNICAL.md) | **Before coding** | Stack (Next.js, React Query, Zustand), architecture, file structure |
| [UIUX.md](/META/Core/UIUX.md) | **Before UI work** | Design system, colors, interactions, accessibility |
| [REGULATION.md](/META/Core/REGULATION.md) | **Before coding** | 7 dev principles, code standards, review checklist |
| [PRODUCT.md](/META/Core/PRODUCT.md) | Reference only | Full vision, cognitive science rationale |
| [PROGRESS.md](/META/Core/PROGRESS.md) | **Check status** | What's been completed, code stats, feature delivery |
| [TODO.md](/META/Core/TODO.md) | **Next tasks** | Integration steps, testing, polish, future features |

**Key Insights:**
- **MVP Status**: ✅ All 5 features complete! (graph → read → note → explain → test)
- **Stack**: Next.js 14 App Router, TypeScript, Tailwind, Radix UI, Zustand (UI state), React Query (server state)
- **Testing**: 80% unit, 15% integration, 5% E2E
- **Design**: Vibrant, colorful with light blue foundation - "Colorful Clarity for Enhanced Cognition"
- **Code**: ~23,000 lines across 40+ components, all production-ready

---

## Sub-Agent Directory

**When to use**: Features from scratch, refactoring, tests, state design, UI components
**When NOT to use**: Simple reads/searches, trivial edits, quick doc updates

### 1. nextjs-app-router-architect
**Use for**: Pages, routing, layouts, metadata, server/client boundaries
**Example**: "Create `/graph/[graphId]` page with loading states"

### 2. api-integration-specialist
**Use for**: React Query hooks, Axios config, polling, mutations, error handling
**Example**: "Create useUploadDocument mutation with progress tracking"

### 3. state-management-architect
**Use for**: Zustand stores, React Query cache, optimistic updates, state coordination
**Example**: "Create Zustand store for graph interaction state"
**Remember**: Zustand = UI state, React Query = server state

### 4. ui-component-builder
**Use for**: Tailwind components, Radix UI, animations, accessibility, design system
**Example**: "Build note modal with Radix Dialog following UIUX.md"

### 5. form-architect
**Use for**: React Hook Form, Zod validation, file uploads, error display
**Example**: "Build file upload form with react-dropzone, validation (PDF/TXT/MD, <10MB)"

### 6. mermaid-graph-controller
**Use for**: Mermaid.js rendering, SVG events, graph interactions, node highlighting
**Example**: "Render graph and attach click handlers, sync with reading panel"

### 7. frontend-test-engineer
**Use for**: Jest, RTL, MSW, unit/integration/E2E tests, coverage analysis
**Example**: "Write tests for DocumentUploadButton with MSW mocking"

### 8. Explore
**Use for**: Codebase exploration, understanding patterns across files
**Example**: "How is error handling implemented across components?"
**Don't use for**: Specific file/keyword searches (use Glob/Grep instead)

---

## Implementation Workflow

### Standard Process
1. **Understand**: Read MVP.md (priorities), TECHNICAL.md (patterns), REGULATION.md (standards)
2. **Plan**: Break into atomic tasks, identify file structure, choose state approach
3. **Invoke Agents**: Use specialized agents (run in parallel when possible)
4. **Follow Up**: Review against REGULATION.md, ensure tests exist, verify accessibility

### Example: "Implement document upload"
```typescript
// Step 1: Read MVP.md Feature 1, TECHNICAL.md Section 7.1, UIUX.md dropzone

// Step 2: Plan files
// - app/page.tsx, components/upload/FileUploader.tsx, hooks/useUpload.ts

// Step 3: Invoke agents in parallel
Task(subagent_type: "nextjs-app-router-architect",
     prompt: "Create upload page at app/page.tsx")
Task(subagent_type: "form-architect",
     prompt: "Build FileUploader with react-dropzone, validation")
Task(subagent_type: "api-integration-specialist",
     prompt: "Create useUploadDocument mutation with progress")
Task(subagent_type: "ui-component-builder",
     prompt: "Build UploadProgress component per UIUX.md")

// Step 4: Test and review
Task(subagent_type: "frontend-test-engineer",
     prompt: "Write tests for FileUploader with MSW")
```

---

## Common Patterns

**New Feature**:
1. Check MVP.md (in scope?) → TECHNICAL.md (architecture) → Plan structure
2. Invoke: nextjs-app-router-architect → api-integration-specialist → state-management-architect → ui-component-builder → form-architect → frontend-test-engineer
3. Create feature META.md if complex

**Bug Fix**:
1. Understand → Fix (use Explore if complex) → Add regression test → Clean up

**Refactoring**:
1. Ensure tests exist → Refactor → Run tests → Clean old code → Update docs

**Code Review**:
1. Check REGULATION.md → Verify test coverage → Check accessibility → Verify TECHNICAL.md patterns → Ensure UIUX.md compliance

---

## Agent Invocation Syntax

```typescript
// Routes/pages
Task(subagent_type: "nextjs-app-router-architect", prompt: "...")

// API/data fetching
Task(subagent_type: "api-integration-specialist", prompt: "...")

// State management
Task(subagent_type: "state-management-architect", prompt: "...")

// UI components
Task(subagent_type: "ui-component-builder", prompt: "...")

// Forms
Task(subagent_type: "form-architect", prompt: "...")

// Graph visualization
Task(subagent_type: "mermaid-graph-controller", prompt: "...")

// Testing
Task(subagent_type: "frontend-test-engineer", prompt: "...")

// Exploration
Task(subagent_type: "Explore", prompt: "...", thoroughness: "medium")
```

---

## Critical Rules

### Always
✅ Read MVP.md first (know priorities)
✅ Follow TECHNICAL.md patterns (consistent architecture)
✅ Adhere to REGULATION.md (atomic structure, test first, clean code)
✅ Match UIUX.md design (colors, spacing, interactions)
✅ Test comprehensively (80% unit coverage)
✅ Use sub-agents proactively (leverage expertise)

### Never
❌ Build features not in MVP.md without approval
❌ Skip tests
❌ Create multi-purpose files
❌ Leave commented code or unused imports
❌ Ignore TECHNICAL.md architecture
❌ Deviate from UIUX.md design system

---

## Questions?

1. Re-read relevant /META/Core/ sections
2. Check MVP.md for explicit guidance
3. Ask user for clarification if still unclear
4. Document decisions in appropriate META.md

---

---

## Current Status (2025-01-12)

### ✅ Completed
- **Infrastructure**: All hooks, API client, MSW mock server
- **Design System**: Colorful with light blue foundation (updated from warm neutrals)
- **UI Library**: 10 base components (Button, Card, Dialog, Input, etc.)
- **Feature 1**: Document upload & colorful graph visualization
- **Feature 2**: Reading panel with graph-to-text sync
- **Feature 3**: Node notes with auto-save
- **Feature 4**: Pre-explanation retrieval (hypothesis → AI explanation)
- **Feature 5**: Quiz with comprehension checks

### 🚀 Next Steps
See [TODO.md](/META/Core/TODO.md) for:
1. MSW setup and verification
2. Component integration and wiring
3. End-to-end testing
4. Performance optimization

---

**Version**: 1.1 | **Updated**: 2025-01-12 | **Related**: [/META/Core/META.md](/META/Core/META.md)
