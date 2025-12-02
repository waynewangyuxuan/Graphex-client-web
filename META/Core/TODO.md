# TODO TRACKER
This tracker serves as a log of what we need to do in the next iteration of development. sections are separated by time(date granularity). APPEND ONLY.

---

## 2025-12-01

### Restyle: Retro → Paper Canvas

Major design system overhaul. Moving from Windows 3.1 retro aesthetic to warm "Paper Canvas" design.

**Phase 1: Setup & Dashboard**
- [ ] Install Tailwind CSS and configure custom theme (sand/terra/accent colors)
- [ ] Add Google Fonts (Inter, Lora)
- [ ] Create index.css with Tailwind directives and paper texture utilities
- [ ] Rewrite Dashboard.tsx with new Paper Canvas styling
- [ ] Create new layout components (Header, Sidebar)
- [ ] Update FolderTree with new folder-item styling
- [ ] Update EntityList with new entity-row styling + avatars
- [ ] Add stats cards row to Dashboard
- [ ] Remove old retro components

**Phase 2: EntityViewer (future)**
- [ ] Restyle EntityViewer with Paper Canvas
- [ ] Implement graph panel
- [ ] Implement source panel