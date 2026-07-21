#Copyright (C) <2026> <Abdulrahman>
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import os
import json
from pathlib import Path
from PySide6.QtWidgets import QDialog, QVBoxLayout, QListWidget, QListWidgetItem
from PySide6.QtCore import Qt
from PySide6.QtGui import QShortcut, QKeySequence

HISTORY_FILE = Path(os.path.expanduser("~/.local/state/kitab/recent_history.json"))

def register_recent_file(file_path):
    if not file_path:
        return
    try:
        HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        history = []
        if HISTORY_FILE.exists():
            try:
                with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                    history = json.load(f)
            except json.JSONDecodeError:
                pass 
        
        if file_path in history:
            history.remove(file_path)
        history.insert(0, file_path)
        
        # limits the history length to 10 entries
        history = history[:10]
        
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False)
    except Exception:
        pass

def setup_recent_shortcuts(main_window):
    main_window.recent_shortcut = QShortcut(QKeySequence("Ctrl+H"), main_window)
    main_window.recent_shortcut.activated.connect(lambda: _show_recent_dialog(main_window))

def _show_recent_dialog(main_window):
    if not HISTORY_FILE.exists():
        return
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            files = json.load(f)
    except json.JSONDecodeError:
        HISTORY_FILE.unlink(missing_ok=True)
        return
    except Exception:
        return
        
    if not files:
        return

    dialog = RecentFilesDialog(files, main_window)
    if dialog.exec() == QDialog.DialogCode.Accepted and dialog.selected_file:
        main_window.file_path = dialog.selected_file
        main_window._open_file()

class RecentFilesDialog(QDialog):
    def __init__(self, files, parent):
        super().__init__(parent)
        self.selected_file = None
        self.setWindowTitle("Recent Files")
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setFixedSize(500, 300)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.list_widget = QListWidget()
        self.list_widget.setStyleSheet("""
            QListWidget {
                background-color: #252526;
                border: 1px solid #3c3c3c;
                border-radius: 6px;
                color: #ffffff;
                font-size: 12pt;
                padding: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-radius: 4px;
            }
            QListWidget::item:selected {
                background-color: #37373d;
                color: #007acc;
            }
        """)
        
        for f in files:
            item = QListWidgetItem(Path(f).name)
            item.setToolTip(f)
            item.setData(Qt.ItemDataRole.UserRole, f)
            self.list_widget.addItem(item)
            
        self.list_widget.setCurrentRow(0)
        layout.addWidget(self.list_widget)
        
        self.list_widget.itemActivated.connect(self._accept_selection)
        
    def _accept_selection(self, item):
        self.selected_file = item.data(Qt.ItemDataRole.UserRole)
        self.accept()

    def keyPressEvent(self, event):
        if event.key() == Qt.Key.Key_Escape:
            self.reject()
        elif event.key() in (Qt.Key.Key_Return, Qt.Key.Key_Enter):
            current_item = self.list_widget.currentItem()
            if current_item:
                self._accept_selection(current_item)
        else:
            super().keyPressEvent(event)
