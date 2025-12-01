# Graphex Frontend: Project Setup

## Tech Stack

Use React 18 with TypeScript. Vite as build tool. React Router for navigation between Dashboard and Entity Viewer pages.

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "reactflow": "^11.10.0",
    "dagre": "^0.8.5",
    "react-pdf": "^7.7.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/dagre": "^0.7.52",
    "msw": "^2.0.0"
  }
}
```

## File Structure

```
src/
├── main.tsx                 # Entry point, renders App
├── App.tsx                  # Router setup
├── pages/
│   ├── Dashboard.tsx        # Library view with folders and entities
│   └── EntityViewer.tsx     # Graph + Source split view
├── components/
│   ├── retro/               # Reusable retro UI primitives
│   ├── dashboard/           # Dashboard-specific components
│   ├── graph/               # Graph canvas and node components
│   ├── source/              # PDF and Formatted viewers
│   └── layout/              # SplitView, ResizeHandle
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript interfaces
├── styles/
│   └── retro.ts             # Design tokens
├── mocks/                   # MSW handlers and mock data
└── utils/                   # Layout and geometry helpers
```

## Routes

Define two routes in App.tsx:
- `/` renders Dashboard
- `/entity/:id` renders EntityViewer

## MSW Setup

Initialize MSW in main.tsx for development. Create handlers that intercept `/api/entities`, `/api/entities/:id`, and `/api/folders` endpoints. Return mock JSON data. This allows frontend development without a backend.

## Global Styles

Import IBM Plex Mono from Google Fonts. Set box-sizing to border-box globally. Remove default margins and padding. Set selection colors to blue background with white text to match retro theme.