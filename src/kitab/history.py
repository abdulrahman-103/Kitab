# Copyright (C) 2026 Abdulrahman
# This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
# This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
# You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import os
import hashlib
from datetime import datetime
from pathlib import Path
from PySide6.QtWidgets import QDialog, QVBoxLayout, QHBoxLayout, QListWidget, QPushButton, QTextEdit, QMessageBox
from PySide6.QtGui import QKeySequence, QAction
from PySide6.QtCore import Qt, QTimer
import menubar

class HistoryManager:
    @staticmethod
    def get_history_dir(file_path):
        # Build a unique, stable directory for this file's snapshots based on its
        # absolute path (hashed) plus the original file name for readability.
        if not file_path:
            return None
        abs_path = os.path.abspath(file_path)
        path_hash = hashlib.md5(abs_path.encode('utf-8')).hexdigest()[:8]
        base_name = os.path.basename(abs_path)
        history_dir = Path.home() / ".kitab" / "history" / f"{base_name}_{path_hash}"
        return str(history_dir)

    @classmethod
    def save_snapshot(cls, file_path, content):
        if not file_path:
            return
        
        h_dir = cls.get_history_dir(file_path)
        os.makedirs(h_dir, exist_ok=True)
        
        snapshots = cls.list_snapshots(file_path)
        if snapshots:
            latest = snapshots[0]['path']
            try:
                with open(latest, 'r', encoding='utf-8', errors='ignore') as f:
                    if content == f.read():
                        return
            except Exception:
                pass
        
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
                try:
                    mtime = os.path.getmtime(path)
                    snapshots.append({
                        'path': path,
                        'time': mtime,
                        'filename': filename
                    })
                except Exception:
                    continue
        
        snapshots.sort(key=lambda x: x['time'])
        
        formatted_snapshots = []
        for i, snap in enumerate(snapshots):
            dt = datetime.fromtimestamp(snap['time'])
            display_str = f"Version {i + 1} - {dt.strftime('%Y/%m/%d %H:%M:%S')}"
            formatted_snapshots.append({
                'path': snap['path'],
                'display': display_str,
                'time': snap['time']
            })
        
        formatted_snapshots.sort(key=lambda x: x['time'], reverse=True)
        return formatted_snapshots

class HistoryDialog(QDialog):
    def __init__(self, main_window):
        super().__init__(main_window)
        self.main_window = main_window
        self.editor = main_window.editor
        self.setWindowTitle("Version History")
        self.resize(700, 450)

        self.file_path = getattr(self.main_window, 'file_path', None)
        
        layout = QHBoxLayout(self)

        self.list_widget = QListWidget()
        layout.addWidget(self.list_widget, 1)

        right_layout = QVBoxLayout()
        self.preview_text = QTextEdit()
        self.preview_text.setReadOnly(True)
        self.preview_text.setStyleSheet("background-color: white; color: black;")
        right_layout.addWidget(self.preview_text, 1)

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
        for snap in self.snapshots:
            self.list_widget.addItem(snap['display'])

    def load_preview(self, index):
        if index < 0 or index >= len(self.snapshots):
            self.preview_text.clear()
            self.restore_btn.setEnabled(False)
            return

        path = self.snapshots[index]['path']
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            self.preview_text.setText(content)
            self.restore_btn.setEnabled(True)
        except Exception:
            self.preview_text.setText("Error loading preview.")
            self.restore_btn.setEnabled(False)

    def restore_selected(self):
        index = self.list_widget.currentRow()
        if index < 0 or index >= len(self.snapshots):
            return

        path = self.snapshots[index]['path']
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
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


# The following block patches the existing menubar module at import time,
# so the history feature can hook into save actions and add its own menu
# entry without modifying menubar.py directly.
if not getattr(menubar, '_history_hooked', False):
    _orig_save_file = menubar._save_file

    def _patched_save_file(self):
        # Run the original save logic first, then take a history snapshot
        # of the saved content based on the file's format.
        _orig_save_file(self)
        try:
            if self.file_path:
                if self.file_path.endswith(".md"):
                    content = self.editor.toMarkdown()
                elif self.file_path.endswith(".ktb"):
                    content = self.editor.toHtml()
                else:
                    content = self.editor.toPlainText()
                HistoryManager.save_snapshot(self.file_path, content)
        except Exception:
            pass

    menubar._save_file = _patched_save_file

    _orig_add_menubar = menubar.add_menubar

    def _patched_add_menubar(self):
        _orig_add_menubar(self)
        
        def force_inject_shortcut():
            for action in self.findChildren(QAction):
                if action.shortcut() == QKeySequence("Ctrl+G"):
                    action.setShortcut(QKeySequence())
            
            for action in self.menubar.actions():
                if action.text().replace("&", "") == "File":
                    file_menu = action.menu()
                    if file_menu:
                        hist_act = file_menu.addAction("Version History")
                        hist_act.setShortcut(QKeySequence("Ctrl+G"))
                        hist_act.setShortcutContext(Qt.ShortcutContext.ApplicationShortcut)
                        hist_act.triggered.connect(lambda: show_history_dialog(self))
                        self.addAction(hist_act)
                    break

        QTimer.singleShot(100, force_inject_shortcut)

    menubar.add_menubar = _patched_add_menubar
    menubar._history_hooked = True