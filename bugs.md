# Known Bugs

| # | Bug | Location | Root Cause | Fix | Severity |
|---|---|---|---|---|---|
| 2 | No way to reset zoom, and zoom only works with scroll wheel | `mainwindow.py:312-319, 455` | No keyboard shortcuts for zoom in/out/reset | Add `Ctrl+=` (zoom in), `Ctrl+-` (zoom out), `Ctrl+0` (reset) in `shortcuts()` | Low |
