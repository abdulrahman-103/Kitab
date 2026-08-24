#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QFileDialog, QMenuBar, QPushButton
from PySide6.QtGui import QIcon, QTextImageFormat
from PySide6.QtCore import Qt
from pathlib import Path
from recent_documents import *
from dialogs import PageSetupDialog, InsertTableDialog, InsertLinkDialog
import base64

class MenuBar(QMenuBar):
    def __init__(self, main_window, parent=None):
        super().__init__(parent)
        self.main_window = main_window
        self.editor = self.main_window.editor
        file_menu = self.addMenu("File")

        new_option = file_menu.addAction("New")
        new_icon = QIcon.fromTheme("document-new-symbolic")
        new_option.setIcon(new_icon)
        new_option.triggered.connect(self.editor.new)
        new_option.setShortcut("Ctrl+N")

        open_option = file_menu.addAction("Open")
        open_icon = QIcon.fromTheme("document-open-symbolic")
        open_option.setIcon(open_icon)
        open_option.triggered.connect(self.editor.open_file)
        open_option.setShortcut("Ctrl+O")

        recent_option = file_menu.addAction("Recent Documents")
        recent_icon = QIcon.fromTheme("document-open-recent-symbolic")
        recent_option.setIcon(recent_icon)
        recent_option.triggered.connect(lambda: show_recent_dialog(self.main_window))
        recent_option.setShortcut("Ctrl+H")

        save_option = file_menu.addAction("Save")
        save_icon = QIcon.fromTheme("document-save-symbolic")
        save_option.setIcon(save_icon)
        save_option.triggered.connect(self.editor.save)
        save_option.setShortcut("Ctrl+S")

        save_as_option = file_menu.addAction("Save As")
        save_as_icon = QIcon.fromTheme("document-save-as-symbolic")
        save_as_option.setIcon(save_as_icon)
        save_as_option.triggered.connect(self.editor.save_as)
        save_as_option.setShortcut("Ctrl+Shift+S")

        export_option = file_menu.addAction("Export")
        export_icon = QIcon.fromTheme("document-export-symbolic")
        export_option.setIcon(export_icon)
        export_option.triggered.connect(self.editor.export_file)
        export_option.setShortcut("Ctrl+Shift+E")

        print_option = file_menu.addAction("Print")
        print_icon = QIcon.fromTheme("document-print-symbolic")
        print_option.setIcon(print_icon)
        print_option.triggered.connect(self.editor.print_document)
        print_option.setShortcut("Ctrl+P")

        exit_option = file_menu.addAction("Exit")
        exit_icon = QIcon.fromTheme("application-exit-symbolic")
        exit_option.setIcon(exit_icon)
        exit_option.triggered.connect(self.main_window.app.quit)
        exit_option.setShortcut("Alt+F4")

        insert_menu = self.addMenu("Insert")

        table_option = insert_menu.addAction("Table")
        insert_table_icon = QIcon.fromTheme("insert-table-symbolic")
        table_option.setIcon(insert_table_icon)
        table_option.triggered.connect(self.insert_table)
        table_option.setShortcut("Ctrl+T")

        image_option = insert_menu.addAction("Image")
        insert_image_icon = QIcon.fromTheme("insert-image-symbolic")
        image_option.setIcon(insert_image_icon)
        image_option.triggered.connect(self.insert_image)
        image_option.setShortcut("Ctrl+Shift+I")
        
        link_option = insert_menu.addAction("Link")
        link_icon = QIcon.fromTheme("insert-link-symbolic")
        link_option.setIcon(link_icon)
        link_option.triggered.connect(self.insert_link)
        link_option.setShortcut("Ctrl+K")

        self.horizontal_line_option = insert_menu.addAction("Horizontal Line")
        if self.main_window.color_scheme == Qt.ColorScheme.Dark:
            horizontal_line_icon_path = str(Path(__file__).resolve().parents[2] / "data" / "images" / "insert_horizontal_line_dark.svg")
        elif self.main_window.color_scheme == Qt.ColorScheme.Light:
            horizontal_line_icon_path = str(Path(__file__).resolve().parents[2] / "data" / "images" / "insert_horizontal_line_light.svg")
        horizontal_line_icon = QIcon(horizontal_line_icon_path)
        self.horizontal_line_option.setIcon(horizontal_line_icon)
        self.horizontal_line_option.triggered.connect(self.insert_horizontal_line)
        self.horizontal_line_option.setShortcut("Ctrl+K")

        page = self.addAction("Page")
        page.triggered.connect(self.page_setup)
        #page_margins_option = page_menu.addAction("Page Margins")
        #page_margins_option.triggered.connect(self.page_margins)

        self.main_window.setMenuBar(self)

    def _insert_image(self, path):
        suffix = Path(path).suffix.lower().lstrip('.')
        mime = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png", "gif": "gif", "bmp": "bmp", "svg": "svg+xml"}.get(suffix, suffix)
        with open(path, "rb") as f:
            data = base64.b64encode(f.read()).decode("ascii")
        image_base64 = f"data:image/{mime};base64,{data}"
        cursor = self.editor.textCursor()
        block_format = cursor.blockFormat()
        char_format = cursor.charFormat()
        image_format = QTextImageFormat()
        image_format.setName(image_base64)
        image_format.setWidth(self.editor.base_width * 0.5)
        image_format.merge(char_format)
        
        cursor.insertImage(image_format)
        cursor.setBlockFormat(block_format)
        cursor.setCharFormat(char_format)
        #cursor.insertBlock(block_format, char_format)

    def insert_image(self):
        path, _ = QFileDialog.getOpenFileName(self, "Choose image", self.main_window.last_directory, "Image Files (*.png *.jpg *.jpeg *.bmp *.gif *.svg);;PNG Image (*.png);;JPEG Image (*.jpg *.jpeg);;SVG Image (*.svg);;BMP Image (*.bmp);;GIF Image (*.gif);;All Files (*)")
        if not path:
            return
        self.main_window.last_directory = str(Path(path).parent)
        self._insert_image(path)

    def insert_table(self):
        if getattr(self, "insert_table_dialog", None) is None:
            self.insert_table_dialog = InsertTableDialog(self.editor, self.main_window)
        try:
            self.insert_table_dialog.exec()
        except RuntimeError:
            self.insert_table_dialog = InsertTableDialog(self.editor, self.main_window)
            self.insert_table_dialog.exec()
            
    def insert_link(self):
        if getattr(self, "insert_link_dialog", None) is None:
            self.insert_link_dialog = InsertLinkDialog(self.editor, self.main_window)
        try:
            self.insert_link_dialog.exec()
        except RuntimeError:
            self.insert_link_dialog = InsertLinkDialog(self.editor, self.main_window)
            self.insert_link_dialog.exec()

    def insert_horizontal_line(self):
        cursor = self.editor.textCursor()
        block_format = cursor.blockFormat()
        char_format = cursor.charFormat()
        cursor.insertHtml("<hr>")
        cursor.insertBlock(block_format, char_format)

    def page_setup(self):
        page_setup_dialog = PageSetupDialog(self.editor, self.main_window)
        page_setup_dialog.exec()
        page_setup_dialog.deleteLater()
