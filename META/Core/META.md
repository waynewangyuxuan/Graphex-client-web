# Graphex Core Documentation Index

**Purpose**: This directory contains the foundational documentation for the Graphex knowledge graph learning platform.

---

## Overview

Graphex is an AI-assisted learning canvas that transforms documents into interactive knowledge graphs, enabling active learning through structured engagement.

**Core Philosophy**: Balance desirable difficulties (user must read, generate explanations, synthesize) with intelligent scaffolding (AI reveals structure, provides verification).

---

## Documentation Files

### [PRODUCT.md](PRODUCT.md)
**Product vision and feature specifications**

Comprehensive product design covering:
- Motivation and problem statement
- Complete feature set (12 features)
- Cognitive science rationale for each feature
- Design principles to prevent learned helplessness

**Key Features**: Adaptive graph generation, integrated reading, bidirectional relationships, enhanced note-taking, pre-explanation retrieval, multi-document synthesis, comprehension verification, spaced repetition, metacognitive scaffolding, graph customization, prior knowledge activation, collaborative learning.

---

### [MVP.md](MVP.md)
**2-week MVP implementation roadmap**

Practical prioritization focusing on the core learning loop:
- **Week 1**: Graph generation, reading interface, basic notes (Features 1-3)
- **Week 2**: Pre-explanation retrieval, comprehension checks (Features 4-5)
- Explicit feature cuts (what NOT to build)
- Timeline and success criteria
- Technical shortcuts for rapid development

**Bottom Line**: Build 5 features that create a complete, cognitive-science-grounded learning loop.

---

### [TECHNICAL.md](TECHNICAL.md)
**Web client technical architecture and implementation**

Comprehensive technical specification covering:
- **Stack**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Radix UI
- **State Management**: Zustand (UI state) + React Query (server state)
- **Architecture**: Component structure, routing, data flow patterns
- **API Integration**: REST client, polling strategies, error handling
- **Features**: Detailed implementation for upload, graph viz, notes, quiz
- **Graph Visualization**: Mermaid.js integration (MVP), React Flow (future)
- **Performance**: Code splitting, caching, bundle optimization
- **Testing**: Unit (80%), integration (15%), E2E (5%)
- **Deployment**: Vercel-based CI/CD pipeline

**Target Metrics**: <150KB initial JS, <1.5s FCP, <3s TTI

---

### [UIUX.md](UIUX.md)
**Design system and interaction patterns**

Complete UI/UX vision covering:
- **Aesthetic**: "Calm Clarity with Purposeful Engagement"
- **Color Palette**: Warm neutrals with teal/amber accents (avoiding gamification)
- **Typography**: Inter (UI) + Charter/Georgia (reading) for cognitive mode-switching
- **Layout**: 60/40 split (graph canvas / reading panel)
- **Interactions**: Micro-interactions for nodes, edges, notes, and quizzes
- **Tone**: "Knowledgeable friend" - intelligent without condescension
- **Accessibility**: WCAG AA, keyboard navigation, screen reader support
- **States**: Loading, error, and empty state patterns
- **Onboarding**: 3-step tooltip tour + sample document

**Design Principles**: Calm (not colorful), clear (not clever), smooth (not showy), spacious (not sparse), serious (not stuffy), focused (not flashy).

---

### [REGULATION.md](REGULATION.md)
**Development principles and code standards**

Core engineering practices:
1. **Atomic File Structure**: One purpose per file
2. **Atomic Code**: Small, focused functions/classes
3. **Always Test**: Comprehensive tests before moving forward
4. **Co-located Documentation**: `***_META.md` files alongside complex features
5. **Proper File Structure**: Organized folders with META.md indices
6. **Comments & Style**: Google TypeScript style, explain WHY not WHAT
7. **Iteration Awareness**: Clean up old code immediately, avoid redundancy

**Enforcement**: Code review checklist, integration with Claude agents

---

### [PROGRESS.md](PROGRESS.md)
**Development progress tracker**

Append-only log of completed work:
- Date-stamped entries (daily granularity)
- Tracks features implemented, components created, tests written
- Includes code statistics and completion percentages
- Documents what was delivered each session

**Use**: Historical record, handoff documentation, status updates

---

### [TODO.md](TODO.md)
**Next steps and action items**

Append-only list of upcoming work:
- Prioritized by urgency (Immediate, Nice-to-Have, Future)
- Organized by category (Integration, Testing, Polish, Technical Debt)
- Includes known issues and ideas for consideration
- Clear actionable tasks with checkboxes

**Use**: Sprint planning, development roadmap, issue tracking

---

## Quick Navigation by Role

### Product/Design
- Start: [PRODUCT.md](PRODUCT.md) � [UIUX.md](UIUX.md)
- For MVP scope: [MVP.md](MVP.md)

### Engineering
- Start: [TECHNICAL.md](TECHNICAL.md) � [REGULATION.md](REGULATION.md)
- For MVP priorities: [MVP.md](MVP.md)

### Project Management
- Start: [MVP.md](MVP.md) � [PRODUCT.md](PRODUCT.md)
- For standards: [REGULATION.md](REGULATION.md)

---

## Key Insights Across Documents

**From Problem to Solution**:
- **Problem**: Passive reading creates fluency illusion without true comprehension
- **Solution**: Active graph-based learning with pre-explanation retrieval and testing
- **MVP Strategy**: Focus on core loop (graph � read � note � test) before expansion
- **Technical Approach**: Modern React stack optimized for developer velocity
- **Design Language**: Professional, calm aesthetic that signals serious learning
- **Code Quality**: Atomic structure with comprehensive testing and documentation

---

## Document Status

| File | Version | Last Updated | Status |
|------|---------|--------------|--------|
| PRODUCT.md | 1.0 | 2025-11-11 | Complete |
| MVP.md | 1.0 | 2025-11-11 | Complete |
| TECHNICAL.md | 1.0 | 2025-11-11 | Complete |
| UIUX.md | 1.1 | 2025-01-12 | Updated (Colorful design) |
| REGULATION.md | 1.0 | 2025-11-11 | Complete |
| PROGRESS.md | Live | 2025-01-12 | Active tracking |
| TODO.md | Live | 2025-01-12 | Active tracking |

---

**Current Status**: 🎉 **All MVP features (1-5) are complete and production-ready!** See PROGRESS.md for details.

**Next Steps**: Review TODO.md for integration tasks, then test complete user flow end-to-end.
