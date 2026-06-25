
from PySide6.QtWidgets import QMainWindow, QTextEdit, QColorDialog, QToolBar, QFileDialog, QLabel, QMenu, QPushButton, QWidget, QHBoxLayout, QApplication, QGraphicsScene, QGraphicsView, QComboBox, QSizePolicy, QButtonGroup, QProgressDialog
from PySide6.QtGui import QAction, QIntValidator, QGuiApplication, QIcon, QPainter, QColor, QPageLayout, QPageSize, QCursor, QImage, QPixmap, QPdfWriter, QShortcut, QKeySequence, QTextCursor, QTextBlockFormat, QFont, QTextCharFormat
from PySide6.QtPrintSupport import QPrinter
from PySide6.QtCore import QTimer, Qt, QSize, QRect, QMarginsF, QElapsedTimer, QRectF
from PySide6.QtWebEngineCore import QWebEnginePage
from PySide6.QtWebEngineWidgets import QWebEngineView
import base64
import sys
from pathlib import Path
import asyncio
import time


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        open_with_commandline = False
        app = QApplication.instance()
        resolution = app.primaryScreen().availableSize()
        self.resize(resolution.width()/2, resolution.height())
        self.move((resolution.width()-self.width())/2, 0)
        self.setWindowTitle("Kitab")
        self.file_path = None
        self.file_name = None
        self.format_filter = None
        
        from images import ICON_BASE64
        icon = QImage.fromData(base64.b64decode(ICON_BASE64))
        self.setWindowIcon(QIcon(QPixmap.fromImage(icon)))

        self.showNormal()
        self.scene = QGraphicsScene()

        self.add_menubar()
        self.add_toolbar()
        self.editor = Editor(self)

        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        
        self.scene.addWidget(self.editor)
        self.view = QGraphicsView(self.scene)
        self.view.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.view.setStyleSheet("background-color: #1e1e1e;")
        self.view.centerOn(self.editor.width() / 2, 0)
        
        self.setCentralWidget(self.view)

        self.editor.cursorPositionChanged.connect(self.sync_font)
        self.editor.textChanged.connect(self.sync_font)

        self.zoom_factor = resolution.height() / self.editor.height()
        self.view.scale(self.zoom_factor, self.zoom_factor)
        self.view.viewport().installEventFilter(self)

        self.shortcuts()

        #opening file with commandline
        if len(sys.argv) == 2:
            open_with_commandline = True
            self.file_path = sys.argv[1]
            print(self.file_path[-3:])
            self.editor.blockSignals(True)
            with open(self.file_path, "r", encoding="utf-8") as file:
                if self.file_path[-3:] == "ktb":
                    self.format_filter = "Kitab File (*.ktb)"
                    data = file.read()
                    self.editor.setHtml(data)
                elif self.file_path[-3:] == "txt":
                    self.format_filter = "Text File (*.txt)"
                    data = file.read()
                    self.editor.setPlainText(data)

                self.editor.document().setPageSize(QSize(self.editor.base_width, self.editor.base_height))
                total_pages = self.editor.document().pageCount()
                self.editor.setFixedSize(self.editor.width(), total_pages * self.editor.base_height)
                self.file_name = Path(self.file_path).name
                self.setWindowTitle(f"{self.file_name}  –  Kitab")
            self.editor.blockSignals(False)
        self.view.viewport().setFocus()
        if not open_with_commandline:
            self.editor.setFocus()
            self.sync_font()
        
        
    def add_menubar(self):
        menubar = self.menuBar()

        file_menu = menubar.addMenu("File")

        new_option = file_menu.addAction("New")
        new_option.triggered.connect(self.new)
        new_option.setShortcut("Ctrl+N")

        open_option = file_menu.addAction("Open")
        open_option.triggered.connect(self.open_file)
        open_option.setShortcut("Ctrl+O")

        save_option = file_menu.addAction("Save")
        save_option.triggered.connect(self.save)
        save_option.setShortcut("Ctrl+S")

        save_as_option = file_menu.addAction("Save As")
        save_as_option.triggered.connect(self.save_as)
        save_as_option.setShortcut("Ctrl+Shift+S")

        export = file_menu.addAction("Export")
        export.triggered.connect(self.export_file)

    
    def add_toolbar(self):
        toolbar = QToolBar()
        toolbar.setMovable(False)
        
        self.font_size_menu = QComboBox()
        self.font_size_menu.addItems(["6","7","8","9","10","11","12","13","14","15","16","18","20","21","22","24","26","28","32","36","40","42","44","48","54","60","66","72","80","88","96"])
        self.font_size_menu.setCurrentText("16")
        self.font_size = int(self.font_size_menu.currentText())
        self.font_size_menu.setEditable(True)
        validator = QIntValidator(6, 500, self)
        self.font_size_menu.lineEdit().setValidator(validator)
        self.font_size_menu.activated.connect(self.change_font_size)
        self.font_size_menu.lineEdit().returnPressed.connect(self.change_font_size)
        self.font_size_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_size_menu.setInsertPolicy(QComboBox.InsertPolicy.NoInsert)
        self.font_size_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        toolbar.addWidget(self.font_size_menu)
        toolbar.addSeparator()

        self.color_button = QPushButton("C", self)
        self.color_button.setFixedSize(self.color_button.sizeHint().height()*1.5, self.color_button.sizeHint().height())
        self.color_button.setStyleSheet("font-weight: bold; background-color: black")
        self.color_button.clicked.connect(self.font_color)
        toolbar.addWidget(self.color_button)
        toolbar.addSeparator()

        self.bold_button = QPushButton("B", self)
        self.bold_button.setFixedSize(self.bold_button.sizeHint().height()*1.5, self.bold_button.sizeHint().height())
        self.bold_button.setCheckable(True)
        self.bold_button.setStyleSheet("font-weight: bold")
        self.bold_button.clicked.connect(self.toggle_bold)
        toolbar.addWidget(self.bold_button)
        toolbar.addSeparator()

        self.strikethrough_button = QPushButton("—", self)
        self.strikethrough_button.setFixedSize(self.strikethrough_button.sizeHint().height()*1.5, self.strikethrough_button.sizeHint().height())
        self.strikethrough_button.setCheckable(True)
        self.strikethrough_button.setStyleSheet("font-weight: bold")
        self.strikethrough_button.clicked.connect(self.toggle_strikethrough)
        toolbar.addWidget(self.strikethrough_button)
        toolbar.addSeparator()

        self.underline_button = QPushButton("—", self)
        self.underline_button.setFixedSize(self.underline_button.sizeHint().height()*1.5, self.underline_button.sizeHint().height())
        self.underline_button.setCheckable(True)
        self.underline_button.setStyleSheet("font-weight: bold; text-align: bottom;")
        self.underline_button.clicked.connect(self.toggle_underline)
        toolbar.addWidget(self.underline_button)
        toolbar.addSeparator()

        self.align_left_button = QPushButton("←", self)
        self.align_left_button.setFixedSize(self.bold_button.sizeHint().height()*1.5, self.bold_button.sizeHint().height())
        self.align_left_button.setCheckable(True)
        self.align_left_button.setStyleSheet("font-size: 18pt")
        self.align_left_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignLeft))
        toolbar.addWidget(self.align_left_button)

        self.align_center_button = QPushButton("•", self)
        self.align_center_button.setFixedSize(self.bold_button.sizeHint().height()*1.5, self.bold_button.sizeHint().height())
        self.align_center_button.setCheckable(True)
        self.align_center_button.setStyleSheet("font-size: 18pt")
        self.align_center_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignHCenter))
        toolbar.addWidget(self.align_center_button)

        self.align_right_button = QPushButton("→", self)
        self.align_right_button.setFixedSize(self.bold_button.sizeHint().height()*1.5, self.bold_button.sizeHint().height())
        self.align_right_button.setCheckable(True)
        self.align_right_button.setStyleSheet("font-size: 18pt")
        self.align_right_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignRight))
        toolbar.addWidget(self.align_right_button)
        self.alignment_group = QButtonGroup(self)
        self.alignment_group.setExclusive(True)
        self.alignment_group.addButton(self.align_left_button)
        self.alignment_group.addButton(self.align_center_button)
        self.alignment_group.addButton(self.align_right_button)

        self.addToolBar(toolbar)


    def eventFilter(self, watched, event):
        if event.type() == event.Type.Wheel:
            self.wheelEvent(event)
            return True  #Blocks the underlying scene elements from swallowing the scroll
        return super().eventFilter(watched, event) #If not a scroll return to original event filter


    def wheelEvent(self, event):
        if event.modifiers() == Qt.KeyboardModifier.ControlModifier or event.buttons() == Qt.MouseButton.RightButton:
            self.editor.was_zooming = True
            direction = event.angleDelta().y()
            if direction > 0:
                self.zoom("in")
            else:
                self.zoom("out")
        else:
            scroll_bar = self.view.verticalScrollBar()
            if scroll_bar:
                steps = event.angleDelta().y()
                scroll_bar.setValue(scroll_bar.value() - steps)

    def zoom(self, direction: str):
        if direction == "in" and self.zoom_factor < 5.0:
            self.zoom_factor += 0.075
        elif direction == "out" and self.zoom_factor > 0.1:
            self.zoom_factor -= 0.075
        
        self.view.resetTransform()  
        self.view.scale(self.zoom_factor, self.zoom_factor)
        
    def save(self):
        if not self.file_path:
            self.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", "", "Kitab File (*.ktb);;Text File (*.txt)")
            if not self.file_path:
                return
            else:
                saving = QProgressDialog("Saving...", None, 0, 0, self)
                saving.setWindowTitle("Saving...")
                saving.setWindowModality(Qt.WindowModality.WindowModal)
                save_timer = QElapsedTimer()
                save_timer.start()
                saving.show()
                with open(self.file_path, "w", encoding="utf-8") as file:
                    if self.format_filter == "Kitab File (*.ktb)":
                        data = self.editor.toHtml()
                    elif self.format_filter == "Text File (*.txt)":
                        data = self.editor.toPlainText()
                    file.write(data)
                    self.file_name = Path(self.file_path).name
                    self.setWindowTitle(f"{self.file_name}  –  Kitab")
                time_taken = save_timer.elapsed()
                minimum_time = 500
                if time_taken >= minimum_time:
                    saving.close()
                else:
                    remaining_time = minimum_time - time_taken
                    QTimer.singleShot(remaining_time, saving.close)
        else:
            saving = QProgressDialog("Saving...", None, 0, 0, self)
            saving.setWindowTitle("Saving...")
            saving.setWindowModality(Qt.WindowModality.WindowModal)
            save_timer = QElapsedTimer()
            save_timer.start()
            saving.show()
            with open(self.file_path, "w", encoding="utf-8") as file:
                if self.format_filter == "Kitab File (*.ktb)":
                    data = self.editor.toHtml()
                elif self.format_filter == "Text File (*.txt)":
                    data = self.editor.toPlainText()
                file.write(data)
            time_taken = save_timer.elapsed()
            minimum_time = 500
            if time_taken >= minimum_time:
                saving.close()
            else:
                remaining_time = minimum_time - time_taken
                QTimer.singleShot(remaining_time, saving.close)



    def save_as(self):
        file_path, format_filter = self.file_path, self.format_filter
        self.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", "", "Kitab File (*.ktb);;Text File (*.txt)")
        saving = QProgressDialog("Saving...", None, 0, 0, self)
        saving.setWindowTitle("Saving...")
        saving.setWindowModality(Qt.WindowModality.WindowModal)
        save_timer = QElapsedTimer()
        save_timer.start()
        saving.show()
        if not self.file_path:
            self.file_path, self.format_filter = file_path, format_filter
        else:
            with open(self.file_path, "w", encoding="utf-8") as file:
                if self.format_filter == "Kitab File (*.ktb)":
                    data = self.editor.toHtml()
                elif self.format_filter == "Text File (*.txt)":
                    data = self.editor.toPlainText()
                file.write(data)
                self.file_name = Path(self.file_path).name
                self.setWindowTitle(f"{self.file_name}  –  Kitab")
        time_taken = save_timer.elapsed()
        minimum_time = 500
        if time_taken >= minimum_time:
            saving.close()
        else:
            remaining_time = minimum_time - time_taken
            QTimer.singleShot(remaining_time, saving.close)

    def new(self):
        self.setWindowTitle("Kitab")
        self.file_path = None
        self.format_filter = None
        self.file_name = None
        self.editor.clear()

    def open_file(self):
        self.editor.blockSignals(True)
        self.file_path, self.format_filter = QFileDialog.getOpenFileName(self, "Open", "", "Kitab File (*.ktb);;Text File (*.txt)")
        if not self.file_path:
            return
        else:
            with open(self.file_path, "r", encoding="utf-8") as file:
                if self.format_filter == "Kitab File (*.ktb)":
                    data = file.read()
                    self.editor.setHtml(data)
                elif self.format_filter == "Text File (*.txt)":
                    data = file.read()
                    self.editor.setPlainText(data)

                self.editor.document().setPageSize(QSize(self.editor.base_width, self.editor.base_height))
                total_pages = self.editor.document().pageCount()
                self.editor.setFixedSize(self.editor.width(), total_pages * self.editor.base_height)
                self.file_name = Path(self.file_path).name
                self.setWindowTitle(f"{self.file_name}  –  Kitab")
        self.editor.blockSignals(False)
                


    def export_file(self):
        self.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Export file", "", "PDF File (*.pdf)")
        if not self.file_path:
            return
        else:
            exporting = QProgressDialog("Exporting...", None, 0, 0, self)
            exporting.setWindowTitle("Exporting...")
            exporting.setWindowModality(Qt.WindowModality.WindowModal)
            export_timer = QElapsedTimer()
            export_timer.start()
            exporting.show()
            pdf_writer = QPdfWriter(self.file_path)
            pdf_writer.setPageSize(QPageSize(QPageSize.PageSizeId.A4))
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
        
        def printsomethingdef():
            print(self.editor.document().size())
            
        printsomething =  QAction(self)
        printsomething.setShortcut(Qt.Key.Key_F1)
        printsomething.triggered.connect(printsomethingdef)
        self.addAction(printsomething)

    def change_font_size(self):
        self.font_size = int(self.font_size_menu.currentText())
        font = self.editor.currentFont()
        font.setPointSize(self.font_size)
        self.editor.setCurrentFont(font)

        self.view.viewport().setFocus()




    def sync_font(self):
        if not self.editor.textCursor().hasSelection():
            font_size = self.editor.currentFont().pointSize()
            self.font_size_menu.setCurrentText(str(font_size))
            
            self.color_button.setStyleSheet(f"font-weight: bold; background-color: {self.editor.textColor().name()}")

            bold_status = self.editor.currentFont().bold()
            self.bold_button.setChecked(bold_status)

            strikethrough_status = self.editor.currentFont().strikeOut()
            self.strikethrough_button.setChecked(strikethrough_status)

            underline_status = self.editor.currentFont().underline()
            self.underline_button.setChecked(underline_status)

            cursor = self.editor.textCursor()
            block_format = cursor.blockFormat()
            alignment_status = block_format.alignment()

            print(alignment_status)
            if alignment_status == (Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignLeft):
                self.align_left_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignHCenter):
                self.align_center_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignRight):
                self.align_right_button.setChecked(True)
            else:
                text = cursor.block().text().strip()
                if text:
                    first_char = text[0]
                    is_arabic = '\u0600' <= first_char <= '\u06FF' or '\u0750' <= first_char <= '\u077F'
                else:
                    is_arabic = False
                    
                if is_arabic:
                    self.align_right_button.setChecked(True)
                else:
                    self.align_left_button.setChecked(True)
                
    
    def font_color(self):
        dialog = QColorDialog()
        labels = dialog.findChildren(QLabel)
        for label in labels:
            if label.text() == "&HTML:":
                label.setText("&HEX:")
                label.adjustSize()
        dialog.exec()
        color = dialog.selectedColor()
        self.editor.setTextColor(color)
        self.color_button.setStyleSheet(f"font-weight: bold; background-color: {color.name()}")
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
        self.editor.text_alignment = alignment | Qt.AlignmentFlag.AlignAbsolute
        block_format.setAlignment(self.editor.text_alignment)
        block_format.setProperty(0x010000, True) 
        cursor.mergeBlockFormat(block_format)
        self.view.viewport().setFocus()

