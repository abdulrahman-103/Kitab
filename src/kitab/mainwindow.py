#Copyright (C) <2026> <Abdulrahman>
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QMainWindow, QTextEdit, QColorDialog, QToolBar, QFileDialog, QLabel, QMenu, QPushButton, QHBoxLayout, QApplication, QGraphicsScene, QGraphicsView, QComboBox, QSizePolicy, QButtonGroup, QProgressDialog, QMessageBox, QDialog, QVBoxLayout, QFontComboBox, QInputDialog, QStatusBar
from PySide6.QtGui import QAction, QIntValidator, QIcon, QPainter, QColor, QPageSize, QCursor, QImage, QPixmap, QPdfWriter, QTextCursor, QTextBlockFormat, QTextCharFormat, QTextOption, QTextTableFormat, QTextLength, QTextImageFormat
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
from PySide6.QtCore import QTimer, Qt, QSize, QElapsedTimer, QRectF, QPoint
import base64
import sys
from pathlib import Path
import zipfile
import json
from dialogs import FindReplaceDialog, PageSizeDialog

BACKGROUND_COLOR = QColor("#1e1e1e")

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        open_with_commandline = False
        self.app = QApplication.instance()
        resolution = self.app.primaryScreen().availableSize()
        self.resize(resolution.width()/1.5, resolution.height()/1.5)
        self.move((resolution.width()-self.width())/2, 0)
        self.setWindowTitle("Kitab")
        self.file_path = None
        self.file_name = None
        self.format_filter = None
        self.last_directory = None
        
        from images import ICON_BASE64
        icon = QImage.fromData(base64.b64decode(ICON_BASE64))
        self.setWindowIcon(QIcon(QPixmap.fromImage(icon)))

        self.showMaximized()
        self.scene = QGraphicsScene()
        self.editor = Editor(self)
        self.add_menubar()
        self.add_toolbar()
        

        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        
        self.scene.addWidget(self.editor)
        self.view = QGraphicsView(self.scene)
        self.view.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.view.setStyleSheet(f"background-color: {BACKGROUND_COLOR.name()};")
        self.view.centerOn(self.editor.width() / 2, 0)
        
        self.setCentralWidget(self.view)

        self.align(Qt.AlignmentFlag.AlignHCenter)

        self.editor.cursorPositionChanged.connect(self.sync_font)

        self.shortcuts()

        #opening file with commandline
        if len(sys.argv) == 2:
            self.file_path = sys.argv[1]
            self._open_file()

        self.scroll_bar = self.view.verticalScrollBar()
        self.add_statusbar()
        self.default_zoom_factor = resolution.height() / self.editor.base_height
        self.zoom_factor = self.default_zoom_factor
        self.view.scale(self.zoom_factor, self.zoom_factor)
        self.view.viewport().installEventFilter(self)
        self.scroll_bar.setValue(0)
        self.editor.document().setModified(False)


    def add_menubar(self):
        self.menubar = self.menuBar()

        file_menu = self.menubar.addMenu("File")

        new_option = file_menu.addAction("New")
        new_option.triggered.connect(self.new)
        new_option.setShortcut("Ctrl+N")

        open_option = file_menu.addAction("Open")
        open_option.triggered.connect(self.open)
        open_option.setShortcut("Ctrl+O")

        save_option = file_menu.addAction("Save")
        save_option.triggered.connect(self.save)
        save_option.setShortcut("Ctrl+S")

        save_as_option = file_menu.addAction("Save As")
        save_as_option.triggered.connect(self.save_as)
        save_as_option.setShortcut("Ctrl+Shift+S")

        export = file_menu.addAction("Export")
        export.triggered.connect(self.export_file)
        export.setShortcut("Ctrl+Shift+E")

        print_option = file_menu.addAction("Print")
        print_option.triggered.connect(self.print_document)
        print_option.setShortcut("Ctrl+P")

        exit_option = file_menu.addAction("Exit")
        exit_option.triggered.connect(self.app.quit)
        exit_option.setShortcut("Ctrl+F4")

        insert_menu = self.menubar.addMenu("Insert")

        table_option = insert_menu.addAction("Table")
        table_option.triggered.connect(self.insert_table)
        table_option.setShortcut("Ctrl+T")

        image_option = insert_menu.addAction("Image")
        image_option.triggered.connect(self.insert_image)
        image_option.setShortcut("Ctrl+I")

        page_menu = self.menubar.addMenu("Page")

        page_size_option = page_menu.addAction("Page Size")
        page_size_option.triggered.connect(self.page_size)

        page_margins_option = page_menu.addAction("Page Margins")
        #page_margins_option.triggered.connect(self.page_margins)


    def add_toolbar(self):
        self.toolbar = QToolBar()
        self.toolbar.setMovable(False)
        self.font_family_menu = QFontComboBox()
        self.size_unit = self.font_family_menu.sizeHint().height()
        self.font_family_menu.setToolTip("Font Family")
        self.font_family_menu.setFontFilters(QFontComboBox.FontFilter.ScalableFonts)
        self.font_family_menu.setFixedWidth(self.size_unit*6)
        self.font_family_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_family_menu.currentFontChanged.connect(self.font_family)
        self.font_family_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        self.toolbar.addWidget(self.font_family_menu)
        self.toolbar.addSeparator()

        self.font_size_menu = QComboBox()
        self.font_size_menu.setToolTip("Font Size")
        self.font_size_menu.addItems(["6","7","8","9","10","11","12","13","14","15","16","18","20","21","22","24","26","28","32","36","40","42","44","48","54","60","66","72","80","88","96"])
        self.font_size_menu.setCurrentText(str(Editor.DEFAULT_FONT_SIZE))
        self.font_size = int(self.font_size_menu.currentText())
        self.font_size_menu.setEditable(True)
        self.font_size_menu.lineEdit().setValidator(QIntValidator(6, 500, self))
        self.font_size_menu.activated.connect(self.change_font_size)
        self.font_size_menu.lineEdit().returnPressed.connect(self.change_font_size)
        self.font_size_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_size_menu.setInsertPolicy(QComboBox.InsertPolicy.NoInsert)
        self.font_size_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        self.toolbar.addWidget(self.font_size_menu)
        self.toolbar.addSeparator()

        self.color_button = QPushButton("", self)
        self.color_button.setToolTip("Font Color")
        self.color_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.color_button.setStyleSheet(f"QPushButton {{background-color: {self.editor.DEFAULT_FONT_COLOR};}}")
        self.color_button.clicked.connect(self.font_color)
        self.toolbar.addWidget(self.color_button)
        self.toolbar.addSeparator()

        self.highlight_color = QColor("yellow")
        self.highlight_button = QPushButton("🖍", self)
        self.highlight_button.setToolTip("Hightlight")
        self.highlight_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.highlight_button.setStyleSheet("QPushButton {background-color: yellow;}")
        self.highlight_button.clicked.connect(self.highlight_text)
        self.toolbar.addWidget(self.highlight_button)
        self.toolbar.addSeparator()

        self.bold_button = QPushButton("B", self)
        self.bold_button.setToolTip("Bold")
        self.bold_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.bold_button.setCheckable(True)
        self.bold_button.setStyleSheet("QPushButton { font-weight: bold; }")
        self.bold_button.clicked.connect(self.toggle_bold)
        self.toolbar.addWidget(self.bold_button)

        self.strikethrough_button = QPushButton("S", self)
        self.strikethrough_button.setToolTip("Strikethrough")
        self.strikethrough_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.strikethrough_button.setCheckable(True)
        self.strikethrough_button.setStyleSheet("QPushButton { font-weight: bold; }")
        self.strikethrough_button.clicked.connect(self.toggle_strikethrough)
        self.toolbar.addWidget(self.strikethrough_button)

        self.underline_button = QPushButton("U", self)
        self.underline_button.setToolTip("Underline")
        self.underline_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.underline_button.setCheckable(True)
        self.underline_button.setStyleSheet("QPushButton { font-weight: bold; }")
        self.underline_button.clicked.connect(self.toggle_underline)
        self.toolbar.addWidget(self.underline_button)

        self.italic_button = QPushButton("𝐼", self)
        self.italic_button.setToolTip("Italic")
        self.italic_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.italic_button.setCheckable(True)
        self.italic_button.setStyleSheet("QPushButton { font-weight: bold; font-size:12pt;}")
        self.italic_button.clicked.connect(self.toggle_italic)
        self.toolbar.addWidget(self.italic_button)

        self.clear_formatting_button = QPushButton("X", self)
        self.clear_formatting_button.setToolTip("Clear Formatting")
        self.clear_formatting_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.clear_formatting_button.setStyleSheet("QPushButton { font-weight: bold; }")
        self.clear_formatting_button.clicked.connect(self.clear_formatting)
        self.toolbar.addWidget(self.clear_formatting_button)
        self.toolbar.addSeparator()

        self.align_left_button = QPushButton("←", self)
        self.align_left_button.setShortcut("Ctrl+L")
        self.align_left_button.setToolTip("Align Left")
        self.align_left_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.align_left_button.setCheckable(True)
        self.align_left_button.setStyleSheet("QPushButton {font-size: 18pt;}")
        self.align_left_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignLeft))
        self.toolbar.addWidget(self.align_left_button)

        self.align_center_button = QPushButton("•", self)
        self.align_center_button.setShortcut("Ctrl+E")
        self.align_center_button.setToolTip("Align Center")
        self.align_center_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.align_center_button.setCheckable(True)
        self.align_center_button.setStyleSheet("QPushButton {font-size: 18pt;}")
        self.align_center_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignHCenter))
        self.toolbar.addWidget(self.align_center_button)

        self.align_right_button = QPushButton("→", self)
        self.align_right_button.setShortcut("Ctrl+R")
        self.align_right_button.setToolTip("Align Right")
        self.align_right_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.align_right_button.setCheckable(True)
        self.align_right_button.setStyleSheet("QPushButton {font-size: 18pt;}")
        self.align_right_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignRight))
        self.toolbar.addWidget(self.align_right_button)
        self.alignment_group = QButtonGroup(self)
        self.alignment_group.setExclusive(True)
        self.alignment_group.addButton(self.align_left_button)
        self.alignment_group.addButton(self.align_center_button)
        self.alignment_group.addButton(self.align_right_button)

        self.addToolBar(self.toolbar)


    def add_statusbar(self):
        self.statusbar = QStatusBar()
        self.statusbar.showMessage(f"Page {self.editor.current_page()} of {self.editor.page_count}")
        self.editor.textChanged.connect(lambda: self.statusbar.showMessage(f"Page {self.editor.current_page()} of {self.editor.page_count}"))
        self.scroll_bar.valueChanged.connect(lambda: self.statusbar.showMessage(f"Page {self.editor.current_page()} of {self.editor.page_count}"))
        self.setStatusBar(self.statusbar)

    def eventFilter(self, watched, event):
        if event.type() == event.Type.Wheel:
            self.wheelEvent(event)
            return True
        return super().eventFilter(watched, event) #If not a scroll return to original event filter


    def keyPressEvent(self, event):
        if event.modifiers() == Qt.KeyboardModifier.ControlModifier:
            if event.key() in (Qt.Key.Key_Plus, Qt.Key.Key_Equal):
                self.zoom("in")
            elif event.key() == Qt.Key.Key_Minus:
                self.zoom("out")
            elif event.key() == Qt.Key.Key_0:
                self.zoom("reset")
                

    def wheelEvent(self, event):
        if event.modifiers() == Qt.KeyboardModifier.ControlModifier or event.buttons() == Qt.MouseButton.RightButton:
            direction = event.angleDelta().y()
            if direction > 0:
                self.zoom("in")
            elif direction <0:
                self.zoom("out")
        else:
            if self.scroll_bar:
                steps = event.angleDelta().y()
                self.scroll_bar.setValue(self.scroll_bar.value() - steps)


    def zoom(self, direction: str):
        self.editor.was_zooming = True
        resolution = self.app.primaryScreen().size()
        resolution_factor = resolution.height() / 720 #my resolution is 1080p with 150% scaling. the factor use is to make the max and min limits equal on all resolutions
        min = 0.05 * resolution_factor
        max = 5.0 * resolution_factor
        if direction == "in" and self.zoom_factor < max:
            self.zoom_factor *= 1.15
        elif direction == "out" and self.zoom_factor > min:
            self.zoom_factor *= 0.85
        elif direction == "reset":
            self.zoom_factor = self.default_zoom_factor
        
        self.view.resetTransform()  
        self.view.setTransformationAnchor(QGraphicsView.ViewportAnchor.AnchorUnderMouse)
        self.view.scale(self.zoom_factor, self.zoom_factor)
        

    def _save_file(self): # base used by both save() and save_as()
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


        self.editor.document().setModified(False)
        self.file_name = Path(self.file_path).name
        self.setWindowTitle(f"{self.file_name}  –  Kitab")
        time_taken = save_timer.elapsed()
        minimum_time = 500
        if time_taken >= minimum_time:
            saving.close()
        else:
            remaining_time = minimum_time - time_taken
            QTimer.singleShot(remaining_time, saving.close)


    def save(self):
        if not self.file_path:
            self.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", self.last_directory, "Kitab File (*.ktb);;Text File (*.txt);;Markdown File  (*.md)")
            if not self.file_path:
                return
            self.last_directory = str(Path(self.file_path).parent)
            self._save_file()
        else:
            self._save_file()


    def save_as(self, show_dialog=True):
        file_path, format_filter = self.file_path, self.format_filter
        self.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", self.last_directory, "Kitab File (*.ktb);;Text File (*.txt);;Markdown File  (*.md)")
        if not self.file_path:
            self.file_path, self.format_filter = file_path, format_filter
        else:
            self.last_directory = str(Path(self.file_path).parent)
            self._save_file()

    def new(self):
        self.setWindowTitle("Kitab")
        self.file_path = None
        self.format_filter = None
        self.file_name = None
        self.editor.clear()
        self.editor.document().setModified(False)

    def _open_file(self):
        if self.file_path.endswith(".ktb"):
            with zipfile.ZipFile(self.file_path, "r") as zip:
                html_data = zip.read("document.html").decode("utf-8")
                json_data = json.loads(zip.read("info.json").decode("utf-8"))
            self.editor.setHtml(html_data)
            self.apply_page_size(json_data["page size"])
        elif self.file_path.endswith(".txt"):
            with open(self.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                self.editor.setPlainText(data)
        elif self.file_path.endswith(".md"):
            with open(self.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                self.editor.setMarkdown(data)
        self.editor.document().setModified(False)
        self.editor.document().setPageSize(QSize(self.editor.base_width, self.editor.base_height))
        total_pages = self.editor.document().pageCount()
        self.editor.setFixedSize(self.editor.width(), total_pages * self.editor.base_height)
        self.file_name = Path(self.file_path).name
        self.setWindowTitle(f"{self.file_name}  –  Kitab")

    def open(self):
        self.file_path, self.format_filter = QFileDialog.getOpenFileName(self, "Open", self.last_directory, "Kitab, Text and Markdown Files (*.ktb *.txt *.md);;Kitab Files (*.ktb);;Text Files (*.txt);;Markdown Files (*.md)")
        if not self.file_path:
            return
        self.last_directory = str(Path(self.file_path).parent)
        self._open_file()


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

    def shortcuts(self):
        #fullscreen
        def toggle_fullscreen():
            if self.isFullScreen():
                self.showMaximized()
                
            else:
                self.showFullScreen()
        fullscreen = QAction(self)
        fullscreen.setShortcut(Qt.Key.Key_F11)
        fullscreen.triggered.connect(toggle_fullscreen)
        self.addAction(fullscreen)

        self.find_action = QAction(self)
        self.find_action.setText("Find")
        self.find_action.setShortcut("Ctrl+F")
        self.find_action.triggered.connect(self.find_replace)
        self.addAction(self.find_action)
        
        # Carrega atalhos de paginação dinamicamente
        try:
            from get_input_page import setup_page_shortcuts
            setup_page_shortcuts(self)
        except ImportError:
            pass

    def change_font_size(self):
        self.font_size = int(self.font_size_menu.currentText())
        font = self.editor.currentFont()
        font.setPointSize(self.font_size)
        self.editor.setCurrentFont(font)

        self.view.viewport().setFocus()


    def sync_font(self):
        if not self.editor.textCursor().hasSelection():
            font = self.editor.currentFont()
            font_size = font.pointSize()
            self.font_size_menu.setCurrentText(str(font_size))
            
            self.font_family_menu.setCurrentFont(font)

            self.color_button.setStyleSheet(f"font-weight: bold; background-color: {self.editor.textColor().name()};")

            bold_status = font.bold()
            self.bold_button.setChecked(bold_status)

            strikethrough_status = font.strikeOut()
            self.strikethrough_button.setChecked(strikethrough_status)

            underline_status = font.underline()
            self.underline_button.setChecked(underline_status)

            italic_status = font.italic()
            self.italic_button.setChecked(italic_status)

            char_format = self.editor.textCursor().charFormat()
            bg_color = char_format.background()
            if bg_color.style() != Qt.BrushStyle.NoBrush:
                self.highlight_button.setStyleSheet(f"background-color: {bg_color.color().name()};")
            else:
                self.highlight_button.setStyleSheet("background-color: yellow;")

            cursor = self.editor.textCursor()
            block_format = cursor.blockFormat()
            alignment_status = block_format.alignment()

            if alignment_status == (Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignLeft):
                self.align_left_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignHCenter):
                self.align_center_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignRight):
                self.align_right_button.setChecked(True)
    
    def font_color(self):
        dialog = QColorDialog()
        labels = dialog.findChildren(QLabel)
        for label in labels:
            if label.text() == "&HTML:":
                label.setText("&HEX:")
                label.adjustSize()
        
        if dialog.exec() == QColorDialog.Accepted:
            color = dialog.selectedColor()
            self.editor.setTextColor(color)
            self.color_button.setStyleSheet(f"font-weight: bold; background-color: {color.name()};")
        self.view.viewport().setFocus()

    def highlight_text(self):
        dialog = QColorDialog(self.highlight_color)
        labels = dialog.findChildren(QLabel)
        for label in labels:
            if label.text() == "&HTML:":
                label.setText("&HEX:")
                label.adjustSize()

        if dialog.exec() == QColorDialog.Accepted:
            self.highlight_color = dialog.selectedColor()
            cursor = self.editor.textCursor()
            if not cursor.hasSelection():
                cursor.select(QTextCursor.SelectionType.WordUnderCursor)
            char_format = QTextCharFormat()
            char_format.setBackground(self.highlight_color)
            cursor.mergeCharFormat(char_format)
            self.highlight_button.setStyleSheet(f"background-color: {self.highlight_color.name()};")
        self.view.viewport().setFocus()

    def toggle_bold(self):

        font = self.editor.currentFont()
        font.setBold(not font.bold())
        self.bold_button.setChecked(font.bold())
        self.editor.setCurrentFont(font)
        self.view.viewport().setFocus()

    def toggle_strikethrough(self):
        font = self.editor.currentFont()
        font.setStrikeOut(not font.strikeOut())
        self.strikethrough_button.setChecked(font.strikeOut())
        self.editor.setCurrentFont(font)
        self.view.viewport().setFocus()

    def toggle_underline(self):
        font = self.editor.currentFont()
        font.setUnderline(not font.underline())
        self.underline_button.setChecked(font.underline())
        self.editor.setCurrentFont(font)
        self.view.viewport().setFocus()

    def toggle_italic(self):
        font = self.editor.currentFont()
        font.setItalic(not font.italic())
        self.italic_button.setChecked(font.italic())
        self.editor.setCurrentFont(font)
        self.view.viewport().setFocus()

    def align(self, alignment):
        match alignment:
                case Qt.AlignmentFlag.AlignLeft:
                    self.align_left_button.setChecked(True)
                case Qt.AlignmentFlag.AlignHCenter:
                    self.align_center_button.setChecked(True)
                case Qt.AlignmentFlag.AlignRight:
                    self.align_right_button.setChecked(True)
        cursor = self.editor.textCursor()
        block_format = cursor.blockFormat()
        if alignment != Qt.AlignmentFlag.AlignHCenter:
            self.editor.text_alignment = alignment | Qt.AlignmentFlag.AlignAbsolute
        else:
            self.editor.text_alignment = alignment
        block_format.setAlignment(self.editor.text_alignment)
        cursor.mergeBlockFormat(block_format)
        self.view.viewport().setFocus()

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
        cursor.insertImage(image_format)

    def insert_table(self):
        rows, ok = QInputDialog.getInt(self, "Insert table", "Rows:", 2, 1, 100)
        if not ok:
            return
        columns, ok = QInputDialog.getInt(self, "Insert table", "Columns:", 2, 1, 20)
        if not ok:
            return
        width_percentage, ok = QInputDialog.getInt(self, "Insert table", "Width:", 100, 10, 100)
        if not ok:
            return
        table_format = QTextTableFormat()
        table_format.setCellPadding(4)
        table_format.setBorder(1)
        table_format.setBorderStyle(QTextTableFormat.BorderStyle.BorderStyle_Solid)
        table_format.setWidth(QTextLength(QTextLength.Type.PercentageLength, width_percentage))
        column_width = 100 / columns
        constraints = [QTextLength(QTextLength.Type.PercentageLength, column_width)] * columns
        table_format.setColumnWidthConstraints(constraints)
        cursor = self.editor.textCursor()
        table = cursor.insertTable(rows, columns, table_format)
        self.view.viewport().setFocus()

    def clear_formatting(self):
        cursor = self.editor.textCursor()
        plain = QTextCharFormat()
        plain.setFontPointSize(Editor.DEFAULT_FONT_SIZE)
        plain.setForeground(QColor(self.editor.DEFAULT_FONT_COLOR)) 
        cursor.setCharFormat(plain)
        block_format = cursor.blockFormat()
        block_format.clearBackground()
        block_format.setIndent(0)
        block_format.setObjectIndex(-1)
        cursor.setBlockFormat(block_format)
        self.editor.setCurrentCharFormat(plain)
        self.sync_font()
        font_size = self.editor.currentFont().pointSize()
        self.font_size_menu.setCurrentText(str(font_size))
        self.color_button.setStyleSheet(f"font-weight: bold; background-color: {self.editor.textColor().name()};")
        self.view.viewport().setFocus()

    def font_family(self, font):
        new_font = self.editor.currentFont()
        new_font.setFamily(font.family())
        self.editor.setCurrentFont(new_font)

    def find_replace(self):
        if getattr(self, "find_dialog", None) is None:
            self.find_dialog = FindReplaceDialog(self.editor, self)
        self.find_dialog.show()
        self.find_dialog.raise_()
        self.find_dialog.activateWindow()

    def page_size(self):
        if getattr(self, "page_size_dialog", None) is None:
            self.page_size_dialog = PageSizeDialog(self.editor, self, self.size_unit, self)
        try:
            self.page_size_dialog.show()
            self.page_size_dialog.raise_()
            self.page_size_dialog.activateWindow()
        except RuntimeError:
            self.page_size_dialog = PageSizeDialog(self.editor, self, self.size_unit, self)
            self.page_size_dialog.show()
            self.page_size_dialog.raise_()
            self.page_size_dialog.activateWindow()

    def apply_page_size(self, size):
        name = size
        width, height = Editor.PAGE_SIZES[name]
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


