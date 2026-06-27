# Known Bugs

| # | Bug | Location | Root Cause | Fix | Severity |
|---|---|---|---|---|---|
| 1 | Page Size dialog has wrong title and no controls | `mainwindow.py:651-659` | Stub copied from FindReplaceDialog — title says "Find and replace", dialog is empty | Add real page-size selection (A4/Letter/Legal) or remove the stub entirely | Medium |
| 2 | Save logic duplicated | `mainwindow.py:321-400` | `save()` and `save_as()` share identical write-to-file code | Extract shared logic into a `_write_file(path, format_filter)` helper | Low |
| 3 | `last_page_char_index_list` accumulated but never used | `mainwindow.py:822-838` | Dead code left during development | Remove the list and its `append` call, or implement intended use (e.g., per-page navigation) | Low |
| 4 | `clear_formatting` hardcodes 14pt | `mainwindow.py:628-644` | Default font size is hardcoded instead of using a named constant | Define `DEFAULT_FONT_SIZE = 14` and reference that | Low |
| 5 | PDF export always uses A4 regardless of document page size | `mainwindow.py:432-453` | `QPageSize(QPageSize.PageSizeId.A4)` hardcoded | Use `self.editor.document().pageSize()` to get current page size | Medium |
| 6 | `eventFilter` blocks all non-wheel events on the viewport | `mainwindow.py:291-295` | Method only checks for Wheel events but doesn't call `super()` for other types | Restructure: only handle wheel, call `super()` for everything else | Medium |
| 7 | Debug `print()` left in production code | `mainwindow.py:837` | Leftover debug print | Remove or replace with proper logging | Low |
| 8 | Strikethrough and underline buttons both show "—" | `mainwindow.py:210, 221` | Same label for different buttons | Use distinct labels (e.g. "S" for strikethrough, "U" for underline) | Low |
| 9 | No way to reset zoom, and zoom only works with scroll wheel | `mainwindow.py:312-319, 455` | No keyboard shortcuts for zoom in/out/reset | Add `Ctrl+=` (zoom in), `Ctrl+-` (zoom out), `Ctrl+0` (reset) in `shortcuts()` | Low |
| 10 | `.txt` open doesn't work reliably | `mainwindow.py:410-428` | `format_filter` comparison may not match the dialog return string exactly | Match by checking file extension or using `endswith()` on the filter string | Low |
