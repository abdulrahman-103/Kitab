from PySide6.QtWidgets import QMainWindow, QTextEdit, QColorDialog, QToolBar, QFileDialog, QLabel, QMenu, QPushButton, QHBoxLayout, QApplication, QGraphicsScene, QGraphicsView, QComboBox, QSizePolicy, QButtonGroup, QProgressDialog, QMessageBox, QDialog, QLineEdit, QCheckBox, QFormLayout, QVBoxLayout, QFontComboBox, QInputDialog
from PySide6.QtGui import QAction, QIntValidator, QIcon, QPainter, QColor, QPageSize, QCursor, QImage, QPixmap, QPdfWriter, QTextCursor, QTextBlockFormat, QTextCharFormat, QTextOption, QTextDocument, QTextTableFormat, QTextLength, QTextImageFormat
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
from PySide6.QtCore import QTimer, Qt, QSize, QRect, QElapsedTimer, QRectF, QPoint
import base64
import sys
from pathlib import Path
from pyqttooltip import Tooltip, TooltipPlacement


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
        self.editor = Editor(self)
        self.add_menubar()
        self.add_toolbar()
        

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
            self.editor.blockSignals(True)
            with open(self.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                if self.file_path[-3:] == "ktb":
                    self.format_filter = "Kitab File (*.ktb)"
                    self.editor.setHtml(data)
                elif self.file_path[-3:] == "txt":
                    self.format_filter = "Text File (*.txt)"
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
        
    def closeEvent(self, event):
        def close_tooltips():
            tooltips = [self.color_tooltip, self.bold_tooltip, self.strikethrough_tooltip, self.underline_tooltip, self.clear_formatting_tooltip, self.align_left_tooltip, self.align_right_tooltip, self.align_center_tooltip, self.italic_tooltip, self.font_family_tooltip, self.font_size_tooltip]
            for tooltip in tooltips:
                try:
                    tooltip.deleteLater()
                except Exception:
                    pass
        if self.editor.document().isModified():
            msg_box = QMessageBox(self)
            msg_box.setWindowTitle("Unsaved changes")
            msg_box.setText("Do you want to save the file?")
            msg_box.setIcon(QMessageBox.Icon.Warning)

            save_button = msg_box.addButton("Save", QMessageBox.ButtonRole.AcceptRole)
            donotsave_button = msg_box.addButton("Don't Save", QMessageBox.ButtonRole.DestructiveRole)
            cancel_button = msg_box.addButton("Cancel", QMessageBox.ButtonRole.RejectRole)

            msg_box.setDefaultButton(save_button)
            msg_box.exec()
            clicked = msg_box.clickedButton()

            if clicked == save_button:
                close_tooltips()
                self.save()
                event.accept() 
                
            elif clicked == donotsave_button:
                close_tooltips()
                event.accept()
                
            else:
                event.ignore()
        close_tooltips()

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
        export.setShortcut("Ctrl+E")

        print_option = file_menu.addAction("Print")
        print_option.triggered.connect(self.print_document)
        print_option.setShortcut("Ctrl+P")

        insert_menu = menubar.addMenu("Insert")

        table_option = insert_menu.addAction("Table")
        table_option.triggered.connect(self.insert_table)
        table_option.setShortcut("Ctrl+T")

        image_option = insert_menu.addAction("Image")
        image_option.triggered.connect(self.insert_image)
        image_option.setShortcut("Ctrl+I")

        page_menu = menubar.addMenu("Page")

        page_size_option = page_menu.addAction("Page Size")
        page_size_option.triggered.connect(self.page_size)
    
    def add_toolbar(self):
        toolbar = QToolBar()
        toolbar.setMovable(False)
        self.font_family_menu = QFontComboBox()
        self.size_unit = self.font_family_menu.sizeHint().height()
        self.font_family_tooltip = Tooltip(self.font_family_menu, "Font Family")
        self.font_family_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.font_family_tooltip.setShowDelay(500) 
        self.font_family_menu.setFontFilters(QFontComboBox.FontFilter.ScalableFonts)
        self.font_family_menu.setFixedWidth(self.size_unit*6)
        self.font_family_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_family_menu.currentFontChanged.connect(self.font_family)
        toolbar.addWidget(self.font_family_menu)
        toolbar.addSeparator()

        self.font_size_menu = QComboBox()
        self.font_size_tooltip = Tooltip(self.font_size_menu, "Font Size")
        self.font_size_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.font_size_tooltip.setShowDelay(500) 
        self.font_size_menu.addItems(["6","7","8","9","10","11","12","13","14","15","16","18","20","21","22","24","26","28","32","36","40","42","44","48","54","60","66","72","80","88","96"])
        self.font_size_menu.setCurrentText("14")
        self.font_size = int(self.font_size_menu.currentText())
        self.font_size_menu.setEditable(True)
        self.font_size_menu.lineEdit().setValidator(QIntValidator(6, 500, self))
        self.font_size_menu.activated.connect(self.change_font_size)
        self.font_size_menu.lineEdit().returnPressed.connect(self.change_font_size)
        self.font_size_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_size_menu.setInsertPolicy(QComboBox.InsertPolicy.NoInsert)
        self.font_size_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        toolbar.addWidget(self.font_size_menu)
        toolbar.addSeparator()

        self.color_button = QPushButton("", self)
        self.color_tooltip = Tooltip(self.color_button, "Font Color")
        self.color_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.color_tooltip.setShowDelay(500) 
        self.color_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.color_button.setStyleSheet("background-color: black")
        self.color_button.clicked.connect(self.font_color)
        toolbar.addWidget(self.color_button)
        toolbar.addSeparator()

        self.bold_button = QPushButton("B", self)
        self.bold_tooltip = Tooltip(self.bold_button, "Bold")
        self.bold_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.bold_tooltip.setShowDelay(500) 
        self.bold_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.bold_button.setCheckable(True)
        self.bold_button.setStyleSheet("font-weight: bold")
        self.bold_button.clicked.connect(self.toggle_bold)
        toolbar.addWidget(self.bold_button)
        toolbar.addSeparator()

        self.strikethrough_button = QPushButton("—", self)
        self.strikethrough_tooltip = Tooltip(self.strikethrough_button, "Strikethrough")
        self.strikethrough_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.strikethrough_tooltip.setShowDelay(500) 
        self.strikethrough_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.strikethrough_button.setCheckable(True)
        self.strikethrough_button.setStyleSheet("font-weight: bold")
        self.strikethrough_button.clicked.connect(self.toggle_strikethrough)
        toolbar.addWidget(self.strikethrough_button)
        toolbar.addSeparator()

        self.underline_button = QPushButton("—", self)
        self.underline_tooltip = Tooltip(self.underline_button, "Underline")
        self.underline_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.underline_tooltip.setShowDelay(500) 
        self.underline_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.underline_button.setCheckable(True)
        self.underline_button.setStyleSheet("font-weight: bold; text-align: bottom;")
        self.underline_button.clicked.connect(self.toggle_underline)
        toolbar.addWidget(self.underline_button)
        toolbar.addSeparator()

        self.italic_button = QPushButton("𝐼", self)
        self.italic_tooltip = Tooltip(self.italic_button, "Italic")
        self.italic_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.italic_tooltip.setShowDelay(500) 
        self.italic_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.italic_button.setCheckable(True)
        self.italic_button.setStyleSheet("font-weight: bold; text-align: bottom; font-size:12pt;")
        self.italic_button.clicked.connect(self.toggle_italic)
        toolbar.addWidget(self.italic_button)
        toolbar.addSeparator()

        self.clear_formatting_button = QPushButton("X", self)
        self.clear_formatting_tooltip = Tooltip(self.clear_formatting_button, "Clear Formatting")
        self.clear_formatting_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.clear_formatting_tooltip.setShowDelay(500) 
        self.clear_formatting_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.clear_formatting_button.setStyleSheet("font-weight: bold")
        self.clear_formatting_button.clicked.connect(self.clear_formatting)
        toolbar.addWidget(self.clear_formatting_button)
        toolbar.addSeparator()

        self.align_left_button = QPushButton("←", self)
        self.align_left_tooltip = Tooltip(self.align_left_button, "Align Left")
        self.align_left_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.align_left_tooltip.setShowDelay(500) 
        self.align_left_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.align_left_button.setCheckable(True)
        self.align_left_button.setStyleSheet("font-size: 18pt")
        self.align_left_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignLeft))
        toolbar.addWidget(self.align_left_button)

        self.align_center_button = QPushButton("•", self)
        self.align_center_tooltip = Tooltip(self.align_center_button, "Align Center")
        self.align_center_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.align_center_tooltip.setShowDelay(500) 
        self.align_center_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.align_center_button.setCheckable(True)
        self.align_center_button.setStyleSheet("font-size: 18pt")
        self.align_center_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignHCenter))
        toolbar.addWidget(self.align_center_button)

        self.align_right_button = QPushButton("→", self)
        self.align_right_tooltip = Tooltip(self.align_right_button, "Align Right")
        self.align_right_tooltip.setOffsetByPlacement(TooltipPlacement.BOTTOM, QPoint(0, self.size_unit*1.25))
        self.align_right_tooltip.setShowDelay(500) 
        self.align_right_button.setFixedSize(self.size_unit*1.5, self.size_unit)
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
            return True
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
                self.editor.document().setModified(False)
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
        if not self.file_path:
            self.file_path, self.format_filter = file_path, format_filter
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

    def new(self):
        self.setWindowTitle("Kitab")
        self.file_path = None
        self.format_filter = None
        self.file_name = None
        self.editor.clear()
        self.editor.document().setModified(False)

    def open_file(self):
        self.editor.blockSignals(True)
        self.file_path, self.format_filter = QFileDialog.getOpenFileName(self, "Open", "", "Kitab File (*.ktb);;Text File (*.txt)")
        if not self.file_path:
            return
        else:
            with open(self.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                if self.format_filter == "Kitab File (*.ktb)":
                    self.editor.setHtml(data)
                elif self.format_filter == "Text File (*.txt)":
                    self.editor.setPlainText(data)
                self.editor.document().setModified(False)
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

        self.find_action = QAction(self)
        self.find_action.setText("Find")
        self.find_action.setShortcut("Ctrl+F")
        self.find_action.triggered.connect(self.find_replace)
        self.addAction(self.find_action)
        

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

            self.color_button.setStyleSheet(f"font-weight: bold; background-color: {self.editor.textColor().name()}")

            bold_status = font.bold()
            self.bold_button.setChecked(bold_status)

            strikethrough_status = font.strikeOut()
            self.strikethrough_button.setChecked(strikethrough_status)

            underline_status = font.underline()
            self.underline_button.setChecked(underline_status)

            italic_status = font.italic()
            self.italic_button.setChecked(italic_status)

            cursor = self.editor.textCursor()
            block_format = cursor.blockFormat()
            alignment_status = block_format.alignment()

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
        
        if dialog.exec() == QColorDialog.Accepted:
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
        self.editor.text_alignment = alignment | Qt.AlignmentFlag.AlignAbsolute
        block_format.setAlignment(self.editor.text_alignment)
        cursor.mergeBlockFormat(block_format)
        self.view.viewport().setFocus()

    def print_document(self):
        printer = QPrinter(QPrinter.PrinterMode.HighResolution)
        printer.setPageSize(QPageSize(QPageSize.PageSizeId.A4))
        dialog = QPrintDialog(printer, self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.editor.document().print_(printer)

    def insert_image(self):
        path, _ = QFileDialog.getOpenFileName(self, "Choose image", "", "Image Files (*.png *.jpg *.jpeg *.bmp *.gif *.svg);;PNG Image (*.png);;JPEG Image (*.jpg *.jpeg);;SVG Image (*.svg);;BMP Image (*.bmp);;GIF Image (*.gif);;All Files (*)")

        if not path:
            return
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
        if not cursor.hasSelection():
            cursor.select(QTextCursor.SelectionType.BlockUnderCursor)
        plain = QTextCharFormat()
        plain.setFontPointSize(14)
        cursor.setCharFormat(plain)
        block_format = cursor.blockFormat()
        block_format.setIndent(0)
        block_format.setObjectIndex(-1)
        cursor.setBlockFormat(block_format)
        self.editor.setCurrentCharFormat(plain)
        self.sync_font()
        font_size = self.editor.currentFont().pointSize()
        self.font_size_menu.setCurrentText(str(font_size))
        self.color_button.setStyleSheet(f"font-weight: bold; background-color: {self.editor.textColor().name()}")
        self.view.viewport().setFocus()

    def font_family(self, font):
        new_font = self.editor.currentFont()
        new_font.setFamily(font.family())
        self.editor.setCurrentFont(new_font)

    def page_size(self):
        if getattr(self, "find_dialog", None) is None:
            self.page_size_dialog = QDialog(self)

            self.page_size_dialog.setWindowTitle("Find and replace")
            self.page_size_dialog.setFixedWidth(self.size_unit*10)
        self.page_size_dialog.show()
        self.page_size_dialog.raise_()
        self.page_size_dialog.activateWindow()

    def find_replace(self):
        if getattr(self, "find_dialog", None) is None:
            self.find_dialog = FindReplaceDialog(self.editor, self)
        self.find_dialog.show()
        self.find_dialog.raise_()
        self.find_dialog.activateWindow()

class FindReplaceDialog(QDialog):
    def __init__(self, editor, parent):
        super().__init__(parent)
        self.editor = editor
        self.setWindowTitle("Find and replace")
        self.setFixedWidth(parent.size_unit*10)

        self.find_field = QLineEdit()
        self.replace_field = QLineEdit()
        self.match_case = QCheckBox("Match case")

        form = QFormLayout()
        form.addRow("Find:", self.find_field)
        form.addRow("Replace:", self.replace_field)

        find_next = QPushButton("Find next")
        replace = QPushButton("Replace")
        replace_all = QPushButton("Replace all")

        find_next.setAutoDefault(False)
        replace.setAutoDefault(False)
        replace_all.setAutoDefault(False)

        find_next.clicked.connect(self.find_next)
        replace.clicked.connect(self.replace_one)
        replace_all.clicked.connect(self.replace_all)

        buttons = QHBoxLayout()
        buttons.addWidget(find_next)
        buttons.addWidget(replace)
        buttons.addWidget(replace_all)

        layout = QVBoxLayout(self)
        layout.addLayout(form)
        layout.addWidget(self.match_case)
        layout.addLayout(buttons)

        self.find_field.returnPressed.connect(self.find_next)

    def flags(self):
        flags = QTextDocument.FindFlag(0)
        if self.match_case.isChecked():
            flags |= QTextDocument.FindFlag.FindCaseSensitively
        return flags

    def find_next(self):
        text = self.find_field.text()
        if not text:
            return False
        found = self.editor.find(text, self.flags())
        if not found:
            #wrap around to the top and try once more
            cursor = self.editor.textCursor()
            cursor.movePosition(QTextCursor.MoveOperation.Start)
            self.editor.setTextCursor(cursor)
            found = self.editor.find(text, self.flags())
            
        return found

    def replace_one(self):
        cursor = self.editor.textCursor()
        if cursor.hasSelection() and cursor.selectedText() == self.find_field.text():
            cursor.insertText(self.replace_field.text())
        self.find_next()

    def replace_all(self):
        text = self.find_field.text()
        if not text:
            return
        cursor = self.editor.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.Start)
        self.editor.setTextCursor(cursor)
        count = 0
        while self.editor.find(text, self.flags()):
            self.editor.textCursor().insertText(self.replace_field.text())
            count += 1
        QMessageBox.information(self, "Replace all", f"{count} replacement(s) made.")


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
        

        text_option = self.document().defaultTextOption()
        text_option.setFlags(text_option.flags() | QTextOption.Flag.IncludeTrailingSpaces)
        self.document().setDefaultTextOption(text_option)



        self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self.setStyleSheet("QTextEdit {background-color: white; color: black; border: none;}")
        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)

        font = self.font()
        font.setPointSize(14)
        self.setFont(font)
        self.textChanged.connect(self.check_page_limit)
        self.cursorPositionChanged.connect(self.check_current_page)
        self.was_zooming = False 

        self.document().setModified(False)
        
        
    def set_paper_color(self, color):
        self.setStyleSheet(f"QTextEdit {{ background-color: {color}; }}")
        self.paper_color = color

    def check_current_page(self):
        block_rect = self.cursorRect()
        cursor_y = block_rect.top()
        self.current_page = int( cursor_y // self.base_height + 1 )

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
        gap_height = 5  #The thickness of the gap (in pixels)
        self.page_count = self.document().pageCount()
        for page_index in range(self.page_count):
            page_top = page_index * self.base_height
            if page_index < self.page_count - 1: #excludes last page
                gap_rect = QRect(0, page_top + (self.base_height - gap_height), self.width(), gap_height)
                painter.fillRect(gap_rect, QColor("#1e1e1e")) #draw gap
        
        painter.end()
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

            menu.addAction(self.main_window.find_action)
            
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
    