class Editor(QTextEdit):
    PAGE_SIZES = {
        "A4": (794, 1123),
        "Letter": (816, 1056),
        "A5": (559, 794),
        "Legal": (816, 1344),
    }
    DEFAULT_FONT_SIZE = 14
    DEFAULT_PAPER_COLOR = "white"
    DEFAULT_FONT_COLOR = "black"
    DEFAULT_PAGE_SIZE = "A4"
    def __init__(self, main_window):
        super().__init__()
        self.text_alignment = Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignAbsolute
        self.set_paper_and_font_color(self.DEFAULT_PAPER_COLOR, self.DEFAULT_FONT_COLOR)
        self.base_width, self.base_height = self.PAGE_SIZES[self.DEFAULT_PAGE_SIZE]
        self.page_size = self.DEFAULT_PAGE_SIZE
        self.main_window = main_window
        self.setMinimumSize(self.base_width, self.base_height)
        self.document().setPageSize(QSize(self.base_width, self.base_height))
        self.document().setDocumentMargin(20*(96/25.4)) #mm to pt (inch is 72 pt and is 25.4mm)
        self.page_count = self.document().pageCount()
        
        text_option = self.document().defaultTextOption()
        text_option.setFlags(text_option.flags() | QTextOption.Flag.IncludeTrailingSpaces)
        self.document().setDefaultTextOption(text_option)

        self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)

        font = self.font()
        font.setPointSize(self.DEFAULT_FONT_SIZE)
        self.setFont(font)
        self.textChanged.connect(self.check_page_limit)
        self.was_zooming = False 
        self.document().setModified(False)
    
    def dropEvent(self, event): #drag and drop a file
        if event.mimeData().hasUrls():
            path_list = event.mimeData().urls()
            if len(path_list) == 1:
                path = path_list[0].toLocalFile()
                if path.endswith(".txt") or path.endswith("ktb") or path.endswith("md"):
                    self.main_window.file_path = path
                    self.main_window._open_file()
            event.acceptProposedAction()
        else:
            super().dropEvent(event)

    def set_paper_and_font_color(self, paper_color, font_color):
        self.setStyleSheet(f"QTextEdit {{ background-color: {paper_color}; color: {font_color}; border: none; }};")
        self.paper_color = paper_color

    


    def current_page(self):
        center_y = self.main_window.view.mapToScene(0, int(self.main_window.view.viewport().rect().center().y()))
        return int(center_y.y() // self.base_height + 1)

    def keyPressEvent(self, event):
        if event.key() in (Qt.Key.Key_Return, Qt.Key.Key_Enter):
            font = self.currentFont()
            self.old_text_color = self.textColor()
            self.old_text_align = self.text_alignment
            
            cursor = self.textCursor()
            cursor.insertBlock()
            
            color = self.textColor()
            if color == self.paper_color:
                color = self.old_text_color
            else:
                self.old_text_color = self.textColor()
            QTimer.singleShot(0, lambda: self.update_enter(font, color))
        else:
            super().keyPressEvent(event)
    

    def update_enter(self, font, color):
        self.setCurrentFont(font)
        self.main_window.align(self.old_text_align)
        self.setTextColor(color)
        self.main_window.color_button.setStyleSheet(f"font-weight: bold; background-color: {color.name()};")
        self.main_window.bold_button.setChecked(font.bold())
        self.main_window.strikethrough_button.setChecked(font.strikeOut())
        self.main_window.underline_button.setChecked(font.underline()) 
        self.main_window.font_size_menu.setCurrentText(str(font.pointSize()))


    def check_page_limit(self):
        self.page_count = self.document().pageCount()
        self.setFixedSize(self.width(), self.page_count * self.base_height)
        self.main_window.scene.setSceneRect(QRectF(self.rect()))
        self.document().setPageSize(QSize(self.base_width, self.base_height))
        self.page_count = self.document().pageCount()


    def set_line_height(self, value):
        cursor = self.textCursor()
        cursor.select(QTextCursor.SelectionType.Document)
        block_format = cursor.blockFormat()
        block_format.setLineHeight(float(value), QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
        cursor.setBlockFormat(block_format)


    def paintEvent(self, event):
        painter = QPainter(self.viewport())
        gap_height = 6  #The thickness of the gap (in pixels)
        for page_index in range(self.page_count):
            page_bottom = (page_index+1) * self.base_height - gap_height/2 #page bottom position
            if page_index < self.page_count - 1: #excludes last page
                gap_rect = QRectF(0, page_bottom, self.width(), gap_height) #create gap
                painter.fillRect(gap_rect, BACKGROUND_COLOR) #color gap
        painter.end()
        super().paintEvent(event)


    def mouseReleaseEvent(self, event):
        if event.button() == Qt.MouseButton.RightButton:
            if self.was_zooming:
                self.was_zooming = False
                event.accept()
                return
            menu = QMenu()

            undo_icon = QIcon.fromTheme("edit-undo")
            redo_icon = QIcon.fromTheme("edit-redo")
            cut_icon = QIcon.fromTheme("edit-cut")
            copy_icon = QIcon.fromTheme("edit-copy")
            paste_icon = QIcon.fromTheme("edit-paste")
            find_icon = QIcon.fromTheme("edit-find")
            select_all_icon = QIcon.fromTheme("edit-select-all")

            undo = menu.addAction("Undo")
            undo.setShortcut("Ctrl+Z")
            undo.setIcon(undo_icon)
            undo.setEnabled(self.document().isUndoAvailable())
            undo.triggered.connect(self.undo)
            
            redo = menu.addAction("Redo")
            redo.setShortcut("Ctrl+Shift+Z")
            redo.setIcon(redo_icon)
            redo.setEnabled(self.document().isRedoAvailable())
            redo.triggered.connect(self.redo)
            
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
        if event.button() == Qt.MouseButton.RightButton:
            self.was_zooming = False
        super().mousePressEvent(event)