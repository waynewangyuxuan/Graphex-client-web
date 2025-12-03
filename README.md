# Graphex

Transform documents into interactive knowledge graphs.

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
├── api/           # Typed API layer with Zod validation
├── components/
│   ├── icons/     # Shared SVG icon components
│   ├── layout/    # App layout (Header, AppLayout)
│   ├── library/   # Dashboard components (StatsRow, EntityTable, etc.)
│   └── ui/        # Generic UI components (Dropdown)
├── hooks/         # Custom React hooks
├── mocks/         # MSW handlers and mock data
├── pages/         # Route components
├── test/          # Test setup
└── types/         # TypeScript type definitions
```

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Graph:** ReactFlow
- **PDF:** react-pdf
- **API Mocking:** MSW (Mock Service Worker)
- **Testing:** Vitest + React Testing Library
- **Validation:** Zod

## API Layer

The app uses a typed API layer (`src/api/`) with Zod schemas for runtime validation. In development, MSW intercepts requests and returns mock data.

```typescript
import { fetchEntities, fetchEntity } from '@/api';

// Returns validated EntitySummary[]
const entities = await fetchEntities();

// Returns validated KnowledgeEntity
const entity = await fetchEntity('entity-1');
```

## Environment Variables

Copy `.env.example` to `.env` for local configuration:

```bash
cp .env.example .env
```

## CI/CD

GitHub Actions runs on every push/PR:
- Type checking (`tsc --noEmit`)
- Linting (`npm run lint`)
- Tests (`npm run test:run`)
- Build (`npm run build`)

## License

Private