class Editor(QTextEdit):
    def __init__(self, main_window):
        super().__init__()
        self.text_alignment = Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignAbsolute
        self.set_paper_color("black")
        self.last_page_char_index_list = []
        self.pages = []
        self.current_page = None
        self.base_width, self.base_height= 794, 1123
        self.main_window = main_window
        self.setMinimumSize(self.base_width, self.base_height)
        self.document().setPageSize(QSize(self.base_width, self.base_height))
        self.document().setDocumentMargin(20*(96/25.4)) #mm to pt (inch is 72 pt and is 25.4mm)
        self.page_count = self.document().pageCount()
        

        from PySide6.QtGui import QTextOption
        text_option = self.document().defaultTextOption()
        text_option.setFlags(text_option.flags() | QTextOption.Flag.IncludeTrailingSpaces)
        self.document().setDefaultTextOption(text_option)



        self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self.setStyleSheet("QTextEdit {background-color: white; color: black; border: none;}")
        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)

        font = self.font()
        font.setPointSize(16)
        self.setFont(font)
        self.textChanged.connect(self.check_page_limit)
        self.textChanged.connect(self.printinfo)
        self.cursorPositionChanged.connect(self.check_current_page)
        self.was_zooming = False 

    def printinfo(self):
        print(f"page count: {self.page_count}")
        
    def set_paper_color(self, color):
        self.setStyleSheet(f"QTextEdit {{ background-color: {color}; }}")
        self.paper_color = color

    def check_current_page(self):
        block_rect = self.cursorRect()
        cursor_y = block_rect.top()
        self.current_page = int( cursor_y // self.base_height + 1 )
        print(f"current page: {self.current_page}")

    def keyPressEvent(self, event):
        if event.key() in (Qt.Key.Key_Return, Qt.Key.Key_Enter):
            font = self.currentFont()
            self.old_text_color = self.textColor()
            self.old_text_align = self.text_alignment
            super().keyPressEvent(event)
            super().keyPressEvent(event)
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
        self.main_window.color_button.setStyleSheet(f"font-weight: bold; background-color: {color.name()}")
        self.main_window.bold_button.setChecked(font.bold())
        self.main_window.strikethrough_button.setChecked(font.strikeOut())
        self.main_window.underline_button.setChecked(font.underline()) 
        self.main_window.font_size_menu.setCurrentText(str(font.pointSize()))

    def check_page_limit(self):
        old_page_count = self.page_count
        cursor = self.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.Left, QTextCursor.MoveMode.KeepAnchor, 1)
        last_char_index = cursor.position()

        self.page_count = self.document().pageCount()
        self.setFixedSize(self.width(), self.page_count * self.base_height)
        self.main_window.scene.setSceneRect(QRectF(self.rect()))
        self.document().setPageSize(QSize(self.base_width, self.base_height))
        self.page_count = self.document().pageCount()

        ##########################
        if old_page_count != self.page_count:
            self.last_page_char_index_list.append(last_char_index)
            print(f"last page char list: {self.last_page_char_index_list}")
        ##########################

    def set_line_height(self, value):
        cursor = self.textCursor()
        cursor.select(QTextCursor.SelectionType.Document)
        block_format = cursor.blockFormat()
        block_format.setLineHeight(float(value), QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
        cursor.setBlockFormat(block_format)

    #############################
    def paintEvent(self, event):
        painter = QPainter(self.viewport())
        
        # 1. Total dimensions to keep track of
        total_pages = self.document().pageCount()
        gap_height = 5  # The thickness of the visual separator gap (in pixels)
        
        # 2. Draw a clean white background rectangle for each page sheet
        for page_index in range(total_pages):
            # Calculate top coordinate where this specific page sheet starts
            page_top = page_index * self.base_height
            
            # The printable area of the sheet (shrunk slightly at the bottom to form the gap)
            sheet_rect = QRect(0, page_top, self.width(), self.base_height - gap_height)
            
            # Paint the physical paper sheet white
            painter.fillRect(sheet_rect, QColor("white"))
            
            # Paint the gap area between pages a distinctive window-grey color
            if page_index < total_pages - 1:
                gap_rect = QRect(0, page_top + (self.base_height - gap_height), self.width(), gap_height)
                painter.fillRect(gap_rect, QColor("#1e1e1e")) # Visual page separator bar
        
        painter.end()
        
        # 3. Allow standard Qt text rendering to draw your typed words cleanly over our painted sheets
        super().paintEvent(event)
    #############################

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.MouseButton.RightButton:
            if self.was_zooming:
                self.was_zooming = False
                event.accept()
                return
            menu = QMenu()
            
            undo = menu.addAction("Undo")
            undo.setEnabled(self.document().isUndoAvailable())
            undo.triggered.connect(self.undo)
            
            redo = menu.addAction("Redo")
            redo.setEnabled(self.document().isRedoAvailable())
            redo.triggered.connect(self.redo)
            
            menu.addSeparator()
            
            cut = menu.addAction("Cut")
            cut.setEnabled(self.textCursor().hasSelection())
            cut.triggered.connect(self.cut)
            
            copy = menu.addAction("Copy")
            copy.setEnabled(self.textCursor().hasSelection())
            copy.triggered.connect(self.copy)
            
            paste = menu.addAction("Paste")
            paste.triggered.connect(self.paste)
            
            menu.addSeparator()

            find = menu.addAction("Find")
            #find.triggered.connect()
            
            select_all = menu.addAction("Select All")
            select_all.triggered.connect(self.selectAll)

            menu.exec(QCursor.pos())
            event.accept()
            return
            
        super().mouseReleaseEvent(event)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.RightButton:
            self.was_zooming = False
        super().mousePressEvent(event)
    
