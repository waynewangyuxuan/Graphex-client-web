# Graphex Frontend: Project Setup

## Tech Stack

- React 18 with TypeScript
- Vite as build tool
- Tailwind CSS for styling (utility-first)
- React Router for navigation

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
    "msw": "^2.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

## Tailwind Configuration

Custom theme extending default with Paper Canvas colors:

```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FDFBF7',
          100: '#FAF6EF',
          200: '#F3EBE0',
          300: '#E6D9C6',
          400: '#C9B89A',
          500: '#A89274',
          600: '#8B7355',
          700: '#6B5A45',
          800: '#4A3F32',
          900: '#2D261E',
        },
        terra: {
          400: '#E07B5A',
          500: '#C96442',
          600: '#B54D2E',
          700: '#8B3A22',
        },
        accent: {
          400: '#2D9B8A',
          500: '#0F766E',
          600: '#0C5D58',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
    }
  }
}
```

## File Structure

```
src/
├── main.tsx                 # Entry point, renders App
├── App.tsx                  # Router setup
├── index.css                # Tailwind directives + custom utilities
├── pages/
│   ├── Dashboard.tsx        # Library view with folders and entities
│   └── EntityViewer.tsx     # Graph + Source split view
├── components/
│   ├── ui/                  # Reusable UI components (buttons, cards, inputs)
│   ├── dashboard/           # Dashboard-specific components
│   ├── graph/               # Graph canvas and node components
│   ├── source/              # PDF and Formatted viewers
│   └── layout/              # Header, Sidebar, SplitView
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript interfaces
├── lib/
│   └── utils.ts             # Utility functions (cn for classnames)
├── mocks/                   # MSW handlers and mock data
└── assets/                  # Static assets (icons, images)
```

## Routes

- `/` or `/dashboard` → Dashboard
- `/entity/:id` → EntityViewer

## MSW Setup

Initialize MSW in main.tsx for development. Handlers intercept `/api/entities`, `/api/entities/:id`, and `/api/folders` endpoints.

## Global Styles

Import Inter and Lora from Google Fonts. Tailwind handles base styles. Custom CSS limited to paper textures and complex gradients that benefit from reusable classes.
