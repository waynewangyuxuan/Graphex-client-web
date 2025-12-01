# Graphex Frontend: Retro UI System

## Aesthetic

Windows 3.1 / early Mac inspired. Monospace fonts, 2px beveled borders, system grays, no rounded corners.

## Design Tokens

```typescript
// styles/retro.ts
export const retro = {
  black: '#1a1a1a',
  white: '#f5f5f0',
  cream: '#fffef9',
  gray: '#c0c0c0',
  darkGray: '#808080',
  blue: '#000080',
  lightBlue: '#1084d0',
  amber: '#c9a227',
  windowBg: '#ececec',
  desktop: '#008080',
  highlight: '#ffe066',
  font: '"IBM Plex Mono", monospace',
};
```

## Border Styles

Outset (raised): light color on top/left (#ffffff), dark on bottom/right (#808080).

Inset (recessed): dark on top/left (#808080), light on bottom/right (#ffffff).

Use 2px solid borders for both.

## Components

### Window

Container with outset border, windowBg background, and drop shadow (4px 4px 0 rgba(0,0,0,0.3)). Takes children. Does not include title bar.

### TitleBar

Blue gradient background (blue to lightBlue, left to right). White bold text for title. Window control buttons on right side (minimize, maximize, close). Buttons are small squares with gray background and single-pixel black border.

### Button

Default: gray background with outset border. On mousedown, switch to inset border (pressed effect). Active/selected state: blue background, white text. Disabled: 50% opacity. Monospace font, padding 6px 16px.

### Inset

Container with inset border and cream background. Used for content wells, text areas, lists.

### StatusBar

Fixed height bar at bottom. Gray background with inset top border. Contains multiple segments, each with its own inset border. Monospace 11px text.

### Section Header

Text styled like "═ SECTION NAME ═" using box-drawing characters. 11px bold monospace, with bottom border.