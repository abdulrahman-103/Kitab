# Copyright (C) 2026 Abdulrahman
# This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
# This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
# You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import os
import re
import hashlib
import difflib
from datetime import datetime
from pathlib import Path
from PySide6.QtWidgets import QDialog, QVBoxLayout, QHBoxLayout, QListWidget, QPushButton, QTextEdit, QMessageBox
import menubar

COLOR_ADDED = "#0a7d0a"     
COLOR_REMOVED = "#c0392b"   
COLOR_MODIFIED = "#1a56db"  
COLOR_NEUTRAL = "#666666"   


def _escape_html(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _normalize_newlines(text):
    return text.replace('\r\n', '\n').replace('\r', '\n')


def _current_editor_text(file_path, editor):
    """Same rule everywhere content needs to be extracted from the editor:
    .md uses Markdown export, everything else (including .ktb, which is
    NOT html) uses plain text."""
    if file_path and file_path.endswith(".md"):
        return editor.toMarkdown()
    return editor.toPlainText()


def _classify_lines(current_lines, other_lines):
    """Compares two line lists with SequenceMatcher opcodes (exact counts,
    unlike counting raw ndiff '+'/'-' lines) and returns
    (added, removed, modified, status_label, status_color)."""
    matcher = difflib.SequenceMatcher(None, current_lines, other_lines)
    added = removed = modified = 0
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'insert':
            added += (j2 - j1)
        elif tag == 'delete':
            removed += (i2 - i1)
        elif tag == 'replace':
            modified += max(i2 - i1, j2 - j1)

    if modified or (added and removed):
        return added, removed, modified, "Modified", COLOR_MODIFIED
    if added and not removed:
        return added, removed, modified, "Added only", COLOR_ADDED
    if removed and not added:
        return added, removed, modified, "Removed only", COLOR_REMOVED
    return added, removed, modified, "No changes", COLOR_NEUTRAL


def _inline_word_diff(old_line, new_line):
    """Word-level diff for a single changed line: only the words that
    actually differ are highlighted, instead of coloring the whole line."""
    old_tokens = re.split(r'(\s+)', old_line)
    new_tokens = re.split(r'(\s+)', new_line)
    matcher = difflib.SequenceMatcher(None, old_tokens, new_tokens)
    parts = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            parts.append(_escape_html(''.join(old_tokens[i1:i2])))
        elif tag == 'delete':
            parts.append(
                f"<span style='color:{COLOR_REMOVED}; text-decoration: line-through; "
                f"background:{COLOR_REMOVED}22;'>{_escape_html(''.join(old_tokens[i1:i2]))}</span>"
            )
        elif tag == 'insert':
            parts.append(
                f"<span style='color:{COLOR_ADDED}; text-decoration: underline; "
                f"background:{COLOR_ADDED}22;'>{_escape_html(''.join(new_tokens[j1:j2]))}</span>"
            )
        elif tag == 'replace':
            parts.append(
                f"<span style='color:{COLOR_REMOVED}; text-decoration: line-through; "
                f"background:{COLOR_REMOVED}22;'>{_escape_html(''.join(old_tokens[i1:i2]))}</span>"
            )
            parts.append(
                f"<span style='color:{COLOR_ADDED}; text-decoration: underline; "
                f"background:{COLOR_ADDED}22;'>{_escape_html(''.join(new_tokens[j1:j2]))}</span>"
            )
    return ''.join(parts)


def _render_diff_html(current_lines, snap_lines):
    """Renders a full-line diff for pure additions/removals, but only
    highlights the changed words (not the whole line) for lines that were
    modified rather than added or removed outright."""
    rows = []
    matcher = difflib.SequenceMatcher(None, current_lines, snap_lines)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            for line in current_lines[i1:i2]:
                rows.append(
                    f"<div style='color:#333; padding: 1px 6px 1px 9px; "
                    f"white-space: pre-wrap;'>{_escape_html(line)}</div>"
                )
        elif tag == 'delete':
            for line in current_lines[i1:i2]:
                rows.append(
                    f"<div style='background-color:{COLOR_REMOVED}1a; color:{COLOR_REMOVED}; "
                    f"padding: 1px 6px; border-left: 3px solid {COLOR_REMOVED}; "
                    f"white-space: pre-wrap;'>- {_escape_html(line)}</div>"
                )
        elif tag == 'insert':
            for line in snap_lines[j1:j2]:
                rows.append(
                    f"<div style='background-color:{COLOR_ADDED}1a; color:{COLOR_ADDED}; "
                    f"padding: 1px 6px; border-left: 3px solid {COLOR_ADDED}; "
                    f"white-space: pre-wrap;'>+ {_escape_html(line)}</div>"
                )
        elif tag == 'replace':
            old_block = current_lines[i1:i2]
            new_block = snap_lines[j1:j2]
            paired = min(len(old_block), len(new_block))
            for k in range(paired):
                inline = _inline_word_diff(old_block[k], new_block[k])
                rows.append(
                    f"<div style='background-color:{COLOR_MODIFIED}1a; color:#222; "
                    f"padding: 1px 6px; border-left: 3px solid {COLOR_MODIFIED}; "
                    f"white-space: pre-wrap;'>~ {inline}</div>"
                )
            # Linhas restantes sem par são efetivamente adicionadas ou removidas, não modificadas.
            for line in old_block[paired:]:
                rows.append(
                    f"<div style='background-color:{COLOR_REMOVED}1a; color:{COLOR_REMOVED}; "
                    f"padding: 1px 6px; border-left: 3px solid {COLOR_REMOVED}; "
                    f"white-space: pre-wrap;'>- {_escape_html(line)}</div>"
                )
            for line in new_block[paired:]:
                rows.append(
                    f"<div style='background-color:{COLOR_ADDED}1a; color:{COLOR_ADDED}; "
                    f"padding: 1px 6px; border-left: 3px solid {COLOR_ADDED}; "
                    f"white-space: pre-wrap;'>+ {_escape_html(line)}</div>"
                )
    return (
        "<div style='font-family: \"SF Mono\", Consolas, \"Courier New\", monospace; "
        "font-size: 12px; line-height: 1.5;'>" + "".join(rows) + "</div>"
    )


class HistoryManager:
    @staticmethod
    def get_history_dir(file_path):
        if not file_path:
            return None
        abs_path = os.path.abspath(file_path)
        path_hash = hashlib.sha256(abs_path.encode('utf-8')).hexdigest()[:16]
        base_name = os.path.basename(abs_path)
        history_dir = Path.home() / ".local" / "state" / "kitab" / "history" / f"{base_name}_{path_hash}"
        return str(history_dir)

    @classmethod
    def save_snapshot(cls, file_path, content):
        if not file_path:
            return

        h_dir = cls.get_history_dir(file_path)
        os.makedirs(h_dir, exist_ok=True)

        # Regra de desduplicação de objetivo: evitar a criação de um novo snapshot se o seu
        # conteúdo (com quebras de linha normalizadas) corresponder a QUALQUER snapshot existente, e não
        # apenas ao mais recente. Isso impede duplicatas mesmo quando a
        # versão correspondente está muito atrás no histórico (por exemplo, conteúdo que
        # foi limpo, depois restaurado e, em seguida, limpo novamente).
        normalized_new = _normalize_newlines(content)
        for snap in cls.list_snapshots(file_path):
            try:
                with open(snap['path'], 'r', encoding='utf-8', errors='ignore') as f:
                    existing = _normalize_newlines(f.read())
                if normalized_new == existing:
                    return
            except Exception:
                continue

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        base_name, ext = os.path.splitext(os.path.basename(file_path))
        snapshot_name = f"{base_name}_{timestamp}{ext}"
        snapshot_path = os.path.join(h_dir, snapshot_name)

        try:
            with open(snapshot_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception:
            pass

        snapshots = cls.list_snapshots(file_path)
        if len(snapshots) > 20:
            oldest = snapshots[-1]['path']
            try:
                os.remove(oldest)
            except OSError:
                pass

    @classmethod
    def list_snapshots(cls, file_path):
        h_dir = cls.get_history_dir(file_path)
        if not h_dir or not os.path.exists(h_dir):
            return []

        snapshots = []
        for filename in os.listdir(h_dir):
            path = os.path.join(h_dir, filename)
            if os.path.isfile(path):
                match = re.search(r"_(\d{8}_\d{6}_\d+)(?:\.[^.]+)?$", filename)
                if match:
                    try:
                        dt = datetime.strptime(match.group(1), "%Y%m%d_%H%M%S_%f")
                        snapshots.append({
                            'path': path,
                            'dt': dt,
                            'filename': filename
                        })
                    except ValueError:
                        continue

        snapshots.sort(key=lambda x: x['dt'])

        formatted_snapshots = []
        for i, snap in enumerate(snapshots):
            display_str = f"Version {i + 1} - {snap['dt'].strftime('%Y/%m/%d %H:%M:%S')}"
            formatted_snapshots.append({
                'path': snap['path'],
                'display': display_str,
                'dt': snap['dt']
            })

        formatted_snapshots.sort(key=lambda x: x['dt'], reverse=True)
        return formatted_snapshots


class HistoryDialog(QDialog):
    def __init__(self, main_window):
        super().__init__(main_window)
        self.main_window = main_window
        self.editor = main_window.editor
        self.setWindowTitle("Version History")
        self.resize(810, 500)

        self.file_path = getattr(self.main_window, 'file_path', None)

        layout = QHBoxLayout(self)

        self.list_widget = QListWidget()
        layout.addWidget(self.list_widget, 1)

        right_layout = QVBoxLayout()
        self.preview_text = QTextEdit()
        self.preview_text.setReadOnly(True)
        self.preview_text.setStyleSheet("background-color: white; color: black;")
        right_layout.addWidget(self.preview_text, 2)

        btn_layout = QHBoxLayout()
        self.restore_btn = QPushButton("Restore Version")
        self.restore_btn.setEnabled(False)
        self.restore_btn.clicked.connect(self.restore_selected)
        btn_layout.addStretch()
        btn_layout.addWidget(self.restore_btn)

        right_layout.addLayout(btn_layout)
        layout.addLayout(right_layout, 2)

        self.list_widget.currentRowChanged.connect(self.load_preview)
        self.load_snapshots()

    def load_snapshots(self):
        self.list_widget.clear()
        if not self.file_path:
            return

        self.snapshots = HistoryManager.list_snapshots(self.file_path)
        current_content = _current_editor_text(self.file_path, self.editor)
        current_lines = current_content.splitlines()

        # Only the FIRST (most recent) snapshot that matches the current
        # content gets the "(current)" tag. If matching content shows up
        # more than once in the history, tagging every match made two
        # different points in time look like "the same version".
        current_tagged = False
        for snap in self.snapshots:
            label = snap['display']
            try:
                with open(snap['path'], 'r', encoding='utf-8', errors='ignore') as f:
                    snap_text = f.read()
            except Exception:
                snap_text = None

            if snap_text is not None:
                _, _, _, status_label, _ = _classify_lines(current_lines, snap_text.splitlines())
                if status_label == "No changes" and not current_tagged:
                    label = "(current) " + label
                    current_tagged = True
                elif status_label != "No changes":
                    label += f"  \u00b7  {status_label}"

            self.list_widget.addItem(label)

    def load_preview(self, index):
        if index < 0 or index >= len(self.snapshots):
            self.preview_text.clear()
            self.restore_btn.setEnabled(False)
            return

        path = self.snapshots[index]['path']
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                snap_content = f.read()

            current_content = _current_editor_text(self.file_path, self.editor)
            current_lines = current_content.splitlines()
            snap_lines = snap_content.splitlines()

            added, removed, modified, status_label, status_color = _classify_lines(
                current_lines, snap_lines
            )

            header = (
                "<div style='color: #666; margin-bottom: 8px; font-family: sans-serif; "
                "font-size: 12px;'>"
                f"Comparing current version with <b>{self.snapshots[index]['display']}</b>"
                f"<br>"
                f"<span style='background:{status_color}22; color:{status_color}; "
                f"padding: 1px 6px; border-radius: 3px; font-weight: 600;'>{status_label}</span>"
                f"&nbsp;&nbsp;<span style='color:{COLOR_ADDED};'>+{added} added</span>"
                f"&nbsp;<span style='color:{COLOR_REMOVED};'>-{removed} removed</span>"
                f"&nbsp;<span style='color:{COLOR_MODIFIED};'>~{modified} changed</span>"
                "</div>"
            )

            self.preview_text.setHtml(header + _render_diff_html(current_lines, snap_lines))
            self.restore_btn.setEnabled(True)
        except Exception as e:
            self.preview_text.setText(f"Error loading preview: {e}")
            self.restore_btn.setEnabled(False)

    def restore_selected(self):
        index = self.list_widget.currentRow()
        if index < 0 or index >= len(self.snapshots):
            return

        path = self.snapshots[index]['path']
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            # Restore with the setter that matches the getter used to
            # capture the snapshot: .md content was saved via toMarkdown(),
            # so it must come back through setMarkdown(), not setPlainText()
            # (otherwise Markdown syntax like ** or # shows up as literal
            # text instead of being rendered).
            if self.file_path and self.file_path.endswith(".md"):
                self.editor.setMarkdown(content)
            else:
                self.editor.setPlainText(content)
            self.editor.document().setModified(True)
            QMessageBox.information(self, "Success", "Version restored successfully.")
            self.accept()
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Could not restore: {e}")


def show_history_dialog(main_window):
    if not getattr(main_window, 'file_path', None):
        QMessageBox.warning(main_window, "Warning", "Save the current file before viewing history.")
        return
    dialog = HistoryDialog(main_window)
    dialog.exec()


# Guard against re-patching: if this plugin file gets loaded more than once
# (e.g. a new window reloading the plugin instead of reusing the already
# imported module), this flag stops _save_file from being wrapped twice,
# which would otherwise create two identical snapshots per real save. The
# flag lives on `menubar` itself, which is shared across windows, so it
# still protects even if "history.py" runs again.
# Guard kept only around the _save_file patch: without it, if this plugin
# file gets loaded more than once, _save_file would be wrapped twice and
# every real save would create two identical snapshots in the history.
if not getattr(menubar, '_history_hooked', False):

    _orig_save_file = menubar._save_file

    def _patched_save_file(self):
        _orig_save_file(self)
        try:
            if self.file_path:
                content = _current_editor_text(self.file_path, self.editor)
                HistoryManager.save_snapshot(self.file_path, content)
        except Exception:
            pass

    menubar._save_file = _patched_save_file
    menubar._history_hooked = True