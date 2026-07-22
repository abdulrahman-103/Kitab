#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtGui import QIcon
from recent_documents import _show_recent_dialog

def add_menubar(self):
        self.menubar = self.menuBar()

        file_menu = self.menubar.addMenu("File")

        new_option = file_menu.addAction("New")
        new_icon = QIcon.fromTheme("document-new-symbolic")
        new_option.setIcon(new_icon)
        new_option.triggered.connect(self.new)
        new_option.setShortcut("Ctrl+N")

        open_option = file_menu.addAction("Open")
        open_icon = QIcon.fromTheme("document-open-symbolic")
        open_option.setIcon(open_icon)
        open_option.triggered.connect(self.open)
        open_option.setShortcut("Ctrl+O")

        recent_option = file_menu.addAction("Recent Documents")
        recent_icon = QIcon.fromTheme("document-open-recent-symbolic")
        recent_option.setIcon(recent_icon)
        recent_option.triggered.connect(lambda: _show_recent_dialog(self))
        recent_option.setShortcut("Ctrl+H")

        save_option = file_menu.addAction("Save")
        save_icon = QIcon.fromTheme("document-save-symbolic")
        save_option.setIcon(save_icon)
        save_option.triggered.connect(self.save)
        save_option.setShortcut("Ctrl+S")

        save_as_option = file_menu.addAction("Save As")
        save_as_icon = QIcon.fromTheme("document-save-as-symbolic")
        save_as_option.setIcon(save_as_icon)
        save_as_option.triggered.connect(self.save_as)
        save_as_option.setShortcut("Ctrl+Shift+S")

        export_option = file_menu.addAction("Export")
        export_icon = QIcon.fromTheme("document-export-symbolic")
        export_option.setIcon(export_icon)
        export_option.triggered.connect(self.export_file)
        export_option.setShortcut("Ctrl+Shift+E")

        print_option = file_menu.addAction("Print")
        print_icon = QIcon.fromTheme("document-print-symbolic")
        print_option.setIcon(print_icon)
        print_option.triggered.connect(self.print_document)
        print_option.setShortcut("Ctrl+P")

        exit_option = file_menu.addAction("Exit")
        exit_icon = QIcon.fromTheme("application-exit-symbolic")
        exit_option.setIcon(exit_icon)
        exit_option.triggered.connect(self.app.quit)
        exit_option.setShortcut("Alt+F4")

        insert_menu = self.menubar.addMenu("Insert")

        table_option = insert_menu.addAction("Table")
        insert_table_icon = QIcon.fromTheme("insert-table-symbolic")
        table_option.setIcon(insert_table_icon)
        table_option.triggered.connect(self.insert_table)
        table_option.setShortcut("Ctrl+T")

        image_option = insert_menu.addAction("Image")
        insert_image_icon = QIcon.fromTheme("insert-image-symbolic")
        image_option.setIcon(insert_image_icon)
        image_option.triggered.connect(self.insert_image)
        image_option.setShortcut("Ctrl+I")

        page_menu = self.menubar.addMenu("Page")

        page_size_option = page_menu.addAction("Page Size")
        page_size_option.triggered.connect(self.page_size)

        page_margins_option = page_menu.addAction("Page Margins")
        #page_margins_option.triggered.connect(self.page_margins)