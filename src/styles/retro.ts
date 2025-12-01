export const retro = {
  // Core colors
  black: '#1a1a1a',
  white: '#f5f5f0',
  cream: '#fffef9',

  // Grays
  gray: '#c0c0c0',
  darkGray: '#808080',

  // Accent colors
  blue: '#000080',
  lightBlue: '#1084d0',
  green: '#227722',
  amber: '#c9a227',
  red: '#aa2222',

  // UI colors
  windowBg: '#ececec',
  desktop: '#008080',
  highlight: '#ffe066',

  // Border colors for 3D effect
  inset: '#808080',
  outset: '#ffffff',

  // Typography
  font: '"IBM Plex Mono", monospace',
  fontSerif: 'Georgia, serif',
} as const;

export type RetroColors = typeof retro;
