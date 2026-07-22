#Copyright (C) <2026> <Abdulrahman>
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QMainWindow, QColorDialog, QToolBar, QFileDialog, QLabel, QPushButton, QHBoxLayout, QApplication, QGraphicsScene, QGraphicsView, QComboBox, QButtonGroup, QProgressDialog, QDialog, QFontComboBox, QStatusBar, QMessageBox
from PySide6.QtGui import QAction, QIntValidator, QIcon, QColor, QPageSize, QPdfWriter, QTextCharFormat, QTextImageFormat, QShortcut, QPalette
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
from PySide6.QtCore import QTimer, Qt, QSize, QElapsedTimer, QRectF
import sys
from pathlib import Path
import zipfile
import json
from editor import Editor
from dialogs import *
from recent_documents import _show_recent_dialog, register_recent_file

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.app = QApplication.instance()
        resolution = self.app.primaryScreen().availableSize()
        self.resize(resolution.width()/1.5, resolution.height()/1.5)
        self.move((resolution.width()-self.width())/2, 0)
        self.setWindowTitle("Kitab")
        self.file_path = None
        self.file_name = None
        self.format_filter = None
        self.last_directory = None
        
        icon_path = str(Path(__file__).resolve().parent.parent.parent / "icon.png")
        self.setWindowIcon(QIcon(icon_path))

        self.showMaximized()
        self.scene = QGraphicsScene()
        self.editor = Editor(self)

        self.add_toolbar()
        self.add_menubar()

        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        
        self.scene.addWidget(self.editor)
        self.view = QGraphicsView(self.scene)
        self.view.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.background_color = self.app.palette().color(QPalette.ColorRole.Dark)
        self.view.setStyleSheet(f"QGraphicsView {{background-color: {self.background_color.name()};}}")
        self.app.styleHints().colorSchemeChanged.connect(self.update_background_color)
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
        QTimer.singleShot(0, lambda: (self.view.viewport().setFocus(), self.editor.setFocus()))

    def update_background_color(self): #updates background color on system theme change
        self.background_color = self.app.palette().color(QPalette.ColorRole.Dark)
        self.view.setStyleSheet(f"QGraphicsView {{background-color: {self.background_color.name()};}}")

    def closeEvent(self, event):
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
                status = self.save()
                if status == "canceled":
                    event.ignore()
                else:
                    event.accept() 
                
            elif clicked == donotsave_button:
                event.accept()
            else:
                event.ignore()

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


    def add_toolbar(self):
        self.toolbar = QToolBar()
        self.toolbar.layout().setSpacing(5)
        self.toolbar.setContentsMargins(3, 3, 3, 3)
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
        self.font_size_menu.setCurrentText(str(self.editor.DEFAULT_FONT_SIZE))
        self.font_size = int(self.font_size_menu.currentText())
        self.font_size_menu.setEditable(True)
        self.font_size_menu.lineEdit().setValidator(QIntValidator(6, 500, self))
        self.font_size_menu.activated.connect(self.change_font_size)
        self.font_size_menu.lineEdit().returnPressed.connect(lambda: (self.change_font_size(), self.view.viewport().setFocus()))
        self.font_size_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_size_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        self.font_size_menu.setFixedWidth(self.size_unit*2.5)

        pt = QLabel("pt", self.font_size_menu)
        pt_layout = QHBoxLayout()
        self.font_size_menu.lineEdit().setLayout(pt_layout)
        pt_layout.setContentsMargins(self.size_unit, 0, 0, 0)
        pt_layout.addWidget(pt)

        self.toolbar.addWidget(self.font_size_menu)
        self.toolbar.addSeparator()

        self.color_button = QPushButton()
        color_icon = QIcon.fromTheme("format-text-color-symbolic")
        self.color_button.setIcon(color_icon)
        self.color_button.setToolTip("Font Color")
        self.color_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.color_button.setStyleSheet(f"QPushButton {{background-color: {self.editor.DEFAULT_FONT_COLOR};}}")
        self.color_button.clicked.connect(self.font_color)
        self.toolbar.addWidget(self.color_button)
        self.toolbar.addSeparator()

        self.highlight_color = QColor("yellow")
        self.highlight_button = QPushButton()
        hightlight_icon = QIcon.fromTheme("draw-highlight-symbolic")
        self.highlight_button.setIcon(hightlight_icon)
        self.highlight_button.setToolTip("Hightlight")
        self.highlight_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.highlight_button.clicked.connect(self.highlight_text)
        self.toolbar.addWidget(self.highlight_button)
        self.toolbar.addSeparator()

        self.bold_button = QPushButton()
        bold_icon = QIcon.fromTheme("format-text-bold-symbolic")
        self.bold_button.setIcon(bold_icon)
        self.bold_button.setToolTip("Bold")
        self.bold_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.bold_button.setCheckable(True)
        self.bold_button.clicked.connect(self.toggle_bold)
        self.toolbar.addWidget(self.bold_button)

        self.strikethrough_button = QPushButton()
        strikethrough_icon = QIcon.fromTheme("format-text-strikethrough-symbolic")
        self.strikethrough_button.setIcon(strikethrough_icon)
        self.strikethrough_button.setToolTip("Strikethrough")
        self.strikethrough_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.strikethrough_button.setCheckable(True)
        self.strikethrough_button.clicked.connect(self.toggle_strikethrough)
        self.toolbar.addWidget(self.strikethrough_button)

        self.underline_button = QPushButton()
        underline_icon = QIcon.fromTheme("format-text-underline-symbolic")
        self.underline_button.setIcon(underline_icon)
        self.underline_button.setToolTip("Underline")
        self.underline_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.underline_button.setCheckable(True)
        self.underline_button.clicked.connect(self.toggle_underline)
        self.toolbar.addWidget(self.underline_button)

        self.italic_button = QPushButton()
        italic_icon = QIcon.fromTheme("format-text-italic-symbolic")
        self.italic_button.setIcon(italic_icon)
        self.italic_button.setToolTip("Italic")
        self.italic_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.italic_button.setCheckable(True)
        self.italic_button.clicked.connect(self.toggle_italic)
        self.toolbar.addWidget(self.italic_button)

        self.clear_formatting_button = QPushButton()
        clear_formatting_icon = QIcon.fromTheme("edit-clear-symbolic")
        self.clear_formatting_button.setIcon(clear_formatting_icon)
        self.clear_formatting_button.setToolTip("Clear Formatting")
        self.clear_formatting_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.clear_formatting_button.clicked.connect(self.clear_formatting)
        self.toolbar.addWidget(self.clear_formatting_button)
        self.toolbar.addSeparator()

        self.align_left_button = QPushButton()
        align_left_icon = QIcon.fromTheme("format-justify-left-symbolic")
        self.align_left_button.setIcon(align_left_icon)
        self.align_left_button.setShortcut("Ctrl+L")
        self.align_left_button.setToolTip("Align Left")
        self.align_left_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.align_left_button.setCheckable(True)
        self.align_left_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignLeft))
        self.toolbar.addWidget(self.align_left_button)

        self.align_center_button = QPushButton()
        align_center_icon = QIcon.fromTheme("format-justify-center-symbolic")
        self.align_center_button.setIcon(align_center_icon)
        self.align_center_button.setShortcut("Ctrl+E")
        self.align_center_button.setToolTip("Align Center")
        self.align_center_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.align_center_button.setCheckable(True)
        self.align_center_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignHCenter))
        self.toolbar.addWidget(self.align_center_button)

        self.align_right_button = QPushButton()
        align_right_icon = QIcon.fromTheme("format-justify-right-symbolic")
        self.align_right_button.setIcon(align_right_icon)
        self.align_right_button.setShortcut("Ctrl+R")
        self.align_right_button.setToolTip("Align Right")
        self.align_right_button.setFixedSize(self.size_unit*1.5, self.size_unit)
        self.align_right_button.setCheckable(True)
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
        elif event.type() == event.Type.NativeGesture:
            if event.gestureType() == Qt.ZoomNativeGesture:
                scale = event.value()
                if scale>0:
                    self.zoom("in", 0.12)
                elif scale<0:
                    self.zoom("out", 0.12)
        return super().eventFilter(watched, event)


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


    def zoom(self, direction: str, gesture_term=0):
        self.editor.was_zooming = True
        resolution = self.app.primaryScreen().size()
        resolution_factor = resolution.height() / 720 #my resolution is 1080p with 150% scaling. the factor use is to make the max and min limits equal on all resolutions
        min = 0.05 * resolution_factor
        max = 5.0 * resolution_factor
        zoom_in_factor = 1.15 - gesture_term
        zoom_out_factor = 0.85 + gesture_term
        if direction == "in" and self.zoom_factor < max:
            self.zoom_factor *= zoom_in_factor
        elif direction == "out" and self.zoom_factor > min:
            self.zoom_factor *= zoom_out_factor
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
            self.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", self.last_directory, "Kitab File (*.ktb);;Text File (*.txt);;Markdown File  (*.md)")
            if not self.file_path:
                return "canceled"
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
        self.view.viewport().setFocus()
        self.editor.setFocus()

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

        try:
            register_recent_file(self.file_path)
        except ImportError:
            pass

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

        # binds Ctrl+1 through Ctrl+9 to quickly jump to specific pages
        for i in range(1, 10):
            shortcut = QShortcut(f"Ctrl+{i}", self)
            shortcut.activated.connect(lambda page=i: _go_to_page(page))

        def _go_to_page(page):
            if page > self.editor.page_count:
                return
            target_y = (page - 1) * self.editor.base_height + (self.editor.base_height / 2)
            self.view.centerOn(self.view.sceneRect().center().x(), target_y)

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

            self.color_button.setStyleSheet(f"QPushButton {{ background-color: {self.editor.textColor().name()}; }}")

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
                self.highlight_button.setStyleSheet(f"QPushButton {{ background-color: {bg_color.color().name()}; }}")
            else:
                self.highlight_button.setStyleSheet("")

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
            self.color_button.setStyleSheet(f"QPushButton {{ background-color: {color.name()}; }}")
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
            char_format = self.editor.currentCharFormat()
            char_format.setBackground(self.highlight_color)
            self.editor.setCurrentCharFormat(char_format)
            self.highlight_button.setStyleSheet(f"QPushButton {{background-color: {self.highlight_color.name()}; }}")
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

    def clear_formatting(self):
        cursor = self.editor.textCursor()
        plain = QTextCharFormat()
        plain.setFontPointSize(self.editor.DEFAULT_FONT_SIZE)
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
        self.color_button.setStyleSheet(f"QPushButton {{ background-color: {self.editor.textColor().name()}; }}")
        self.view.viewport().setFocus()

    def font_family(self, font):
        new_font = self.editor.currentFont()
        new_font.setFamily(font.family())
        self.editor.setCurrentFont(new_font)

    def find_replace(self):
        if getattr(self, "find_dialog", None) is None:
            self.find_dialog = FindReplaceDialog(self.editor, self)
        self.find_dialog.show()
        self.find_dialog.activateWindow()

    def insert_table(self):
            if getattr(self, "insert_table_dialog", None) is None:
                self.insert_table_dialog = InsertTableDialog(self.editor, self)
            try:
                self.insert_table_dialog.exec()
            except RuntimeError:
                self.insert_table_dialog = InsertTableDialog(self.editor, self)
                self.insert_table_dialog.exec()

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
