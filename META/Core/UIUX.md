# UI/UX Design Vision: Knowledge Graph Learning Canvas

## Design Philosophy

**Core Principle**: *Colorful Clarity for Enhanced Cognition*

This is a **thinking tool** that uses color strategically to enhance understanding. The aesthetic should feel like a vibrant, well-organized workspace where color communicates meaning, guides attention, and makes relationships visible at a glance. Think: scientific diagrams, information graphics, visual knowledge systems.

**Color Philosophy**:
- Color carries meaning (node types, relationships, states)
- Bright, clear colors for immediate recognition
- Light blue creates a calm, spacious foundation
- Strategic use of the full spectrum for functional differentiation

---

## Visual Aesthetic

### Color Palette: "Vibrant Knowledge Canvas"

**Core Philosophy**: Use color strategically to communicate functionality, relationships, and states. Color is not decoration—it's information.

**Primary Colors**:
- **Background**: Soft light blue (#E8F4F8) - main canvas color, calm and spacious
- **Graph Canvas**: Lighter blue-white (#F0F8FC) - subtle differentiation, maintains blue theme
- **UI Chrome**: White (#FFFFFF) - panels, modals, cards for contrast
- **Primary Accent**: Bright blue (#2196F3) - interactive elements, primary actions
- **Dark Text**: Charcoal blue (#1A3A52) - for readability on light backgrounds

**Graph Node Colors** (Functional Color System):
Each color communicates node type, state, or relationship strength:

- **Root/Main Concepts**: Deep blue (#1565C0) - foundation concepts
- **Supporting Concepts**: Medium blue (#42A5F5) - secondary ideas
- **Examples/Applications**: Light cyan (#4DD0E1) - practical implementations
- **Definitions**: Purple (#7E57C2) - terminology nodes
- **Questions/Problems**: Orange (#FF9800) - areas needing exploration
- **With Notes**: Gold border (#FFC107) - user has added notes
- **Mastered (after quiz)**: Green (#66BB6A) - confirmed understanding
- **Needs Review**: Red-orange (#FF7043) - requires attention

**Edge Colors** (Relationship Type Indicators):
- **Causal relationship** ("leads to", "causes"): Blue (#2196F3), solid, 3px
- **Definitional** ("is a", "defines"): Purple (#9C27B0), solid, 2px
- **Example of** ("such as"): Cyan (#00BCD4), dashed, 2px
- **Contrasts with**: Orange (#FF9800), dotted, 2px
- **Related to** (general): Gray (#90A4AE), solid, 2px
- **Hover state**: Bright accent color + glow effect, 4px

**Semantic Colors** (Clear, Bright Communication):
- **Success/Correct**: Vibrant green (#4CAF50)
- **Error/Incorrect**: Bright red (#F44336)
- **Warning/Review**: Amber (#FFC107)
- **Info/Neutral**: Blue (#2196F3)

**Why This Palette**:
- Light blue background creates calm, spacious feeling without being sterile
- Color-coded nodes and edges make relationships instantly recognizable
- Bright functional colors provide clear feedback and wayfinding
- High contrast ensures readability and accessibility
- Color meanings are intuitive and consistent throughout the app

---

### Typography: "Readable Authority"

**Font Stack**:
- **Headers/UI**: Inter or IBM Plex Sans (clean, modern, slightly technical)
  - Node titles: 14px, medium weight
  - Section headers: 18px, semibold
  - Page title: 24px, bold
  
- **Body/Reading**: Charter, Georgia, or Literata (serif for sustained reading)
  - Document text: 16px, 1.6 line height
  - Notes: 15px, 1.5 line height
  
- **Code/Technical**: JetBrains Mono (if showing any structured data)
  - Graph labels: 12px

**Why Mixed Fonts**:
- Sans-serif UI = modern, clean navigation
- Serif reading = better for long-form text consumption
- Distinction helps brain switch between "navigating" and "reading" modes

**Text Hierarchy**:
- High contrast ratios (WCAG AAA compliance)
- Clear size differentiation between levels
- Generous spacing prevents overwhelm

---

### Spacing & Layout: "Breathing Room"

**Grid System**: 8px base unit
- All spacing in multiples of 8 (8, 16, 24, 32, 48)
- Creates visual rhythm and consistency

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  Document Title            [Help] [Settings]    │ ← 64px header
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   GRAPH CANVAS       │    READING PANEL                 │
│   (60% width)        │    (40% width)                   │
│                      │                                  │
│   [Mermaid Graph]    │    [Document text with           │
│                      │     highlighted passage]         │
│                      │                                  │
│   [Zoom controls]    │    [Scroll indicator]            │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

**Responsive Breakpoints**:
- Desktop-first (this requires focus)
- Below 1200px: Stack vertically, graph on top
- Mobile: Show graph OR text, toggle button to switch

**White Space Philosophy**:
- Generous padding around all elements (minimum 24px)
- Graph nodes not densely packed (min 48px between nodes)
- Text never goes edge-to-edge (max width 680px in reading panel)

---

## Interaction Design

### Micro-Interactions: "Gentle Guidance"

**Node Interactions**:
1. **Hover**:
   - Subtle lift (2px shadow, 200ms ease-out)
   - Brief tooltip appears after 400ms: "Click to read | Right-click for options"
   - Connected nodes slightly highlight (20% opacity increase)

2. **Click**:
   - Node pulses once (scale 1.0 → 1.05 → 1.0, 300ms)
   - Reading panel smoothly scrolls to relevant section (800ms ease-in-out)
   - Subtle highlight fades in around text (yellow, 2s fade)
   - Clicked node gets subtle "active" border

3. **Right-Click (Context Menu)**:
   - "Add note"
   - "Mark as understood"
   - "Mark for review"
   - "See connections"

**Edge/Connection Interactions**:
1. **Hover**:
   - Edge brightens and thickens
   - Shows relationship label in small tooltip
   - Connected nodes slightly highlight

2. **Click**:
   - Modal slides up from bottom (not jarring popup)
   - Dims background 40%
   - **Pre-explanation prompt**: 
     "Before seeing the AI's explanation, write your hypothesis..."
     - Empty text area, calming placeholder: "What's your thinking?"
     - Character counter: "0/50 characters (minimum)"
     - Gentle shake if they try to submit under 50 chars
     - Muted "Submit" button until requirement met

3. **After Submission**:
   - Text area locks (can't edit hypothesis)
   - Smooth reveal (300ms fade): 
     - AI's explanation
     - Relevant source passages
   - Prompt: "Now explain this connection in your own words"
   - Second text area appears below

**Note-Taking Interactions**:
1. **Opening Note Panel**:
   - Slides in from right (400ms ease-out)
   - Blurs graph slightly (focus on note)
   - Autofocus on text area

2. **While Typing**:
   - Auto-save indicator: "Saving..." → "Saved ✓" (subtle, top-right)
   - No disruptive save buttons
   - Word count shows if approaching limit

3. **Closing**:
   - Click outside or ESC key
   - Panel slides away
   - Node gains visual indicator (small amber dot)

**Comprehension Check**:
1. **Trigger**:
   - After 5 nodes interacted with, gentle notification banner slides from top
   - "Ready to test your understanding? [Start Quiz] [Later]"
   - NOT a blocking modal—user maintains control

2. **Quiz UI**:
   - Clean, centered, single question at a time
   - Progress indicator: "Question 2 of 5"
   - Radio buttons with generous click areas
   - "Submit Answer" appears only after selection
   - Immediate feedback:
     - Correct: Muted green check, brief explanation
     - Incorrect: Soft rose X, explanation + link back to relevant node
   - "Next Question" button

3. **Results**:
   - Simple score display
   - List of concepts to review (linked back to nodes)
   - "Return to Graph" primary action

---

### Animation Philosophy: "Purposeful, Never Frivolous"

**Principles**:
- All animations serve feedback or guidance
- Duration: 200-400ms for most interactions (feels responsive)
- Easing: ease-out for appearing, ease-in for disappearing
- No bouncing, spinning, or "fun" animations
- Smooth scrolling (800ms) feels intentional, not jarring

**Key Animations**:
- Graph zoom: Smooth, not disorienting (600ms)
- Panel transitions: Slide, not pop (400ms)
- Text highlighting: Gentle fade (2000ms)
- Loading states: Subtle pulse, not spinner when possible

---

## Tone & Voice

### Written Copy: "Knowledgeable Friend"

**Personality**: 
- Intelligent but not condescending
- Encouraging but not patronizing
- Direct but not cold
- Curious, not preachy

**Examples**:

❌ **Too Casual**: "Awesome! You totally nailed that connection! 🎉"
❌ **Too Formal**: "Your response has been recorded for analysis."
✅ **Just Right**: "Nice work. Let's see how AI interpreted this connection."

❌ **Too Casual**: "Oops! That's not quite right. Try again?"
❌ **Too Formal**: "Incorrect response. Please review the material."
✅ **Just Right**: "Not quite. Here's what you might have missed..."

**Prompt Examples**:

*Pre-explanation retrieval*:
"Before seeing the AI's interpretation, what's your hypothesis? Why might these two concepts be connected?"

*After reading*:
"Ready to test your understanding of this section?"

*When opening app*:
"Upload a document to begin mapping knowledge."

*Empty state (no notes)*:
"As you read, add notes here to capture your thinking."

*Quiz results*:
"You've got a solid grasp of 4 concepts. Let's revisit these 2..."

**No Gamification Language**:
- ❌ "Level up!" "Unlock!" "Streak!"
- ✅ "Mastered" "Understood" "Reviewed"

---

## Accessibility & Usability

### Keyboard Navigation:
- Tab through all interactive elements (clear focus indicators)
- Spacebar to activate nodes
- Arrow keys to navigate between connected nodes
- ESC to close modals
- Ctrl/Cmd + N for new note
- Ctrl/Cmd + F to search graph

### Focus Management:
- Clear, high-contrast focus rings (3px teal outline)
- Focus trap in modals (can't tab out)
- Focus returns to triggering element when closing modals

### Screen Reader Support:
- All nodes have aria-labels: "Concept: [title]. Has 3 connections. Click to read."
- Edges announced: "Connection from [A] to [B]: [relationship type]"
- Live regions for dynamic updates: "Note saved" "Quiz started"

### Visual Indicators:
- Never rely on color alone
- Icons + text labels
- High contrast mode available
- Zoom up to 200% without breaking layout

### Progressive Disclosure:
- Hide advanced features initially
- Show tooltips on hover
- Onboarding: 3-4 quick pointers on first use
  - "This is your knowledge graph"
  - "Click nodes to read"
  - "Add notes as you learn"
  - "We'll test your understanding later"

---

## Special UI States

### Loading States:
**Document Upload**:
- Progress bar with stages: "Parsing document... Analyzing structure... Generating graph..."
- Takes 30-60 seconds—be transparent
- Subtle animation: Nodes "growing" into place as graph generates

**Graph Rendering**:
- Skeleton loading: Gray placeholder nodes fade into actual content
- Smooth transitions, not jarring pop-ins

### Error States:
**Document Upload Failed**:
- Soft background color (dusty rose)
- Icon (document with X)
- Clear message: "Couldn't process this file. Try a text-based PDF or .txt file."
- "Try Again" button

**Connection Explanation Failed**:
- Don't break flow
- Show: "AI couldn't generate explanation. Here's the relevant source text..."
- Maintain user's hypothesis (don't lose their work)

### Empty States:
**No Document**:
- Center of screen
- Upload icon (outline style)
- "Upload a document to begin"
- Supported formats below
- Sample document link: "Or try an example"

**No Notes Yet**:
- Inside note panel
- Small icon (pencil)
- "Add your first note..."
- Hint: "Summarize in your own words"

---

## Graph Visualization Specifics

### Node Design:
```
┌─────────────────┐
│  Concept Title  │  ← Rounded corners (8px), subtle shadow
│                 │
│  [3 notes icon] │  ← Small indicator if notes exist
└─────────────────┘
```

- **Shape**: Rounded rectangles (8px radius)
- **Size**: Min 140px wide × 60px tall, expands with text
- **Padding**: 12px all sides
- **Shadow**: 0 2px 8px rgba(0,0,0,0.08)
- **Border**: 2px solid for states (default none, active, mastered)

### Edge Design:
- **Stroke**: 2px default, 3px on hover
- **Arrow**: Simple, not ornate
- **Label**: Appears on hover in small pill (light background)
- **Curvature**: Slight bezier curve to avoid overlapping straight lines

### Graph Canvas:
- **Background**: Subtle dot grid (very light, not distracting)
- **Zoom**: 50% to 200%, mouse wheel or controls
- **Pan**: Click + drag (cursor changes to grab hand)
- **Reset View**: Button in corner "Fit to screen"
- **Minimap**: Small overview in bottom-right corner (optional, if complex graph)

---

## Onboarding: First-Time Experience

### 3-Step Tooltip Tour:
1. **Upload Area**: "Start by uploading a document—PDF, text, or markdown"
2. **Graph**: "We'll visualize it as a knowledge graph. Click nodes to read."
3. **Note Panel**: "Add notes as you learn. We'll test your understanding later."

Each tooltip:
- Dim background slightly
- Spotlight the relevant area
- "Next" and "Skip tour" options
- Never auto-advance—user controls pace

### Sample Document Option:
- "Not sure where to start? Try our sample article on [topic]"
- Pre-loaded, demonstrates all features
- Helps users understand value before committing their own document

---

## Desktop vs. Tablet/Mobile

### Desktop (Primary):
- Full side-by-side layout
- Hover states fully functional
- Right-click menus available
- Multi-select with Shift/Ctrl

### Tablet:
- Stack vertically: Graph above, text below
- Toggle button to switch focus
- Tap interactions (no hover)
- Swipe to dismiss modals

### Mobile (Degraded but Usable):
- Single column
- Tabs: [Graph] [Text] [Notes]
- Simplified graph (fewer nodes visible at once)
- Zoom controls more prominent
- Consider: "This works best on desktop" gentle message

---

## Dark Mode Considerations

### Color Adaptation:
- Background: Deep blue-gray (#1A2332) - maintains blue theme
- Graph canvas: Slightly lighter blue-gray (#2A3847)
- Text: Soft white (#F0F4F8)
- Nodes: Maintain vibrant colors but slightly desaturated for comfort
  - Root concepts: Lighter blue (#42A5F5) instead of deep blue
  - Supporting: Brighter cyan (#4DD0E1)
  - Keep color meanings consistent across modes
- UI Chrome: Dark blue (#283747)
- Maintain color-coded relationships in darker tones

### When to Offer:
- System preference auto-detect
- Manual toggle in settings
- Remember user preference
- Keep functional color meanings consistent across both modes

---

## Delightful Details (Polish Layer)

These are "nice-to-haves" that add personality without distraction:

1. **First Graph Generated**: Gentle confetti animation (single burst, very subtle)
2. **First Note Saved**: Small success checkmark with soft sound (optional, off by default)
3. **Quiz Perfect Score**: "You've mastered this section" with subtle badge icon
4. **Reading Time Estimate**: Below document title "~12 min read"
5. **Node Connections Counter**: "This concept connects to 4 others"
6. **Smart Highlights**: AI highlights key phrases in reading panel (very subtle yellow)
7. **Graph Evolution**: Time-lapse slider showing how your graph grew (post-MVP)

---

## Design System Components

For consistency across the app:

**Buttons**:
- Primary: Teal background, white text, 8px radius, 12px vertical padding
- Secondary: Teal outline, teal text, same dimensions
- Tertiary: Text only, teal text, underline on hover

**Inputs**:
- Single line: 40px height, subtle border, 8px radius
- Text area: Min 120px height, same styling
- Focus: Teal outline, 2px

**Modals**:
- Max width: 600px
- Centered or slide from bottom (depends on context)
- Overlay: 40% opacity black
- Close: X in top right + ESC key
- Padding: 32px all sides

**Notifications**:
- Toast style: Slide from top, auto-dismiss after 4s
- Background: Based on type (success/error/info)
- Icon + text, dismissible

---

## Summary: Design Principles

1. **Colorful with Purpose**: Every color communicates function, type, or relationship
2. **Light Blue Foundation**: Calm, spacious main color creates clarity without sterility
3. **Visual Hierarchy**: Color guides attention and reveals structure instantly
4. **Clear, Not Clever**: Direct communication over witty copy
5. **Smooth, Not Showy**: Animations guide, don't entertain
6. **Spacious, Not Sparse**: Generous whitespace aids focus
7. **Vibrant, Not Overwhelming**: Strategic color use enhances, doesn't distract

**Overall Feeling**: Working with a vibrant knowledge visualization system where color makes meaning visible. Like a well-designed infographic or scientific diagram, the interface uses color to reveal patterns, relationships, and structure at a glance while maintaining a calm, focused atmosphere through the light blue foundation.

---

Would you like me to create more detailed specifications for any particular component, or mock up the key interactions in more detail?