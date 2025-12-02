export const cyber = {
  // Core colors
  black: '#000000',
  white: '#FFFFFF',
  concrete: '#F2F2F2',

  // Grays
  gray: '#e5e5e5',
  darkGray: '#666666',

  // Accent colors
  orange: '#FF3E00',      // Primary CTA, Safety Orange
  blue: '#0047FF',        // Links, secondary (International Klein Blue)

  // Semantic colors
  danger: '#FF3E00',
  success: '#22C55E',
  warning: '#FBBF24',

  // Surface colors
  surface: '#FFFFFF',     // Cards, windows
  background: '#F2F2F2',  // Main background

  // Typography
  fontDisplay: "'Space Mono', monospace",
  fontBody: "'Inter', sans-serif",

  // Shadows
  shadow: '4px 4px 0px #000000',
  shadowLg: '8px 8px 0px #000000',
  shadowHover: '6px 6px 0px #000000',

  // Borders
  border: '2px solid #000000',
  borderLight: '1px solid #000000',
} as const;

export type CyberColors = typeof cyber;
