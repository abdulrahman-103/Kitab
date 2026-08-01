#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QFileDialog, QProgressDialog, QDialog
from PySide6.QtGui import QIcon, QPageSize, QPdfWriter, QTextImageFormat
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
from PySide6.QtCore import QTimer, Qt, QSize, QElapsedTimer, QRectF
from pathlib import Path
import zipfile
import json
from recent_documents import *
from dialogs import PageSizeDialog, InsertTableDialog, InsertLinkDialog
import subprocess

def _save_file(self):
    saving = QProgressDialog("Saving...", None, 0, 0, self)
    saving.setWindowTitle("Saving...")
    saving.setWindowModality(Qt.WindowModality.WindowModal)
    save_timer = QElapsedTimer()
    save_timer.start()
    saving.show()

    if self.file_path.endswith(".txt"):
        data = self.editor.toPlainText()
        with open(self.file_path, "w", encoding="utf-8") as file:
            file.write(data)
    elif self.file_path.endswith(".html"):
        data = self.editor.toHtml()
        with open(self.file_path, "w", encoding="utf-8") as file:
            file.write(data)
    elif self.file_path.endswith(".md"):
        data = self.editor.toMarkdown()
        with open(self.file_path, "w", encoding="utf-8") as file:
            file.write(data)
    elif self.file_path.endswith(".ktb"):
        html_data = self.editor.toHtml()
        json_data = {"page size": self.editor.page_size}
        with zipfile.ZipFile(self.file_path, mode="w", compression=zipfile.ZIP_DEFLATED) as zip:
            zip.writestr("document.html", html_data)
            zip.writestr("info.json", json.dumps(json_data))
    elif self.file_path.endswith(".odt"):
        odf_kit = Path(__file__).resolve().parent / "odf-kit"
        js = odf_kit / "html_to_odt.js"
        html = self.editor.toHtml()
        data = subprocess.run(["node", js, self.file_path], cwd=odf_kit, capture_output=True, text=True, input=html)

    self.editor.document().setModified(False)
    self.file_name = Path(self.file_path).name
    self.setWindowTitle(f"{self.file_name}  –  Kitab")

    try:
        register_recent_file(self.file_path)
    except ImportError:
        pass

    time_taken = save_timer.elapsed()
    minimum_time = 500
    if time_taken >= minimum_time:
        saving.close()
    else:
        remaining_time = minimum_time - time_taken
        QTimer.singleShot(remaining_time, saving.close)

def save(self):
    if not self.file_path:
        self.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", self.last_directory, "Kitab Document (*.ktb);;ODF Text Document (*.odt);;Text (*.txt);;Markdown File  (*.md);;HTML Document (*.html)")
        if not self.file_path:
            return "canceled"
        self.last_directory = str(Path(self.file_path).parent)
        _save_file(self)
    else:
        _save_file(self)

def save_as(self, show_dialog=True):
    file_path, format_filter = self.file_path, self.format_filter
    self.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", self.last_directory, "Kitab Document (*.ktb);;ODF Text Document (*.odt);;Text (*.txt);;Markdown File  (*.md);;HTML Document (*.html)")
    if not self.file_path:
        self.file_path, self.format_filter = file_path, format_filter
    else:
        self.last_directory = str(Path(self.file_path).parent)
        _save_file(self)

def new(self):
    self.setWindowTitle("Kitab")
    self.file_path = None
    self.format_filter = None
    self.file_name = None
    self.editor.clear()
    self.editor.document().setModified(False)
    self.view.viewport().setFocus()
    self.editor.setFocus()

def _open_file(self):
    if self.file_path.endswith(".ktb"):
        with zipfile.ZipFile(self.file_path, "r") as zip:
            html_data = zip.read("document.html").decode("utf-8")
            json_data = json.loads(zip.read("info.json").decode("utf-8"))
        self.editor.setHtml(html_data)
        apply_page_size(self, json_data["page size"])
    elif self.file_path.endswith(".html"):
        with open(self.file_path, "r", encoding="utf-8") as file:
            html_data = file.read()
        self.editor.setHtml(html_data)
        apply_page_size(self, json_data["page size"])
    elif self.file_path.endswith(".txt"):
        with open(self.file_path, "r", encoding="utf-8") as file:
            data = file.read()
            self.editor.setPlainText(data)
    elif self.file_path.endswith(".md"):
        with open(self.file_path, "r", encoding="utf-8") as file:
            data = file.read()
            self.editor.setMarkdown(data)
    elif self.file_path.endswith(".odt"):
        odf_kit = Path(__file__).resolve().parent / "odf-kit"
        js = odf_kit / "odt_to_html.js"
        data = subprocess.run(["node", js, self.file_path], cwd=odf_kit, capture_output=True, text=True)
        self.editor.setHtml(data.stdout)

    self.editor.document().setModified(False)
    self.editor.document().setPageSize(QSize(self.editor.base_width, self.editor.base_height))
    total_pages = self.editor.document().pageCount()
    self.editor.setFixedSize(self.editor.width(), total_pages * self.editor.base_height)
    self.file_name = Path(self.file_path).name
    self.setWindowTitle(f"{self.file_name}  –  Kitab")

    try:
        register_recent_file(self.file_path)
    except ImportError:
        pass

