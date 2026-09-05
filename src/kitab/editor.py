#Copyright (C) 2026 Abdulrahman 103 and Kitab contributors
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QTextEdit, QMenu, QSizePolicy, QDialog, QProgressDialog, QFileDialog, QColorDialog, QMessageBox
from PySide6.QtGui import QFont, QTextListFormat, QPageLayout, QTextDocument, QTextDocumentFragment, QIcon, QPainter, QCursor, QTextCursor, QTextBlockFormat, QTextOption, QTextCharFormat, QPageSize, QPdfWriter, QColor
from PySide6.QtCore import Qt, QRectF, QSizeF, QTimer, QElapsedTimer, QMarginsF, QPoint
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
import zipfile
import json
from pathlib import Path
from dialogs import InsertLinkDialog
from vector2 import Vector2
from recent_documents import *
import parser

class Editor(QTextEdit):
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self.unit = "millimeter"
        # page size presets in millimeter
        self.PAGE_SIZES = {
        "A4": Vector2(210, 297),
        "Letter": Vector2(215.9, 279.4),
        "Legal": Vector2(215.9, 355.6),
        "A0": Vector2(841, 1189),
        "A1": Vector2(594, 841),
        "A2": Vector2(420, 594),
        "A3": Vector2(297, 420),
        "A5": Vector2(148, 210),
        "A6": Vector2(105, 148),
        "A7": Vector2(74, 105),
        "A8": Vector2(52, 74),
        }
        self.DEFAULT_FONT_SIZE = 14
        self.DEFAULT_PAGE_COLOR = "#ffffff"
        self.DEFAULT_FONT_COLOR = "black"
        self.font_color = self.DEFAULT_FONT_COLOR
        self.set_page_color(self.DEFAULT_PAGE_COLOR)
        self.DEFAULT_PAGE_SIZE = self.PAGE_SIZES["A4"]
        self.DEFAULT_LINE_SPACING = 115
        self.DEFAULT_PARAGRAPH_SPACING = (0, 0)
        self.DEFAULT_MARGINS = (20, 20, 20, 20)
        self.set_page_margins(self.DEFAULT_MARGINS)
        #self.document().setDocumentMargin(20 * (96 / 25.4))

        self.last_char_format = None
        self.last_font = None
        
        if self.unit == "inch":
            self.page_size = self.DEFAULT_PAGE_SIZE.inches_to_mm()
        else:
            self.page_size = self.DEFAULT_PAGE_SIZE
        self.base_width, self.base_height = self.DEFAULT_PAGE_SIZE.mm_to_pixels()
        self.setMinimumSize(self.base_width, self.base_height)
        self.document().setPageSize(QSizeF(self.base_width, self.base_height))
        self.page_count = self.document().pageCount()
        self.set_line_spacing(self.DEFAULT_LINE_SPACING, check_limit=False)
        self.set_paragraph_spacing(self.DEFAULT_PARAGRAPH_SPACING, check_limit=False)
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
        self.DEFAULT_CHAR_FORMAT.setForeground(QColor("black"))
        self.setTextColor(QColor("black"))
        self.textChanged.connect(self.check_page_limit)
        self.textChanged.connect(self.preserve_font_when_empty_page)
        self.was_zooming = False 
        self.document().setModified(False)
    
    # Drag and drop files.
    def dropEvent(self, event):
        print(555)
        if event.mimeData().hasUrls():
            path_list = event.mimeData().urls()
            if len(path_list) == 1:
                path = path_list[0].toLocalFile()
                if path.endswith((".txt", ".ktb", ".odt", ".md", ".html")):
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

    def set_font_color(self):
        dialog = QColorDialog(self.font_color)
        if dialog.exec() == QColorDialog.Accepted:
            self.font_color = dialog.selectedColor()
            self.setTextColor(self.font_color)
            self.main_window.toolbar.color_button.setStyleSheet(f"QPushButton {{ background-color: {self.font_color.name()}; }}")
        self.main_window.view.viewport().setFocus()

    def set_page_size(self, size):
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

    def set_page_margins(self, margins):
        root = self.document().rootFrame()
        if self.unit == "inch":
            unit = 96
        else:
            unit = (96 / 25.4)
        format = root.frameFormat()
        format.setTopMargin(margins[0] * unit)
        format.setRightMargin(margins[1] * unit)
        format.setBottomMargin(margins[2] * unit)
        format.setLeftMargin(margins[3] * unit)
        root.setFrameFormat(format)
        self.margins = margins

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
        file_path, _format_filter = QFileDialog.getSaveFileName(self.main_window, self.tr("Export"), self.main_window.last_directory, self.tr("PDF Document (*.pdf)"))
        if not file_path:
            return
        self.main_window.last_directory = str(Path(file_path).parent)
        exporting = QProgressDialog(self.tr("Exporting..."), None, 0, 0, self.main_window)
        exporting.setWindowTitle(self.tr("Exporting..."))
        exporting.setWindowModality(Qt.WindowModality.WindowModal)
        export_timer = QElapsedTimer()
        export_timer.start()
        exporting.show()
        pdf_writer = QPdfWriter(file_path)
        if self.unit == "inch":
            pdf_writer.setPageSize(QPageSize(QSizeF(self.page_size.x, self.page_size.y), QPageSize.Unit.Inch))
        else:
            pdf_writer.setPageSize(QPageSize(QSizeF(self.page_size.x, self.page_size.y), QPageSize.Unit.Millimeter))
        pdf_writer.setPageMargins(QMarginsF(0, 0, 0, 0), QPageLayout.Unit.Millimeter)
        self.document().print_(pdf_writer)
        time_taken = export_timer.elapsed()
        minimum_time = 500
        if time_taken >= minimum_time:
            exporting.close()
        else:
            remaining_time = minimum_time - time_taken
            QTimer.singleShot(remaining_time, exporting.close)

    # Base of self.save and self.save_as, saves documents without a dialog.
    def _save_file(self):
        file_path = Path(self.main_window.file_path)
        if file_path.suffix:
            match file_path.suffix:
                case ".odt":
                    message_box = QMessageBox()
                    message_box.setIcon(QMessageBox.Icon.Critical)
                    message_box.setWindowTitle(self.tr("Save Failed"))
                    message_box.setText(self.tr("You can't save as an odt file."))
                    message_box.setInformativeText(self.tr("""Supported save formats are: ktb, html, md, txt.
        If you want to open the document in libreoffice, save it in html."""))
                    message_box.exec()
                    return
                case other:
                    extension = other.lower()

        saving = QProgressDialog(self.tr("Saving..."), None, 0, 0, self.main_window)
        saving.setWindowTitle(self.tr("Saving..."))
        saving.setWindowModality(Qt.WindowModality.WindowModal)
        save_timer = QElapsedTimer()
        save_timer.start()
        saving.show()
        
        if extension == ".txt":
            data = self.toPlainText()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif extension == ".html":
            data = self.toHtml()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif  extension == ".md":
            data = self.toMarkdown()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif  extension == ".ktb":
            html_data = self.toHtml()
            self.line_spacing = self.textCursor().blockFormat().lineHeight()
            json_data = {
                        "unit": self.unit,
                        "page size": self.page_size.to_tuple(),
                        "page margins": self.margins,
                        "line spacing": self.line_spacing,
                        "paragraph spacing": self.paragraph_spacing,
                        "page color": self.page_color
                        }
            with zipfile.ZipFile(self.main_window.file_path, mode="w") as zip:
                zip.writestr("mimetype", "application/prs.ktb+zip", compress_type=zipfile.ZIP_STORED)
                zip.writestr("document.html", html_data, compress_type=zipfile.ZIP_DEFLATED)
                zip.writestr("information.json", json.dumps(json_data), compress_type=zipfile.ZIP_DEFLATED)

        self.document().setModified(False)
        self.main_window.file_name = Path(self.main_window.file_path).name
        self.main_window.setWindowTitle(f"{self.main_window.file_name}")

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
            self.main_window.file_path, self.main_window.format_filter = QFileDialog.getSaveFileName(self.main_window, self.tr("Save As"), self.main_window.last_directory, self.tr("Kitab Document (*.ktb);;Plain Text (*.txt);;Markdown Document (*.md);;HTML Document (*.html)"))
            if not self.main_window.file_path:
                return "canceled"
            self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
            self._save_file()
        else:
            self._save_file()

    def save_as(self, show_dialog=True):
        file_path, format_filter = self.main_window.file_path, self.main_window.format_filter
        self.main_window.file_path, self.main_window.format_filter = QFileDialog.getSaveFileName(self.main_window, self.tr("Save As"), self.main_window.last_directory, self.tr("Kitab Document (*.ktb);;Plain Text (*.txt);;Markdown Document (*.md);;HTML Document (*.html)"))
        if not self.main_window.file_path:
            self.main_window.file_path, self.main_window.format_filter = file_path, format_filter
        else:
            self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
            self._save_file()

    def reset_document(self):
        self.set_line_spacing(self.DEFAULT_LINE_SPACING)
        self.set_paragraph_spacing(self.DEFAULT_PARAGRAPH_SPACING)
        self.set_page_size(self.DEFAULT_PAGE_SIZE)
        self.set_page_color(self.DEFAULT_PAGE_COLOR)
        self.set_page_margins(self.DEFAULT_MARGINS)
        self.unit = "millimeter"
        self.clear_formatting()

    def new(self):
        self.main_window.setWindowTitle("")
        self.main_window.file_path = None
        self.main_window.format_filter = None
        self.main_window.file_name = None
        self.clear()
        self.reset_document()
        self.align(Qt.AlignmentFlag.AlignHCenter)
        self.document().setModified(False)
        self.document().clearUndoRedoStacks()
        self.main_window.view.viewport().setFocus()
        self.setFocus()

    # # Base of self.open_file and recent_documents.py, opens documents without a dialog, also used for opening files in the terminal (kitab path_to_file).
    def _open_file(self):
        if self.main_window.file_path.endswith(".ktb"):
            with zipfile.ZipFile(self.main_window.file_path, "r") as zip:
                html_data = zip.read("document.html").decode("utf-8")
                json_data = json.loads(zip.read("information.json").decode("utf-8"))
            self.setHtml(html_data)
            self.unit = json_data["unit"]
            self.set_page_size(Vector2.tuple_to_vector2(json_data["page size"]))
            self.set_line_spacing(json_data["line spacing"])
            self.set_paragraph_spacing(json_data["paragraph spacing"])
            self.set_page_margins(json_data["page margins"])
            self.set_page_color(json_data["page color"])
        elif self.main_window.file_path.endswith(".html"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                html_data = file.read()
            self.setHtml(html_data)
            self.line_spacing = self.textCursor().blockFormat().lineHeight()
        elif self.main_window.file_path.endswith(".txt"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                self.reset_document()
                self.setPlainText(data)
        elif self.main_window.file_path.endswith(".md"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                self.reset_document()
                self.setMarkdown(data)
        elif self.main_window.file_path.endswith(".odt"):
            html_data = parser.odtToKtb(self.main_window.file_path)
            self.setHtml(html_data)
            self.reset_document()

        self.document().setModified(False)
        self.document().setPageSize(QSizeF(self.base_width, self.base_height))
        total_pages = self.document().pageCount()
        self.setFixedSize(self.width(), total_pages * self.base_height)
        self.main_window.file_name = Path(self.main_window.file_path).name
        self.main_window.setWindowTitle(f"{self.main_window.file_name}")
        register_recent_file(self.main_window.file_path)

    def open_file(self):
        self.main_window.file_path, self.main_window.format_filter = QFileDialog.getOpenFileName(self.main_window, self.tr("Open"), self.main_window.last_directory, self.tr("(*.ktb *.odt *.txt *.md *.html);;Kitab Document (*.ktb);;OpenDocument Text (*.odt);;Plain Text (*.txt);;Markdown Document (*.md);;HTML Document (*.html)"))
        if not self.main_window.file_path:
            return
        self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
        self._open_file()

    def set_page_color(self, page_color):
        self.setStyleSheet(f"QTextEdit {{ background-color: {page_color}; color: {self.DEFAULT_FONT_COLOR}; border: none; }}")
        self.document().setDefaultStyleSheet(f"body {{background-color: {page_color};}}")
        self.page_color = page_color
        root = self.document().rootFrame()
        format = root.frameFormat()
        format.setBackground(QColor(page_color))
        root.setFrameFormat(format)

    def current_page(self):
        center_y = self.main_window.view.mapToScene(0, int(self.main_window.view.viewport().rect().center().y()))
        return int(center_y.y() // self.base_height + 1)

    def go_to_page(self, page):
        page = max(1, min(page, self.page_count))
        y = (page - 0.5) * self.base_height
        self.main_window.view.centerOn(self.main_window.view.sceneRect().center().x(), y)

    # Normal enter key behaviour is weird and buggy so this overrides it with cursor.insertBlock().
    def keyPressEvent(self, event):
        if event.key() in (Qt.Key.Key_Return, Qt.Key.Key_Enter):
            cursor = self.textCursor()
            alignment = cursor.blockFormat().alignment()
            self.line_spacing = self.textCursor().blockFormat().lineHeight()
            block_format = QTextBlockFormat()
            block_format.setObjectIndex(cursor.blockFormat().objectIndex())
            block_format.setAlignment(alignment)
            block_format.setLineHeight(self.line_spacing, QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
            block_format.setTopMargin(self.paragraph_spacing[0])
            block_format.setBottomMargin(self.paragraph_spacing[1])
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

    # Generates a new page when the page is overflowing
    def check_page_limit(self):
        self.page_count = self.document().pageCount()
        self.setFixedSize(self.width(), self.page_count * self.base_height)
        self.main_window.scene.setSceneRect(QRectF(self.rect()))
        self.document().setPageSize(QSizeF(self.base_width, self.base_height))
        self.page_count = self.document().pageCount()

    # Prevents font properties reseting when document is empty, this resets the line spacing to the actual qTextDocument default (100%) so it is reapplied, setFont preserves the cursor's size and prevents the cursor size to reset.
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
   
    def set_line_spacing(self, value, check_limit=True):
        self.line_spacing = value
        cursor = self.textCursor()
        cursor.select(QTextCursor.SelectionType.Document)
        block_format = QTextBlockFormat()
        block_format.setLineHeight(float(value), QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
        cursor.mergeBlockFormat(block_format)
        if check_limit:
            self.check_page_limit()

    def set_paragraph_spacing(self, paragraph_spacing, check_limit=True):
        self.paragraph_spacing = paragraph_spacing
        cursor = self.textCursor()
        cursor.select(QTextCursor.SelectionType.Document)
        block_format = QTextBlockFormat()
        block_format.setTopMargin(paragraph_spacing[0])
        block_format.setBottomMargin(paragraph_spacing[1])
        self.document().blockSignals(True)
        cursor.mergeBlockFormat(block_format)
        self.document().blockSignals(False)
        if check_limit:
            self.check_page_limit()
    
    # Applies self.line_spacing to pasted text/html.
    def insertFromMimeData(self, data):
        temporary_document = QTextDocument()
        temporary_cursor = QTextCursor(temporary_document)
        if data.hasHtml():
            temporary_cursor.insertHtml(data.html())
        elif data.hasText():
            temporary_cursor.insertText(data.text())
        else:
            return
        block = temporary_document.firstBlock()
        while block.isValid():
            block_cursor = QTextCursor(block)
            block_format = block_cursor.blockFormat()
            block_format.setLineHeight(self.line_spacing, QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
            block_format.setTopMargin(self.paragraph_spacing[0])
            block_format.setBottomMargin(self.paragraph_spacing[1])
            block_cursor.setBlockFormat(block_format)
            block = block.next()
        cursor = self.textCursor()
        self.textCursor().insertFragment(QTextDocumentFragment(temporary_document))
        self.setTextCursor(cursor)

    # Paints the page seperators, contains a bug (github issue #2).
    def paintEvent(self, event):
        super().paintEvent(event)
        painter = QPainter(self.viewport())
        gap_height = self.base_height / 100
        for page_index in range(self.page_count):
            page_bottom = (page_index+1) * self.base_height - gap_height/2
            if page_index < self.page_count - 1:
                gap_rect = QRectF(0, page_bottom, self.width(), gap_height)
                painter.fillRect(gap_rect, self.main_window.background_color)
        painter.end()

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

            undo = menu.addAction(self.tr("Undo"))
            undo.setShortcut("Ctrl+Z")
            undo.setIcon(undo_icon)
            undo.setEnabled(self.document().isUndoAvailable())
            undo.triggered.connect(self.undo)
            
            redo = self.main_window.redo_action
            menu.addAction(redo)
            redo.setIcon(redo_icon)
            redo.setEnabled(self.document().isRedoAvailable())
            
            menu.addSeparator()
            
            cut = menu.addAction(self.tr("Cut"))
            cut.setShortcut("Ctrl+X")
            cut.setIcon(cut_icon)
            cut.setEnabled(self.textCursor().hasSelection())
            cut.triggered.connect(self.cut)
            
            copy = menu.addAction(self.tr("Copy"))
            copy.setShortcut("Ctrl+C")
            copy.setIcon(copy_icon)
            copy.setEnabled(self.textCursor().hasSelection())
            copy.triggered.connect(self.copy)
            
            paste = menu.addAction(self.tr("Paste"))
            paste.setShortcut("Ctrl+V")
            paste.setIcon(paste_icon)
            paste.triggered.connect(self.paste)
            
            menu.addSeparator()

            menu.addAction(self.main_window.find_action)
            self.main_window.find_action.setIcon(find_icon)
            
            select_all = menu.addAction(self.tr("Select All"))
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

    def align(self, alignment):
        match alignment:
                case Qt.AlignmentFlag.AlignLeft:
                    self.main_window.toolbar.align_left_button.setChecked(True)
                case Qt.AlignmentFlag.AlignHCenter:
                    self.main_window.toolbar.align_center_button.setChecked(True)
                case Qt.AlignmentFlag.AlignRight:
                    self.main_window.toolbar.align_right_button.setChecked(True)
                case Qt.AlignmentFlag.AlignJustify:
                    self.main_window.toolbar.justify_button.setChecked(True)
        cursor = self.textCursor()
        block_format = cursor.blockFormat()
        if alignment != Qt.AlignmentFlag.AlignHCenter and alignment != Qt.AlignmentFlag.AlignJustify:
            alignment = alignment | Qt.AlignmentFlag.AlignAbsolute
        else:
            alignment = alignment
        block_format.setAlignment(alignment)
        cursor.mergeBlockFormat(block_format)
        self.main_window.view.viewport().setFocus()

    def clear_formatting(self):
        self.blockSignals(True)
        cursor = self.textCursor()
        plain = self.DEFAULT_CHAR_FORMAT
        cursor.setCharFormat(plain)
        self.setFont(self.DEFAULT_FONT)
        block_format = cursor.blockFormat()
        block_format.clearBackground()
        block_format.setIndent(0)
        block_format.setObjectIndex(-1)
        cursor.setBlockFormat(block_format)
        self.setCurrentCharFormat(plain)
        font_size = self.currentFont().pointSize()
        self.main_window.toolbar.font_size_menu.setCurrentText(str(font_size))
        self.main_window.toolbar.color_button.setStyleSheet(f"QPushButton {{ background-color: {self.textColor().name()}; }}")
        self.main_window.view.viewport().setFocus()
        self.main_window.toolbar.sync_font()
        self.blockSignals(False)

    def toggle_list(self, style):
        cursor = self.textCursor()
        cursor.beginEditBlock()

        if cursor.hasSelection():
            doc = self.document()

            start_block = doc.findBlock(cursor.selectionStart())
            end_block = doc.findBlock(cursor.selectionEnd())

            removing = True
            block = start_block
            while True:
                lst = block.textList()
                if not lst or lst.format().style() != style:
                    removing = False
                    break
                if block == end_block:
                    break
                block = block.next()
            
            if removing:
                block = start_block
                while True:
                    current_list = block.textList()
                    if current_list and current_list.format().style() == style:
                        block_cursor = QTextCursor(block)
                        current_list.remove(block)
                        block_format = block_cursor.blockFormat()
                        block_format.setObjectIndex(-1)
                        block_format.setIndent(0)
                        block_cursor.setBlockFormat(block_format)
                    if block == end_block:
                        break
                    block = block.next()
            else:
                list_format = QTextListFormat()
                list_format.setStyle(style)
                cursor.createList(list_format)
        else:
            current_list = cursor.currentList()

            if current_list and current_list.format().style() == style:
                current_list.remove(cursor.block())
                block_format = cursor.blockFormat()
                block_format.setObjectIndex(-1)
                block_format.setIndent(0)
                cursor.mergeBlockFormat(block_format)
            else:
                list_format = QTextListFormat()
                list_format.setStyle(style)
                cursor.createList(list_format)

        cursor.endEditBlock()
        self.main_window.toolbar.sync_font()
        self.main_window.view.viewport().setFocus()

    def toggle_numbered_list(self):
        self.toggle_list(QTextListFormat.Style.ListDecimal)

    def toggle_bulleted_list(self):
        self.toggle_list(QTextListFormat.Style.ListDisc)

    def font_family(self, font):
        self.setFontFamily(font.family())

    def change_font_size(self):
        self.font_size = int(self.main_window.toolbar.font_size_menu.currentText())
        self.setFontPointSize(self.font_size)
        self.main_window.view.viewport().setFocus()

    def highlight_text(self):
        dialog = QColorDialog(self.highlight_color)
        if dialog.exec() == QColorDialog.Accepted:
            self.highlight_color = dialog.selectedColor()
            char_format = self.currentCharFormat()
            char_format.setBackground(self.highlight_color)
            self.setTextBackgroundColor(self.highlight_color)
            self.main_window.toolbar.highlight_button.setStyleSheet(f"QPushButton {{background-color: {self.highlight_color.name()}; }}")
        self.main_window.view.viewport().setFocus()

    def toggle_bold(self):
        cursor = self.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(self.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_bold = check_cursor.charFormat().fontWeight() == QFont.Weight.Bold
            char_format = QTextCharFormat()
            char_format.setFontWeight(QFont.Weight.Normal if is_bold else QFont.Weight.Bold)
            cursor.mergeCharFormat(char_format)
            self.setTextCursor(cursor)
        else:
            char_format = self.currentCharFormat()
            is_bold = char_format.fontWeight() == QFont.Weight.Bold
            char_format.setFontWeight(QFont.Weight.Normal if is_bold else QFont.Weight.Bold)
            self.mergeCurrentCharFormat(char_format)
        self.main_window.toolbar.bold_button.setChecked(not is_bold)
        self.main_window.view.viewport().setFocus()

    def toggle_strikethrough(self):
        cursor = self.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(self.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_strikethrough = check_cursor.charFormat().fontStrikeOut()
            char_format = QTextCharFormat()
            char_format.setFontStrikeOut(not is_strikethrough)
            cursor.mergeCharFormat(char_format)
            self.setTextCursor(cursor)
        else:
            char_format = self.currentCharFormat()
            is_strikethrough = char_format.fontStrikeOut()
            char_format.setFontStrikeOut(not is_strikethrough)
            self.mergeCurrentCharFormat(char_format)
        self.main_window.toolbar.strikethrough_button.setChecked(not is_strikethrough)
        self.main_window.view.viewport().setFocus()

    def toggle_underline(self):
        cursor = self.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(self.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_underline = check_cursor.charFormat().fontUnderline()
            char_format = QTextCharFormat()
            char_format.setFontUnderline(not is_underline)
            cursor.mergeCharFormat(char_format)
            self.setTextCursor(cursor)
        else:
            char_format = self.currentCharFormat()
            is_underline = char_format.fontUnderline()
            char_format.setFontUnderline(not is_underline)
            self.mergeCurrentCharFormat(char_format)
        self.main_window.toolbar.underline_button.setChecked(not is_underline)
        self.main_window.view.viewport().setFocus()

    def toggle_italic(self):
        cursor = self.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(self.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_italic = check_cursor.charFormat().fontItalic()
            char_format = QTextCharFormat()
            char_format.setFontItalic(not is_italic)
            cursor.mergeCharFormat(char_format)
            self.setTextCursor(cursor)
        else:
            char_format = self.currentCharFormat()
            is_italic = char_format.fontItalic()
            char_format.setFontItalic(not is_italic)
            self.mergeCurrentCharFormat(char_format)
        self.main_window.toolbar.italic_button.setChecked(not is_italic)
        self.main_window.view.viewport().setFocus()

    def toggle_superscript(self):
        cursor = self.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(self.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_superscript = check_cursor.charFormat().verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSuperScript
            char_format = QTextCharFormat()
            char_format.setVerticalAlignment(QTextCharFormat.VerticalAlignment.AlignNormal if is_superscript else QTextCharFormat.VerticalAlignment.AlignSuperScript)
            cursor.mergeCharFormat(char_format)
            self.setTextCursor(cursor)
            
        else:
            char_format = self.currentCharFormat()
            is_superscript = char_format.verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSuperScript
            char_format.setVerticalAlignment(QTextCharFormat.VerticalAlignment.AlignNormal if is_superscript else QTextCharFormat.VerticalAlignment.AlignSuperScript)
            self.mergeCurrentCharFormat(char_format)
        self.main_window.toolbar.superscript_button.setChecked(not is_superscript)
        self.main_window.toolbar.subscript_button.setChecked(False)
        self.main_window.view.viewport().setFocus()

    def toggle_subscript(self):
        cursor = self.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(self.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_subscript = check_cursor.charFormat().verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSubScript
            char_format = QTextCharFormat()
            char_format.setVerticalAlignment(QTextCharFormat.VerticalAlignment.AlignNormal if is_subscript else QTextCharFormat.VerticalAlignment.AlignSubScript)
            cursor.mergeCharFormat(char_format)
            self.setTextCursor(cursor)
            
        else:
            char_format = self.currentCharFormat()
            is_subscript = char_format.verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSubScript
            char_format.setVerticalAlignment(QTextCharFormat.VerticalAlignment.AlignNormal if is_subscript else QTextCharFormat.VerticalAlignment.AlignSubScript)
            self.mergeCurrentCharFormat(char_format)
        self.main_window.toolbar.subscript_button.setChecked(not is_subscript)
        self.main_window.toolbar.superscript_button.setChecked(False)
        self.main_window.view.viewport().setFocus()
        
    