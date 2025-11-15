import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Main backgrounds - matching Graphex logo
        background: '#F5F0E8', // Warm beige (lighter than logo)
        canvas: '#EDE4D8', // Beige from Graphex logo for graph canvas
        'graph-canvas': '#EDE4D8', // Alias for graph canvas
        chrome: '#FFFFFF', // White for panels and cards

        // Primary brand color
        primary: {
          DEFAULT: '#2196F3', // Bright blue
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },

        // Text colors
        text: {
          primary: '#1A3A52', // Charcoal blue for main text
          secondary: '#546E7A', // Medium gray-blue for secondary text
          muted: '#78909C', // Light gray-blue for muted text
        },

        // Node type colors (functional color system)
        node: {
          root: '#1565C0', // Deep blue - foundation concepts
          supporting: '#42A5F5', // Medium blue - secondary ideas
          example: '#4DD0E1', // Light cyan - practical implementations
          definition: '#00897B', // Teal - terminology nodes
          question: '#FF9800', // Orange - areas needing exploration
        },

        // Node state colors
        state: {
          'with-notes': '#FFC107', // Gold border - user has notes
          mastered: '#66BB6A', // Green - confirmed understanding
          'needs-review': '#FF7043', // Red-orange - requires attention
        },

        // Edge/relationship type colors
        edge: {
          causal: '#2196F3', // Blue - "leads to", "causes"
          definitional: '#00897B', // Teal - "is a", "defines"
          example: '#00BCD4', // Cyan - "such as"
          contrast: '#FF9800', // Orange - "contrasts with"
          related: '#90A4AE', // Gray - general relationship
        },

        // Semantic colors (bright and clear)
        success: '#4CAF50', // Vibrant green
        error: '#F44336', // Bright red
        warning: '#FFC107', // Amber
        info: '#2196F3', // Blue

        // Dark mode colors
        dark: {
          background: '#1A2332', // Deep blue-gray
          canvas: '#2A3847', // Lighter blue-gray
          chrome: '#283747', // Dark blue for UI
          text: '#F0F4F8', // Soft white
        },
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'sans-serif'],
        serif: ['Charter', 'Georgia', 'Literata', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        node: '8px', // Rounded corners for nodes
      },
      boxShadow: {
        node: '0 2px 8px rgba(0, 0, 0, 0.08)', // Subtle shadow for nodes
        'node-hover': '0 4px 12px rgba(33, 150, 243, 0.15)', // Blue glow on hover
      },
      animation: {
        'highlight-fade': 'highlight-fade 2s ease-in-out forwards',
        shake: 'shake 0.5s ease-in-out',
      },
      keyframes: {
        'highlight-fade': {
          '0%': { backgroundColor: 'rgb(254, 240, 138)' }, // yellow-200
          '100%': { backgroundColor: 'transparent' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  darkMode: 'class', // Enable class-based dark mode
  plugins: [],
};

export default config;