def open_file(self):
    self.file_path, self.format_filter = QFileDialog.getOpenFileName(self, "Open", self.last_directory, "Kitab, Text, Markdown, ODF Text Documents and HTML Documents (*.ktb *.odt *.txt *.md *.html);;Kitab Document (*.ktb);;ODF Text Document (*.odt);;Text (*.txt);;Markdown File (*.md);;HTML Document (*.html)")
    if not self.file_path:
        return
    self.last_directory = str(Path(self.file_path).parent)
    _open_file(self)

def export_file(self):
    file_path, format_filter = QFileDialog.getSaveFileName(self, "Export file", self.last_directory, "PDF File (*.pdf)")
    if not file_path:
        return
    self.last_directory = str(Path(file_path).parent)
    exporting = QProgressDialog("Exporting...", None, 0, 0, self)
    exporting.setWindowTitle("Exporting...")
    exporting.setWindowModality(Qt.WindowModality.WindowModal)
    export_timer = QElapsedTimer()
    export_timer.start()
    exporting.show()
    pdf_writer = QPdfWriter(file_path)
    pdf_writer.setPageSize(QPageSize(QSize(self.editor.base_width, self.editor.base_height)))
    document = self.editor.document()
    document.print_(pdf_writer)
    time_taken = export_timer.elapsed()
    minimum_time = 500
    if time_taken >= minimum_time:
        exporting.close()
    else:
        remaining_time = minimum_time - time_taken
        QTimer.singleShot(remaining_time, exporting.close)

def print_document(self):
    printer = QPrinter(QPrinter.PrinterMode.HighResolution)
    printer.setPageSize(QPageSize(QSize(self.editor.base_width, self.editor.base_height)))
    dialog = QPrintDialog(printer, self)
    if dialog.exec() == QDialog.DialogCode.Accepted:
        self.editor.document().print_(printer)

def insert_image(self):
    path, _ = QFileDialog.getOpenFileName(self, "Choose image", self.last_directory, "Image Files (*.png *.jpg *.jpeg *.bmp *.gif *.svg);;PNG Image (*.png);;JPEG Image (*.jpg *.jpeg);;SVG Image (*.svg);;BMP Image (*.bmp);;GIF Image (*.gif);;All Files (*)")
    if not path:
        return
    self.last_directory = str(Path(path).parent)
    image_format = QTextImageFormat()
    image_format.setName(path)
    image_format.setWidth(self.editor.base_width - 100)
    cursor = self.editor.textCursor()
    block_format = cursor.blockFormat()
    char_format = cursor.charFormat()
    cursor.insertImage(image_format)
    cursor.setBlockFormat(block_format)
    cursor.setCharFormat(char_format)
    cursor.insertBlock(block_format, char_format)

def insert_table(self):
    if getattr(self, "insert_table_dialog", None) is None:
        self.insert_table_dialog = InsertTableDialog(self.editor, self)
    try:
        self.insert_table_dialog.exec()
    except RuntimeError:
        self.insert_table_dialog = InsertTableDialog(self.editor, self)
        self.insert_table_dialog.exec()
        
def insert_link(self):
    if getattr(self, "insert_link_dialog", None) is None:
        self.insert_link_dialog = InsertLinkDialog(self.editor, self)
    try:
        self.insert_link_dialog.exec()
    except RuntimeError:
        self.insert_link_dialog = InsertLinkDialog(self.editor, self)
        self.insert_link_dialog.exec()

def insert_horizontal_line(self):
    cursor = self.editor.textCursor()
    block_format = cursor.blockFormat()
    char_format = cursor.charFormat()
    cursor.insertHtml("<hr>")
    cursor.insertBlock(block_format, char_format)

