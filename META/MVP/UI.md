# Graphex Design System: Paper Canvas

**Version:** 1.0
**Core Concept:** The interface feels like working on beautiful stationery — warm, tactile, and timeless.

---

## Design Philosophy

Graphex treats the screen as a desk covered with fine paper. Every surface, card, and container evokes the texture and warmth of physical stationery.

**Principles:**

1. **Warmth over coldness** — No cool grays. Every neutral is tinted warm (ivory, sand, tan).
2. **Tactile suggestion** — Subtle textures hint at paper grain.
3. **Soft hierarchy** — Shadows are minimal and warm. Nothing harsh or clinical.
4. **Timeless, not trendy** — Classic proportions, serif headings, restrained animation.

---

## Color Palette

### Sand Scale (Primary)

| Token | Hex | Usage |
|-------|-----|-------|
| `sand-50` | #FDFBF7 | Page background |
| `sand-100` | #FAF6EF | Card backgrounds |
| `sand-200` | #F3EBE0 | Borders, dividers |
| `sand-300` | #E6D9C6 | Hover states, stronger borders |
| `sand-400` | #C9B89A | Muted text, icons |
| `sand-500` | #A89274 | Secondary text |
| `sand-600` | #8B7355 | Primary text (muted) |
| `sand-700` | #6B5A45 | Primary text |
| `sand-800` | #4A3F32 | Headings, strong text |
| `sand-900` | #2D261E | Maximum contrast |

### Terracotta (Accent)

| Token | Hex | Usage |
|-------|-----|-------|
| `terra-400` | #E07B5A | Hover states |
| `terra-500` | #C96442 | Primary buttons, active states |
| `terra-600` | #B54D2E | Button hover |
| `terra-700` | #8B3A22 | Button borders |

### Teal (Secondary)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-400` | #2D9B8A | Hover |
| `accent-500` | #0F766E | Links, secondary buttons |
| `accent-600` | #0C5D58 | Pressed state |

### Semantic Colors

For entity avatars: Amber (#D97706), Emerald (#059669), Rose (#E11D48)

---

## Typography

### Fonts

- **Headings:** Lora (serif) — classic, literary
- **Body/UI:** Inter (sans-serif) — clean, legible

### Type Scale

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page Title | Lora | 24px | 600 | sand-900 |
| Section Header | Lora | 18px | 600 | sand-800 |
| Card Title | Inter | 15px | 600 | sand-800 |
| Body | Inter | 14px | 400 | sand-700 |
| Secondary | Inter | 13px | 400 | sand-500 |
| Caption | Inter | 12px | 500 | sand-400 |
| Label | Inter | 11px | 600 | sand-500, uppercase |

---

## Paper Textures

### Background

Subtle SVG noise pattern with `feTurbulence` filter at 3-5% opacity.

```css
.paper-bg {
    background:
        linear-gradient(180deg, rgba(253,251,247,0.97) 0%, rgba(250,246,239,0.98) 100%),
        url("data:image/svg+xml,..."); /* SVG noise */
}
```

### Stacked Paper Effect

For sidebar panels — layered sheets with slight rotation:

```css
.paper-stack::before { bottom: -4px; transform: rotate(0.5deg); }
.paper-stack::after { bottom: -8px; transform: rotate(-0.3deg); }
```

---

## Components

### Paper Card

```css
.paper-card {
    background: linear-gradient(180deg, #FFFEFA 0%, #FAF6EF 100%);
    border: 1px solid #E6D9C6;
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(107, 90, 69, 0.06);
}
.paper-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(107, 90, 69, 0.08);
}
```

### Primary Button (Terracotta)

```css
.btn-primary {
    background: linear-gradient(180deg, #C96442 0%, #B54D2E 100%);
    color: white;
    border: 1px solid #8B3A22;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
}
```

### Secondary Button (Paper)

```css
.btn-secondary {
    background: linear-gradient(180deg, #FFFEFA 0%, #FAF6EF 100%);
    color: #6B5A45;
    border: 1px solid #E6D9C6;
}
```

### Tags

```css
.tag {
    padding: 2px 8px;
    background: linear-gradient(180deg, #FAF6EF 0%, #F3EBE0 100%);
    border: 1px solid #E6D9C6;
    border-radius: 3px;
    font-size: 11px;
}
```

### Form Inputs

```css
.input {
    background: #FFFEFA;
    border: 1px solid #E6D9C6;
    border-radius: 6px;
    box-shadow: inset 0 1px 2px rgba(107, 90, 69, 0.04);
}
.input:focus {
    border-color: #C96442;
    box-shadow: 0 0 0 3px rgba(201, 100, 66, 0.1);
}
```

### Folder Items

```css
.folder-item:hover {
    background: #FAF6EF;
    border-color: #E6D9C6;
}
.folder-item.active {
    background: linear-gradient(135deg, #FDF8F3 0%, #F9F0E5 100%);
    border-color: #C96442;
    box-shadow: 0 0 0 3px rgba(201, 100, 66, 0.1);
}
```

### Entity Rows

```css
.entity-row {
    padding: 16px 20px;
    border-bottom: 1px solid #F3EBE0;
}
.entity-row:hover {
    background: linear-gradient(90deg, #FDFBF7 0%, #FAF6EF 100%);
}
```

### Entity Avatars

40x40px rounded squares with gradient backgrounds and white initials.

---

## Shadows

All shadows use warm brown tint `rgba(107, 90, 69, ...)`:

- **sm:** `0 1px 2px rgba(107, 90, 69, 0.06)`
- **md:** `0 2px 4px rgba(107, 90, 69, 0.06), 0 4px 12px rgba(107, 90, 69, 0.04)`
- **lg:** `0 4px 8px rgba(107, 90, 69, 0.08), 0 8px 24px rgba(107, 90, 69, 0.06)`

---

## Spacing

4px base unit: xs(4), sm(8), md(16), lg(24), xl(32), 2xl(48)

---

## Animation

- Micro-interactions: 150ms
- State changes: 200ms
- Easing: `ease-out` for entrances

---

## Iconography

Heroicons (outline set), 2px stroke. Sizes: 16px (inline), 20px (nav), 24px (decorative).

---

## Layout

- Max width: 1280px centered
- Sidebar: 240-280px
- Dashboard: 3-col sidebar + 9-col main (12-col grid)

---

## Implementation

Uses **Tailwind CSS** with custom theme extending the sand/terra/accent colors. Utility-first approach — minimal custom CSS classes.
