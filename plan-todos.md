# Development Plan & Architecture

## Architecture Overview

Kitab has three main classes:

- **`MainWindow`** (`mainwindow.py:11`) — The app window. Manages menu bar, toolbar, file operations, zoom, and holds all UI controls (buttons, combos). Contains a `QGraphicsView` that displays the editor with page-break gaps.

- **`Editor`** (`mainwindow.py:747`) — A `QTextEdit` subclass. The actual document widget. Pages are emulated by setting the widget height to `pageCount * base_height` and painting dark gaps between pages in `paintEvent`. Has no scrollbars — the parent `QGraphicsView` handles scrolling.

- **`FindReplaceDialog`** (`mainwindow.py:668`) — A simple `QDialog` with find/replace fields and match-case toggle.

### Data Flow

```
MainWindow ←→ Editor (signals: textChanged, cursorPositionChanged)
     │              │
     │              └── QTextDocument (internal, holds HTML content)
     │
     └── File I/O: .ktb = `editor.toHtml()` / `setHtml()`
                   .txt = `editor.toPlainText()` / `setPlainText()`
```

## Phase 1 — Core (Initial commit)

- [x] `QMainWindow` with centered `QTextEdit`
- [x] File menu: New, Open, Save, Save As
- [x] `.ktb` format (HTML under the hood) and `.txt`

## Phase 2 — Formatting Toolbar

- [x] Font family combo
- [x] Font size combo (6–96, editable)
- [x] Font color picker with preview button
- [x] Bold / italic / underline / strikethrough toggles
- [x] Clear formatting button
- [x] Alignment buttons (left, center, right) with exclusive group
- [x] Tooltips via pyqttooltip

## Phase 3 — Paged View

- [x] Disable QTextEdit scrollbars, wrap in QGraphicsView
- [x] Paint dark horizontal gaps between pages
- [x] Dynamic height adjustment as pages are added
- [x] Auto-scroll on page growth
- [x] Zoom control (factor 0.1–5.0)

## Phase 4 — Insertions

- [x] Table insertion (rows, columns, width %)
- [x] Image insertion (PNG, JPG, BMP, GIF, SVG)

## Phase 5 — Actions & Dialogs

- [x] Find & Replace dialog with wrap-around
- [x] Print support
- [x] PDF export
- [x] Right-click context menu (undo, redo, cut, copy, paste, find, select all)
- [x] Fullscreen toggle (F11)
- [x] Command-line file opening

## Phase 6 — Polish

- [x] Window icon (base64-encoded)
- [x] Close-event with unsaved-changes warning
- [x] Font sync (toolbar updates when cursor moves)
- [x] Enter-key preserves formatting from previous line

## Future Improvements

- [ ] **Logging system** — write debug logs to `~/magnus/Kitab/logs/`
  - File rotation: `kitab-YYYY-MM-DD.log`
  - Levels: DEBUG, INFO, WARN, ERROR
  - Log crashes, file operations, formatting changes
- [ ] **Headings (H1–H6)** — dropdown in toolbar
- [ ] **Bullet & numbered lists**
- [ ] **Dark mode toggle** — theme toolbar, menus, backgrounds
- [ ] **Dark theme / paper mode toggle** — switch editor paper between white and dark with text color inversion
- [ ] **Spell check** — Hunspell bindings
- [ ] **Auto-save** — periodic save to temp file
- [ ] **Word / character count** — status bar
- [ ] **RTL / LTR toggle** — important for Arabic
- [ ] **Simple Vim mode** — toggle in settings
- [ ] **Markdown export** — `.md` output
- [ ] **Clickable links** — open in browser
- [ ] **Command palette** — Ctrl+Shift+P, fuzzy command search
- [ ] **Multi-document tabs** — `QTabWidget`
- [ ] **Line numbers** — gutter
- [ ] **Page size selector** — actual working dialog
- [ ] **Refactoring & code segmentation** — split `mainwindow.py` into separate modules:
  - `editor.py` — Editor class
  - `dialogs.py` — FindReplaceDialog and future dialogs
  - `toolbar.py` — toolbar creation logic
  - `mainwindow.py` — slimmed down, imports from those modules
