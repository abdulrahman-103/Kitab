#Copyright (C) <2026> <Abdulrahman>
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import os
import json
from pathlib import Path
from PySide6.QtWidgets import QDialog, QVBoxLayout, QListWidget, QListWidgetItem
from PySide6.QtCore import Qt
from PySide6.QtGui import QShortcut, QKeySequence, QPalette

HISTORY_FILE = Path(os.path.expanduser("~/.local/state/kitab/recent_history.json"))

def register_recent_file(file_path):
    if not file_path:
        return
    try:
        HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        history = []
        if HISTORY_FILE.exists():
            try:
                with open(HISTORY_FILE, "r", encoding="utf-8") as file:
                    history = json.load(file)
            except json.JSONDecodeError:
                pass 
        
        if file_path in history:
            history.remove(file_path)
        history.insert(0, file_path)
        
        # limits the history length to 10 entries
        history = history[:10]
        
        with open(HISTORY_FILE, "w", encoding="utf-8") as file:
            json.dump(history, file, ensure_ascii=False)
    except Exception:
        pass

def _show_recent_dialog(main_window):
    if not HISTORY_FILE.exists():
        return
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as file:
            files = json.load(file)
            # removes deleted paths from variable
            files_after_deletion = [path for path in files if Path(path).exists()]

        # removes deleted paths from file if files got deleted
        if len(files_after_deletion) != len(files):
            with open(HISTORY_FILE, "w", encoding="utf-8") as file:
                json.dump(files_after_deletion, file, ensure_ascii=False)
                files = files_after_deletion
        
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
    def __init__(self, files, main_window):
        super().__init__(main_window)
        self.main_window = main_window
        self.selected_file = None
        self.setWindowTitle("Recent Documents")
        self.setWindowFlags(Qt.WindowType.Dialog)
        self.setFixedSize(self.main_window.size_unit * 15, self.main_window.size_unit * 10)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.list_widget = QListWidget()
        
        self.palette = self.main_window.app.palette()
        self.background_color = self.palette.color(QPalette.ColorRole.Dark)
        self.selected_text_color = self.palette.color(QPalette.ColorRole.Highlight)
        self.selected_item_color = self.palette.color(QPalette.ColorRole.Window)
        self.stylesheet = f"""
            QListWidget {{
                background-color: {self.background_color.name()};
                color: #ffffff;
                font-size: 12pt;
                padding: 5px;
            }}
            QListWidget::item {{
                padding: 8px;
            }}
            QListWidget::item:selected {{
                background-color: {self.selected_item_color.name()};
                color: {self.selected_text_color.name()};
            }}
        """
        self.list_widget.setStyleSheet(self.stylesheet)
        self.main_window.app.styleHints().colorSchemeChanged.connect(self.update_stylesheet)

        for file in files:
            item = QListWidgetItem(Path(file).name)
            item.setToolTip(file)
            item.setData(Qt.ItemDataRole.UserRole, file)
            self.list_widget.addItem(item)
            
        self.list_widget.setCurrentRow(0)
        layout.addWidget(self.list_widget)
        self.list_widget.itemActivated.connect(self._accept_selection)
        self.list_widget.itemClicked.connect(self._accept_selection)
    
    def update_stylesheet(self):
        self.palette = self.main_window.app.palette()
        self.background_color = self.palette.color(QPalette.ColorRole.Dark)
        self.selected_text_color = self.palette.color(QPalette.ColorRole.Highlight)
        self.selected_item_color = self.palette.color(QPalette.ColorRole.Window)
        self.stylesheet = f"""
            QListWidget {{
                background-color: {self.background_color.name()};
                color: #ffffff;
                font-size: 12pt;
                padding: 5px;
            }}
            QListWidget::item {{
                padding: 8px;
            }}
            QListWidget::item:selected {{
                background-color: {self.selected_item_color.name()};
                color: {self.selected_text_color.name()};
            }}
        """
        self.list_widget.setStyleSheet(self.stylesheet)

    def _accept_selection(self, item):
        self.selected_file = item.data(Qt.ItemDataRole.UserRole)
        self.accept()
