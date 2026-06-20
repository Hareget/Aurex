# Timeline — PowerPoint Clone (ppt-clone.html)

## Overview
Single-file HTML PowerPoint clone built with **Fabric.js 5.3.1**. Create scenes with shapes, text, and images; style them, assign animations with duration/delay; undo/redo; fullscreen presentation.

---

## v1 — Initial Build: 20 Jun 2026
Dark theme, left-side properties, double-click text, canvas-click image mode.

### Slide/Scene Management
- **Add/delete scenes** with editable name and computed total duration
- **Scene panel** (left sidebar, 200px, light gray) — index, double-click to rename, duration, delete on hover
- **JSON serialization** — `canvas.toJSON()` with custom properties (`customAnimation`, `animDuration`, `animDelay`)
- **Undo/Redo** — Ctrl+Z / Ctrl+Shift+Z, 50-snapshot history

### 10 Shapes
Click **Shape** button → floating picker popup with 10 shapes:

| Shape | Implementation |
|---|---|
| Rectangle | `fabric.Rect` |
| Circle | `fabric.Circle` |
| Ellipse | `fabric.Ellipse` |
| Triangle | `fabric.Polygon` (3 pts) |
| Line | `fabric.Line` |
| Pentagon | `fabric.Polygon` (5 pts) |
| Hexagon | `fabric.Polygon` (6 pts) |
| Star | `fabric.Polygon` (10 pts, alternating radii) |
| Arrow | `fabric.Polygon` (7-pt arrow) |
| Diamond | `fabric.Polygon` (4 pts) |

### Text
- Click **Text** button → click anywhere on canvas → `fabric.IText` placed at cursor
- **5 fonts**: Arial, Times New Roman, Courier New, Georgia, Verdana
- Font size slider 8–120px, fill color

### Image
- Click **Image** button → file picker opens directly → selected image placed at canvas center (max 400px, scaled proportionally)
- Images stored as data URLs

### Properties Panel (Right Side)
Opens on the **right side** when **right-clicking** an object:

- **Text Settings**: Font, Size, Fill (text objects only)
- **Shape/Image Settings**: Fill color
- **Border**: Color picker + Width slider 0–20px
- **Animation**: Effect dropdown (9 types) + Duration (100–5000ms) + Delay (0–3000ms)
- Scene total duration = sum of all animated object durations + delays
- Close button dismisses panel; canvas resizes smoothly

### Animations (9 Effects)
| Effect | Keyframe | Duration Config |
|---|---|---|
| Fade In | `fadeIn` | 100–5000ms |
| Slide In Left | `slideInLeft` | 100–5000ms |
| Slide In Right | `slideInRight` | 100–5000ms |
| Slide In Top | `slideInTop` | 100–5000ms |
| Slide In Bottom | `slideInBottom` | 100–5000ms |
| Zoom In | `zoomIn` | 100–5000ms |
| Bounce | `bounce` | 100–5000ms |
| Rotate | `rotateIn` | 100–5000ms |
| Flip | `flipIn` (perspective rotateX) | 100–5000ms |

Each animation has configurable **duration** (100–5000ms) and **delay** (0–3000ms).

### Header Bar (56px, white)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ■ AUREX  | [T]Text [⬡]Shape [🖼]Image  |  [🖱]  |  [↶][↷] | [▶Preview▾] [Export] [━] [⚙] │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Left:** Logo + AUREX
**Center:** Text (click-to-add), Shape (picker popup), Image (direct file picker), separator, Select tool
**Right:** Undo, Redo, separator, Preview dropdown (From Current / From Start), Export (PNG 2x), Line type (dash toggle), Settings

### Presentation Mode
- **Preview dropdown** — "Play from Current Scene" / "Start from Beginning"
- Fullscreen overlay, black background, progress bar
- Objects without animation appear immediately
- Objects with animation reveal on click with configured **duration** and **delay**
- Arrow keys navigate forward/backward; Escape exits

### UI Layout (Light Theme)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ■ AUREX  | [T]Text [⬡]Shape [🖼]Image | [↶][↷] | [▶Preview▾] [Export] [━] [⚙] │
├──────────┬──────────────────────────────────────────┬────────────────────────┤
│ Scene    │                                           │  Properties Panel     │
│ List     │          Canvas (960×540)                │  (240px, opens on     │
│ (200px)  │          (bg: #e6e6e6)                   │   right-click,        │
│          │                                           │   bg: #fafafa)        │
├──────────┴──────────────────────────────────────────┴────────────────────────┤
```

- **Light shade** theme: white header, light gray panels, dark text, blue accent (#0078d4)
- **Responsive**: panels shrink on smaller screens

### Keyboard Shortcuts
| Key | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Delete` / `Backspace` | Remove selected object |
| `Escape` | Exit presentation |
| `→` / `↓` / `Space` / `Enter` | Next animation (presentation) |
| `←` / `↑` | Previous animation (presentation) |

---

## v2 — UI Redesign: 20 Jun 2026
Complete visual overhaul and UX fixes based on feedback.

### Changes from v1
| Before | After |
|---|---|
| Dark theme (`#1e1e1e` bg, `#2d2d2d` panels) | **Light theme** (`#f0f0f0` bg, white header, `#fafafa` panels) |
| Header 48px | Header **56px** |
| Properties panel on **left** side (between scenes & canvas) | Properties panel on **right** side (between canvas & edge) |
| Header: Settings / Export / Preview / Line / Undo / Redo | Header: **Undo / Redo / Preview / Export / Line / Settings** |
| Text mode: **double-click** canvas to place text | Text mode: **single click** places text |
| Image mode: click canvas → file picker | Image: click **Image button** → file picker directly |
| Shape picker dark theme | Shape picker **light theme** |
| Right-click handler used `findTarget(evt, false)` | Fixed `findTarget(evt)` call |
| Scene list used `fabric.StaticCanvas` for thumbnails (re-init errors) | Lightweight 2D canvas drawing for thumbnails |
| Presentation used background image + setTimeout hack | All objects rendered as positioned HTML elements directly |
| Selection:cleared auto-closed props during right-click | Clean separation of right-click and selection events |

### Dependencies
- **Fabric.js 5.3.1** (CDN) — canvas interaction, object management, serialization
- Zero other dependencies; single `.html` file