def page_size(self):
    if getattr(self, "page_size_dialog", None) is None:
        self.page_size_dialog = PageSizeDialog(self.editor, self)
    try:
        self.page_size_dialog.exec()
    except RuntimeError:
        self.page_size_dialog = PageSizeDialog(self.editor, self)
        self.page_size_dialog.exec()

def apply_page_size(self, size):
    name = size
    width, height = self.editor.PAGE_SIZES[name]
    self.editor.page_size = name
    self.editor.base_width = width
    self.editor.base_height = height
    self.editor.document().setPageSize(QSize(width, height))
    self.editor.page_count = self.editor.document().pageCount()
    self.editor.setMinimumSize(width, height)
    self.editor.setFixedSize(width, self.editor.page_count * height)
    self.scene.setSceneRect(QRectF(self.editor.rect()))
    self.editor.document().setPageSize(QSize(width, height))
    self.editor.page_count = self.editor.document().pageCount()


def add_menubar(self):
    self.menubar = self.menuBar()

    file_menu = self.menubar.addMenu("File")

    new_option = file_menu.addAction("New")
    new_icon = QIcon.fromTheme("document-new-symbolic")
    new_option.setIcon(new_icon)
    new_option.triggered.connect(lambda: new(self))
    new_option.setShortcut("Ctrl+N")

    open_option = file_menu.addAction("Open")
    open_icon = QIcon.fromTheme("document-open-symbolic")
    open_option.setIcon(open_icon)
    open_option.triggered.connect(lambda: open_file(self))
    open_option.setShortcut("Ctrl+O")

    recent_option = file_menu.addAction("Recent Documents")
    recent_icon = QIcon.fromTheme("document-open-recent-symbolic")
    recent_option.setIcon(recent_icon)
    recent_option.triggered.connect(lambda: show_recent_dialog(self))
    recent_option.setShortcut("Ctrl+H")

    save_option = file_menu.addAction("Save")
    save_icon = QIcon.fromTheme("document-save-symbolic")
    save_option.setIcon(save_icon)
    save_option.triggered.connect(lambda: save(self))
    save_option.setShortcut("Ctrl+S")

    save_as_option = file_menu.addAction("Save As")
    save_as_icon = QIcon.fromTheme("document-save-as-symbolic")
    save_as_option.setIcon(save_as_icon)
    save_as_option.triggered.connect(lambda: save_as(self))
    save_as_option.setShortcut("Ctrl+Shift+S")

    export_option = file_menu.addAction("Export")
    export_icon = QIcon.fromTheme("document-export-symbolic")
    export_option.setIcon(export_icon)
    export_option.triggered.connect(lambda: export_file(self))
    export_option.setShortcut("Ctrl+Shift+E")

    print_option = file_menu.addAction("Print")
    print_icon = QIcon.fromTheme("document-print-symbolic")
    print_option.setIcon(print_icon)
    print_option.triggered.connect(lambda: print_document(self))
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
    table_option.triggered.connect(lambda: insert_table(self))
    table_option.setShortcut("Ctrl+T")

    image_option = insert_menu.addAction("Image")
    insert_image_icon = QIcon.fromTheme("insert-image-symbolic")
    image_option.setIcon(insert_image_icon)
    image_option.triggered.connect(lambda: insert_image(self))
    image_option.setShortcut("Ctrl+I")
    
    link_option = insert_menu.addAction("Link")
    link_icon = QIcon.fromTheme("insert-link-symbolic")
    link_option.setIcon(link_icon)
    link_option.triggered.connect(lambda: insert_link(self))
    link_option.setShortcut("Ctrl+K")

    self.horizontal_line_option = insert_menu.addAction("Horizontal Line")
    if self.color_scheme == Qt.ColorScheme.Dark:
        horizontal_line_icon_path = str(Path(__file__).resolve().parent / "images" / "insert_horizontal_line_dark.svg")
    elif self.color_scheme == Qt.ColorScheme.Light:
        horizontal_line_icon_path = str(Path(__file__).resolve().parent / "images" / "insert_horizontal_line_light.svg")
    horizontal_line_icon = QIcon(horizontal_line_icon_path)
    self.horizontal_line_option.setIcon(horizontal_line_icon)
    self.horizontal_line_option.triggered.connect(lambda: insert_horizontal_line(self))
    self.horizontal_line_option.setShortcut("Ctrl+K")

    page_menu = self.menubar.addMenu("Page")

    page_size_option = page_menu.addAction("Page Size")
    page_size_option.triggered.connect(lambda: page_size(self))

    #page_margins_option = page_menu.addAction("Page Margins")
    #page_margins_option.triggered.connect(self.page_margins)
