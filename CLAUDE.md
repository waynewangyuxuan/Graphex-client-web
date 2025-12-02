# CLAUDE.md

Ultra guide for AI-assisted implementation of Graphex.

---

## Quick Start

1. **Read the META index first:** [META/META.md](META/META.md)
2. **Understand the product:** [META/Core/PRODUCT.md](META/Core/PRODUCT.md)
3. **Follow development standards:** [META/Core/REGULATION.md](META/Core/REGULATION.md)

---

## Documentation Hierarchy

```
META/
├── META.md              <- Start here (root index)
├── Core/                <- SOURCE OF TRUTH (stable)
│   ├── PRODUCT.md       <- What we're building
│   ├── MVP.md           <- What's in scope
│   ├── REGULATION.md    <- How to write code
│   ├── TODO.md          <- Task backlog
│   └── PROGRESS.md      <- What's done
└── MVP/                 <- DEV SPECS (changes often)
    ├── SETUP.md         <- Tech stack, structure
    ├── DATA.md          <- TypeScript interfaces
    ├── UI.md            <- Design system
    ├── DATA-SAMPLE.md   <- Mock data
    └── PAGE/            <- Page implementations
```

---

## Before Writing Code

1. Check [META/Core/TODO.md](META/Core/TODO.md) for current tasks
2. Read relevant specs in [META/MVP/](META/MVP/)
3. Follow atomicity principle - one purpose per file/function

---

## Key Principles

- **Atomic files:** Each file has a single responsibility
- **Atomic code:** Each function does one thing well
- **Co-located docs:** Complex features get a `.md` file alongside them

---

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (utility-first styling)
- React Router
- ReactFlow (graph)
- react-pdf (PDF viewing)
- MSW (mock API)

---

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run linter
```

---

## Git Workflow

- **Commit frequently** - after each meaningful change
- **Push often** - don't let commits pile up locally
- **Concise messages** - keep it short and descriptive

```bash
git add . && git commit -m "add paper card component" && git push
```
