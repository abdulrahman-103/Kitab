#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QTextEdit, QMenu, QSizePolicy, QDialog, QProgressDialog, QFileDialog
from PySide6.QtGui import QIcon, QPainter, QCursor, QTextCursor, QTextBlockFormat, QTextOption, QTextCharFormat, QPageSize, QPdfWriter
from PySide6.QtCore import Qt, QRectF, QSizeF, QTimer, QElapsedTimer
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
import zipfile
import subprocess
import json
from pathlib import Path
from dialogs import InsertLinkDialog
from vector2 import Vector2
from recent_documents import *

class Editor(QTextEdit):
    def __init__(self, main_window):
        super().__init__()
        self.unit = "millimeter"
        self.PAGE_SIZES = {
        "A4": Vector2(210, 297),
        "A5": Vector2(148, 210),
        "Letter": Vector2(215.9, 279.4),
        "Legal": Vector2(215.9, 355.6),
        }
        self.DEFAULT_FONT_SIZE = 14
        self.DEFAULT_PAPER_COLOR = "white"
        self.DEFAULT_FONT_COLOR = "black"
        self.DEFAULT_PAGE_SIZE = self.PAGE_SIZES["A4"]
        self.DEFAULT_LINE_SPACING = 120
        self.set_line_spacing(self.DEFAULT_LINE_SPACING)

        self.last_char_format = None
        self.last_font = None
        self.text_alignment = Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignAbsolute
        self.set_paper_and_font_color(self.DEFAULT_PAPER_COLOR, self.DEFAULT_FONT_COLOR)
        if self.unit == "inch":
            self.page_size = self.DEFAULT_PAGE_SIZE.inches_to_mm()
        else:
            self.page_size = self.DEFAULT_PAGE_SIZE
        self.base_width, self.base_height = self.DEFAULT_PAGE_SIZE.mm_to_pixels()
        self.main_window = main_window
        self.setMinimumSize(self.base_width, self.base_height)
        self.document().setPageSize(QSizeF(self.base_width, self.base_height))
        self.document().setDocumentMargin(20*(96/25.4))
        self.page_count = self.document().pageCount()
        
        text_option = self.document().defaultTextOption()
        text_option.setFlags(text_option.flags() | QTextOption.Flag.IncludeTrailingSpaces)
        self.document().setDefaultTextOption(text_option)

        self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)

        self.setFontPointSize(self.DEFAULT_FONT_SIZE)
        font = self.font()
        font.setPointSize(self.DEFAULT_FONT_SIZE)
        self.setFont(font)
        self.DEFAULT_FONT = font
        self.DEFAULT_CHAR_FORMAT = QTextCharFormat()
        self.textChanged.connect(self.check_page_limit)
        self.textChanged.connect(self.preserve_font_when_empty_page)
        self.was_zooming = False 
        self.document().setModified(False)
    
    def dropEvent(self, event): # drag and drop files
        print(555)
        if event.mimeData().hasUrls():
            path_list = event.mimeData().urls()
            if len(path_list) == 1:
                path = path_list[0].toLocalFile()
                if path.endswith((".txt", ".ktb", "docx", ".md", ".odt", ".html")):
                    self.main_window.file_path = path
                    self._open_file()
                if path.endswith(("jpg", "jpeg", "png", "gif", "bmp", "svg")):
                    pos = event.position().toPoint()
                    cursor = self.cursorForPosition(pos)
                    self.setTextCursor(cursor)
                    self.main_window.menubar._insert_image(path)
            event.acceptProposedAction()
        else:
            super().dropEvent(event)

    def apply_page_size(self, size):
        if self.unit == "inch":
            width, height = size.inches_to_pixels().x, size.inches_to_pixels().y
        else:
            width, height = size.mm_to_pixels().x, size.mm_to_pixels().y
        self.page_size = size
        self.base_width = width
        self.base_height = height
        self.document().setPageSize(QSizeF(width, height))
        self.page_count = self.document().pageCount()
        self.setMinimumSize(width, height)
        self.setFixedSize(width, self.page_count * height)
        self.main_window.scene.setSceneRect(QRectF(self.rect()))
        self.document().setPageSize(QSizeF(width, height))
        self.page_count = self.document().pageCount()
        self.main_window.default_zoom_factor = self.main_window.resolution.height() / self.base_height / 1.25
        self.main_window.zoom("reset")

    def print_document(self):
        printer = QPrinter(QPrinter.PrinterMode.HighResolution)
        if self.unit == "inch":
            printer.setPageSize(QPageSize(QSizeF(self.page_size.x, self.page_size.y), QPageSize.Unit.Inch))
        else:
            printer.setPageSize(QPageSize(QSizeF(self.page_size.x, self.page_size.y), QPageSize.Unit.Millimeter))
        dialog = QPrintDialog(printer, self.main_window)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.document().print_(printer)

    def export_file(self):
        file_path, _format_filter = QFileDialog.getSaveFileName(self.main_window, "Export file", self.main_window.last_directory, "PDF Document (*.pdf)")
        if not file_path:
            return
        self.main_window.last_directory = str(Path(file_path).parent)
        exporting = QProgressDialog("Exporting...", None, 0, 0, self.main_window)
        exporting.setWindowTitle("Exporting...")
        exporting.setWindowModality(Qt.WindowModality.WindowModal)
        export_timer = QElapsedTimer()
        export_timer.start()
        exporting.show()
        pdf_writer = QPdfWriter(file_path)
        if self.unit == "inch":
            pdf_writer.setPageSize(QPageSize(QSizeF(self.page_size.x, self.page_size.y), QPageSize.Unit.Inch))
        else:
            pdf_writer.setPageSize(QPageSize(QSizeF(self.page_size.x, self.page_size.y), QPageSize.Unit.Millimeter))
        self.document().print_(pdf_writer)
        time_taken = export_timer.elapsed()
        minimum_time = 500
        if time_taken >= minimum_time:
            exporting.close()
        else:
            remaining_time = minimum_time - time_taken
            QTimer.singleShot(remaining_time, exporting.close)

    def _save_file(self):
        saving = QProgressDialog("Saving...", None, 0, 0, self.main_window)
        saving.setWindowTitle("Saving...")
        saving.setWindowModality(Qt.WindowModality.WindowModal)
        save_timer = QElapsedTimer()
        save_timer.start()
        saving.show()

        if self.main_window.file_path.endswith(".txt"):
            data = self.toPlainText()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif self.main_window.file_path.endswith(".html"):
            data = self.toHtml()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif self.main_window.file_path.endswith(".md"):
            data = self.toMarkdown()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif self.main_window.file_path.endswith(".ktb"):
            html_data = self.toHtml()
            json_data = {
                        "page size": self.page_size.to_tuple(),
                        "unit": self.unit,
                        "line spacing": self.line_spacing
                        }
            with zipfile.ZipFile(self.main_window.file_path, mode="w") as zip:
                zip.writestr("mimetype", "application/prs.ktb+zip", compress_type=zipfile.ZIP_STORED)
                zip.writestr("document.html", html_data, compress_type=zipfile.ZIP_DEFLATED)
                zip.writestr("info.json", json.dumps(json_data), compress_type=zipfile.ZIP_DEFLATED)
        elif self.main_window.file_path.endswith(".odt"):
            odf_kit = Path(__file__).resolve().parent / "odf-kit"
            js = odf_kit / "html_to_odt.js"
            html = self.toHtml()
            data = subprocess.run(["node", js, self.main_window.file_path], cwd=odf_kit, capture_output=True, text=True, input=html)

        self.document().setModified(False)
        self.main_window.file_name = Path(self.main_window.file_path).name
        self.main_window.setWindowTitle(f"{self.main_window.file_name}  –  {self.tr('Kitab')}")

        try:
            register_recent_file(self.main_window.file_path)
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
        if not self.main_window.file_path:
            self.main_window.file_path, self.main_window.format_filter = QFileDialog.getSaveFileName(self.main_window, "Save As", self.main_window.last_directory, "Kitab Document (*.ktb);;OpenDocument Text (*.odt);;Plain Text (*.txt);;Markdown Document (*.md);;HTML Document (*.html)")
            if not self.main_window.file_path:
                return "canceled"
            self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
            self._save_file()
        else:
            self._save_file()

    def save_as(self, show_dialog=True):
        file_path, format_filter = self.main_window.file_path, self.main_window.format_filter
        self.main_window.file_path, self.main_window.format_filter = QFileDialog.getSaveFileName(self.main_window, "Save As", self.main_window.last_directory, "Kitab Document (*.ktb);;OpenDocument Text (*.odt);;Plain Text (*.txt);;Markdown Document (*.md);;HTML Document (*.html)")
        if not self.main_window.file_path:
            self.main_window.file_path, self.main_window.format_filter = file_path, format_filter
        else:
            self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
            self._save_file()

    def new(self):
        self.main_window.setWindowTitle(self.tr("Kitab"))
        self.main_window.file_path = None
        self.main_window.format_filter = None
        self.main_window.file_name = None
        self.clear()
        self.set_line_spacing(self.DEFAULT_LINE_SPACING)
        self.apply_page_size(self.DEFAULT_PAGE_SIZE)
        self.document().setModified(False)
        self.main_window.toolbar.clear_formatting()
        self.main_window.toolbar.align(Qt.AlignmentFlag.AlignHCenter)
        self.document().clearUndoRedoStacks()
        self.main_window.view.viewport().setFocus()
        self.setFocus()

    def _open_file(self):
        if self.main_window.file_path.endswith(".ktb"):
            with zipfile.ZipFile(self.main_window.file_path, "r") as zip:
                html_data = zip.read("document.html").decode("utf-8")
                json_data = json.loads(zip.read("info.json").decode("utf-8"))
            self.setHtml(html_data)
            self.unit = json_data["unit"]
            self.apply_page_size(Vector2.tuple_to_vector2(json_data["page size"]))
            self.set_line_spacing(json_data["line spacing"])
        elif self.main_window.file_path.endswith(".html"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                html_data = file.read()
            self.setHtml(html_data)
            self.line_spacing = self.textCursor().blockFormat().lineHeight()
        elif self.main_window.file_path.endswith(".txt"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                self.setPlainText(data)
        elif self.main_window.file_path.endswith(".md"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                self.setMarkdown(data)
        elif self.main_window.file_path.endswith(".odt"):
            odf_kit = Path(__file__).resolve().parent / "odf-kit"
            js = odf_kit / "odt_to_html.js"
            odt = Path(self.main_window.file_path).read_bytes()
            data = subprocess.run(["node", js], input=odt, cwd=odf_kit, capture_output=True)
            html = data.stdout.decode("utf-8")
            self.setHtml(html)
        elif self.main_window.file_path.endswith(".docx"):
            odf_kit = Path(__file__).resolve().parent / "odf-kit"
            js_odt = odf_kit / "docx_to_odt.js"
            js_html = odf_kit / "odt_to_html.js"
            odt = subprocess.run(["node", js_odt, self.main_window.file_path], cwd=odf_kit, capture_output=True)
            html = subprocess.run(["node", js_html], input=odt.stdout, cwd=odf_kit, capture_output=True)
            html = html.stdout.decode("utf-8")
            self.setHtml(html)
        
        self.document().setModified(False)
        self.document().setPageSize(QSizeF(self.base_width, self.base_height))
        total_pages = self.document().pageCount()
        self.setFixedSize(self.width(), total_pages * self.base_height)
        self.main_window.file_name = Path(self.main_window.file_path).name
        self.main_window.setWindowTitle(f"{self.main_window.file_name}  –  {self.tr('Kitab')}")

        register_recent_file(self.main_window.file_path)

    def open_file(self):
        self.main_window.file_path, self.main_window.format_filter = QFileDialog.getOpenFileName(self.main_window, "Open", self.main_window.last_directory, "(*.ktb *.odt *.docx *.txt *.md *.html);;Kitab Document (*.ktb);;OpenDocument Text (*.odt);;Microsoft Word Document (*.docx);;Plain Text (*.txt);;Markdown Document (*.md);;HTML Document (*.html)")
        if not self.main_window.file_path:
            return
        self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
        self._open_file()

    def set_paper_and_font_color(self, paper_color, font_color):
        self.setStyleSheet(f"QTextEdit {{ background-color: {paper_color}; color: {font_color}; border: none; }};")
        self.paper_color = paper_color

    def current_page(self):
        center_y = self.main_window.view.mapToScene(0, int(self.main_window.view.viewport().rect().center().y()))
        return int(center_y.y() // self.base_height + 1)

    def go_to_page(self, page):
        page = max(1, min(page, self.page_count))
        y = (page - 0.5) * self.base_height
        self.main_window.view.centerOn(self.main_window.view.sceneRect().center().x(), y)

    def keyPressEvent(self, event):
        if event.key() in (Qt.Key.Key_Return, Qt.Key.Key_Enter):
            cursor = self.textCursor()
            alignment = cursor.blockFormat().alignment()
            line_spacing = self.line_spacing
            block_format = QTextBlockFormat()
            block_format.setObjectIndex(cursor.blockFormat().objectIndex())
            block_format.setAlignment(alignment)
            block_format.setLineHeight(line_spacing, QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
            char_format = self.currentCharFormat()

            # insert horizontal rule by ---
            is_four_dashes = False
            pos = cursor.position()
            line_start = cursor.block().position()
            beginning = max(line_start, pos - 3)
            cursor.setPosition(beginning, QTextCursor.MoveMode.KeepAnchor)
            selection = cursor.selectedText()
            length = self.textCursor().block().length()
            if length > 2 and selection == "---":
                if pos - line_start >= 4:
                    cursor.setPosition(pos - 4, QTextCursor.MoveMode.KeepAnchor)
                    if cursor.selectedText() == "----":
                        is_four_dashes = True
                if not is_four_dashes:
                    cursor.setPosition(pos)
                    cursor.setPosition(beginning, QTextCursor.MoveMode.KeepAnchor)
                    cursor.removeSelectedText()
                    self.main_window.menubar.insert_horizontal_line()
                    return
            cursor.setPosition(pos)
            cursor.insertBlock(block_format, char_format)
        else:
            super().keyPressEvent(event)

    def check_page_limit(self):
        self.page_count = self.document().pageCount()
        self.setFixedSize(self.width(), self.page_count * self.base_height)
        self.main_window.scene.setSceneRect(QRectF(self.rect()))
        self.document().setPageSize(QSizeF(self.base_width, self.base_height))
        self.page_count = self.document().pageCount()

    def preserve_font_when_empty_page(self):
        if not self.document().isEmpty():
            captured_font = self.currentFont()
            if captured_font is not None:
                self.last_font = captured_font
            captured_char_format = self.currentCharFormat()
            if captured_char_format is not None:
                self.last_char_format = captured_char_format
        if self.document().isEmpty() and self.last_font:
            self.setFont(self.last_font)
            self.setCurrentCharFormat(self.last_char_format)
            self.main_window.toolbar.sync_font()

    def set_line_spacing(self, value):
        cursor = self.textCursor()
        cursor.select(QTextCursor.SelectionType.Document)
        block_format = cursor.blockFormat()
        block_format.setLineHeight(float(value), QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
        cursor.mergeBlockFormat(block_format)
        self.line_spacing = value
        

    def paintEvent(self, event):
        painter = QPainter(self.viewport())
        gap_height = self.base_height / 100
        for page_index in range(self.page_count):
            page_bottom = (page_index+1) * self.base_height - gap_height/2
            if page_index < self.page_count - 1:
                gap_rect = QRectF(0, page_bottom, self.width(), gap_height)
                painter.fillRect(gap_rect, self.main_window.background_color)
        painter.end()
        super().paintEvent(event)

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.MouseButton.RightButton:
            if self.was_zooming:
                self.was_zooming = False
                event.accept()
                return
            menu = QMenu()

            undo_icon = QIcon.fromTheme("edit-undo-symbolic")
            redo_icon = QIcon.fromTheme("edit-redo-symbolic")
            cut_icon = QIcon.fromTheme("edit-cut-symbolic")
            copy_icon = QIcon.fromTheme("edit-copy-symbolic")
            paste_icon = QIcon.fromTheme("edit-paste-symbolic")
            find_icon = QIcon.fromTheme("edit-find-symbolic")
            select_all_icon = QIcon.fromTheme("edit-select-all-symbolic")

            undo = menu.addAction("Undo")
            undo.setShortcut("Ctrl+Z")
            undo.setIcon(undo_icon)
            undo.setEnabled(self.document().isUndoAvailable())
            undo.triggered.connect(self.undo)
            
            redo = self.main_window.redo_action
            menu.addAction(redo)
            redo.setIcon(redo_icon)
            redo.setEnabled(self.document().isRedoAvailable())
            
            menu.addSeparator()
            
            cut = menu.addAction("Cut")
            cut.setShortcut("Ctrl+X")
            cut.setIcon(cut_icon)
            cut.setEnabled(self.textCursor().hasSelection())
            cut.triggered.connect(self.cut)
            
            copy = menu.addAction("Copy")
            copy.setShortcut("Ctrl+C")
            copy.setIcon(copy_icon)
            copy.setEnabled(self.textCursor().hasSelection())
            copy.triggered.connect(self.copy)
            
            paste = menu.addAction("Paste")
            paste.setShortcut("Ctrl+V")
            paste.setIcon(paste_icon)
            paste.triggered.connect(self.paste)
            
            menu.addSeparator()

            menu.addAction(self.main_window.find_action)
            self.main_window.find_action.setIcon(find_icon)
            
            select_all = menu.addAction("Select All")
            select_all.setShortcut("Ctrl+A")
            select_all.setIcon(select_all_icon)
            select_all.triggered.connect(self.selectAll)

            menu.exec(QCursor.pos())
            event.accept()
            return
            
        super().mouseReleaseEvent(event)

    def mousePressEvent(self, event):
        if InsertLinkDialog.handle_link_click(self, event):
            event.accept()
            return
            
        if event.button() == Qt.MouseButton.RightButton:
            self.was_zooming = False
        super().mousePressEvent(event)
