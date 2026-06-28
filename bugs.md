# Known Bugs

| # | Bug | Location | Root Cause | Fix | Severity |
|---|---|---|---|---|---|
| 1 | `eventFilter` blocks all non-wheel events on the viewport | `mainwindow.py:291-295` | Method only checks for Wheel events but doesn't call `super()` for other types | Restructure: only handle wheel, call `super()` for everything else | Medium |
| 2 | No way to reset zoom, and zoom only works with scroll wheel | `mainwindow.py:312-319, 455` | No keyboard shortcuts for zoom in/out/reset | Add `Ctrl+=` (zoom in), `Ctrl+-` (zoom out), `Ctrl+0` (reset) in `shortcuts()` | Low |
