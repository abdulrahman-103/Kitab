#Copyright (C) 2026 Abdulrahman 103 and Kitab contributors
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

import json
from pathlib import Path
from PySide6.QtWidgets import QDialog, QVBoxLayout, QListWidget, QListWidgetItem
from PySide6.QtGui import QPalette
from PySide6.QtCore import QStandardPaths

def register_recent_file(file_path):
    if not file_path:
        return
    try:
        history_file = Path(QStandardPaths.writableLocation(QStandardPaths.StandardLocation.StateLocation)) / "recent_history.json"
        history_file.parent.mkdir(parents=True, exist_ok=True)
        history = []
        if history_file.exists():
            try:
                with open(history_file, "r", encoding="utf-8") as file:
                    history = json.load(file)
            except json.JSONDecodeError:
                history = []
        
        if file_path in history:
            history.remove(file_path)
        history.insert(0, file_path)
        
        # limits the history length to 10 entries
        history = history[:10]
        
        with open(history_file, "w", encoding="utf-8") as file:
            json.dump(history, file, ensure_ascii=False)
    except OSError:
        return

def show_recent_dialog(main_window):
    history_file = Path(QStandardPaths.writableLocation(QStandardPaths.StandardLocation.StateLocation)) / "recent_history.json"
    if not history_file.exists():
        return
    try:
        with open(history_file, "r", encoding="utf-8") as file:
            files = json.load(file)
            # removes deleted paths from variable
            files_after_deletion = [path for path in files if Path(path).exists()]

        # removes deleted paths from file if files got deleted
        if len(files_after_deletion) != len(files):
            with open(history_file, "w", encoding="utf-8") as file:
                json.dump(files_after_deletion, file, ensure_ascii=False)
                files = files_after_deletion
        
    except json.JSONDecodeError:
        history_file.unlink(missing_ok=True)
        return
    except OSError:
        return
        
    if not files:
        return

    dialog = RecentFilesDialog(files, main_window)
    if dialog.exec() == QDialog.DialogCode.Accepted and dialog.selected_file:
        main_window.file_path = dialog.selected_file
        main_window.editor._open_file()

class RecentFilesDialog(QDialog):
    def __init__(self, files, main_window):
        super().__init__(main_window)
        self.main_window = main_window
        self.selected_file = None
        self.setWindowTitle(self.tr("Recent Documents"))
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.list_widget = QListWidget()
        font = self.font()
        font.setPointSizeF(font.pointSizeF() * 1.25)
        self.list_widget.setFont(font)
        self.list_widget.setSpacing(5)
        self.palette = self.main_window.app.palette()
        
        self.background_color = self.palette.color(QPalette.ColorRole.Dark)
        self.selected_text_color = self.palette.color(QPalette.ColorRole.Highlight)
        self.selected_item_color = self.palette.color(QPalette.ColorRole.Window)
        self.stylesheet = f"""
            QListWidget::item {{
                padding: 8px;
            }}
            QListWidget::item:selected {{
                background-color: {self.selected_item_color.name()};
                color: {self.selected_text_color.name()};
            }}
        """
        self.list_widget.setStyleSheet(self.stylesheet)

        for file in files:
            item = QListWidgetItem(Path(file).name)
            item.setToolTip(file)
            item.path = file
            self.list_widget.addItem(item)
            
        self.list_widget.setCurrentRow(0)
        layout.addWidget(self.list_widget)
        self.list_widget.itemActivated.connect(self._accept_selection)
        self.list_widget.itemClicked.connect(self._accept_selection)
    
        self.resize(self.sizeHint() * 2)

    def _accept_selection(self, item):
        self.selected_file = item.path
        self.accept()
