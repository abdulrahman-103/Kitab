#Copyright (C) 2026 Abdulrahman 103 and Kitab contributors
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QFileDialog, QMenuBar, QPushButton
from PySide6.QtGui import QIcon
from PySide6.QtCore import Qt
from pathlib import Path
from recent_documents import *


class MenuBar(QMenuBar):
    def __init__(self, main_window, parent=None):
        super().__init__(parent)
        self.main_window = main_window
        self.editor = self.main_window.editor
        file_menu = self.addMenu(self.tr("File"))

        new_option = file_menu.addAction(self.tr("New"))
        new_icon = QIcon.fromTheme("document-new-symbolic")
        new_option.setIcon(new_icon)
        new_option.triggered.connect(self.editor.new)
        new_option.setShortcut("Ctrl+N")

        open_option = file_menu.addAction(self.tr("Open"))
        open_icon = QIcon.fromTheme("document-open-symbolic")
        open_option.setIcon(open_icon)
        open_option.triggered.connect(self.editor.open_file)
        open_option.setShortcut("Ctrl+O")

        recent_option = file_menu.addAction(self.tr("Recent Documents"))
        recent_icon = QIcon.fromTheme("document-open-recent-symbolic")
        recent_option.setIcon(recent_icon)
        recent_option.triggered.connect(lambda: show_recent_dialog(self.main_window))
        recent_option.setShortcut("Ctrl+H")

        save_option = file_menu.addAction(self.tr("Save"))
        save_icon = QIcon.fromTheme("document-save-symbolic")
        save_option.setIcon(save_icon)
        save_option.triggered.connect(self.editor.save)
        save_option.setShortcut("Ctrl+S")

        save_as_option = file_menu.addAction(self.tr("Save As"))
        save_as_icon = QIcon.fromTheme("document-save-as-symbolic")
        save_as_option.setIcon(save_as_icon)
        save_as_option.triggered.connect(self.editor.save_as)
        save_as_option.setShortcut("Ctrl+Shift+S")

        export_option = file_menu.addAction(self.tr("Export"))
        export_icon = QIcon.fromTheme("document-export-symbolic")
        export_option.setIcon(export_icon)
        export_option.triggered.connect(self.editor.export_file)
        export_option.setShortcut("Ctrl+Shift+E")

        print_option = file_menu.addAction(self.tr("Print"))
        print_icon = QIcon.fromTheme("document-print-symbolic")
        print_option.setIcon(print_icon)
        print_option.triggered.connect(self.editor.print_document)
        print_option.setShortcut("Ctrl+P")

        exit_option = file_menu.addAction(self.tr("Exit"))
        exit_icon = QIcon.fromTheme("application-exit-symbolic")
        exit_option.setIcon(exit_icon)
        exit_option.triggered.connect(self.main_window.app.quit)
        exit_option.setShortcut("Alt+F4")

        insert_menu = self.addMenu(self.tr("Insert"))

        table_option = insert_menu.addAction(self.tr("Table"))
        insert_table_icon = QIcon.fromTheme("insert-table-symbolic")
        table_option.setIcon(insert_table_icon)
        table_option.triggered.connect(self.editor.insert_table)

        image_option = insert_menu.addAction(self.tr("Image"))
        insert_image_icon = QIcon.fromTheme("insert-image-symbolic")
        image_option.setIcon(insert_image_icon)
        image_option.triggered.connect(self.editor.insert_image)
        
        link_option = insert_menu.addAction(self.tr("Link"))
        link_icon = QIcon.fromTheme("insert-link-symbolic")
        link_option.setIcon(link_icon)
        link_option.triggered.connect(self.editor.insert_link)

        self.horizontal_line_option = insert_menu.addAction(self.tr("Horizontal Line"))
        if self.main_window.color_scheme == Qt.ColorScheme.Dark:
            horizontal_line_icon_path = str(Path(__file__).resolve().parents[2] / "resources" / "icons" / "insert_horizontal_line_dark.svg")
        elif self.main_window.color_scheme == Qt.ColorScheme.Light:
            horizontal_line_icon_path = str(Path(__file__).resolve().parents[2] / "resources" / "icons" / "insert_horizontal_line_light.svg")
        horizontal_line_icon = QIcon(horizontal_line_icon_path)
        self.horizontal_line_option.setIcon(horizontal_line_icon)
        self.horizontal_line_option.triggered.connect(self.editor.insert_horizontal_line)

        page = self.addAction(self.tr("Page"))
        page.triggered.connect(self.editor.page_layout)
        #page_margins_option = page_menu.addAction("Page Margins")
        #page_margins_option.triggered.connect(self.page_margins)

        self.main_window.setMenuBar(self)