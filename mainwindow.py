from PySide6.QtWidgets import (QMainWindow, QTextEdit, QColorDialog, QToolBar, QFileDialog, QLabel, QMenu, QPushButton,
                               QWidget, QHBoxLayout, QVBoxLayout, QApplication, QGraphicsScene, QGraphicsView, QComboBox,
                               QFontComboBox, QSizePolicy, QButtonGroup, QProgressDialog, QMessageBox, QTabWidget,
                               QToolButton, QDialog, QLineEdit, QCheckBox, QFormLayout, QDoubleSpinBox, QDialogButtonBox,
                               QFrame, QInputDialog)
from PySide6.QtGui import (QAction, QIntValidator, QIcon, QPainter, QColor, QPageSize, QCursor, QImage, QPixmap,
                           QPdfWriter, QKeySequence, QTextCursor, QTextBlockFormat, QTextCharFormat,
                           QTextListFormat, QTextTableFormat, QTextLength, QTextDocument)
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
from PySide6.QtCore import QTimer, Qt, QSize, QRect, QElapsedTimer, QRectF
import base64
import sys
from pathlib import Path


ACCENT = "#2f6df6"
ACCENT_HOVER = "#245ad8"
CANVAS = "#e8eaf0"

THEME = f"""
* {{
    font-family: "Segoe UI", "Inter", sans-serif;
    font-size: 13px;
    color: #1f2430;
}}
QMainWindow, QToolBar {{
    background: #ffffff;
    border: none;
}}
QMenuBar {{
    background: #ffffff;
    padding: 2px 6px;
}}
QMenuBar::item {{
    padding: 5px 12px;
    border-radius: 6px;
    background: transparent;
}}
QMenuBar::item:selected {{
    background: #eef2fb;
    color: {ACCENT};
}}
QMenu {{
    background: #ffffff;
    border: 1px solid #e3e6ee;
    border-radius: 10px;
    padding: 6px;
}}
QMenu::item {{
    padding: 7px 22px;
    border-radius: 6px;
}}
QMenu::item:selected {{
    background: {ACCENT};
    color: #ffffff;
}}
QMenu::separator {{
    height: 1px;
    background: #eaedf4;
    margin: 5px 8px;
}}
QTabWidget::pane {{
    border: none;
    border-top: 1px solid #e3e6ee;
    background: #fbfbfd;
}}
QTabBar::tab {{
    padding: 7px 18px;
    margin-right: 2px;
    border: none;
    border-radius: 8px 8px 0 0;
    color: #5b6376;
    font-weight: 600;
}}
QTabBar::tab:hover {{
    color: {ACCENT};
}}
QTabBar::tab:selected {{
    color: {ACCENT};
    background: #fbfbfd;
}}
QToolButton {{
    background: transparent;
    border: 1px solid transparent;
    border-radius: 7px;
    padding: 3px;
}}
QToolButton:hover {{
    background: #eef2fb;
    border-color: #dbe3f7;
}}
QToolButton:checked {{
    background: #dde7fd;
    border-color: {ACCENT};
    color: {ACCENT};
}}
QComboBox, QLineEdit, QDoubleSpinBox {{
    background: #ffffff;
    border: 1px solid #d8dde9;
    border-radius: 7px;
    padding: 4px 8px;
    selection-background-color: {ACCENT};
}}
QComboBox:hover, QLineEdit:hover {{
    border-color: #b9c4dc;
}}
QComboBox:focus, QLineEdit:focus, QDoubleSpinBox:focus {{
    border-color: {ACCENT};
}}
QComboBox::drop-down {{
    border: none;
    width: 18px;
}}
QComboBox QAbstractItemView {{
    background: #ffffff;
    border: 1px solid #e3e6ee;
    border-radius: 8px;
    padding: 4px;
    selection-background-color: {ACCENT};
    selection-color: #ffffff;
    outline: none;
}}
QPushButton {{
    background: {ACCENT};
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 7px 16px;
    font-weight: 600;
}}
QPushButton:hover {{
    background: {ACCENT_HOVER};
}}
QPushButton:pressed {{
    background: #1c4cbf;
}}
QCheckBox {{
    spacing: 7px;
}}
QDialog {{
    background: #ffffff;
}}
QScrollBar:vertical {{
    background: transparent;
    width: 12px;
    margin: 2px;
}}
QScrollBar::handle:vertical {{
    background: #c4cad8;
    border-radius: 5px;
    min-height: 30px;
}}
QScrollBar::handle:vertical:hover {{
    background: #aab2c6;
}}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
    height: 0;
}}
"""


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
        self.build_ribbon()
        self.editor = Editor(self)

        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        
        self.scene.addWidget(self.editor)
        self.view = QGraphicsView(self.scene)
        self.view.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.view.setStyleSheet(f"QGraphicsView {{ background-color: {CANVAS}; border: none; }}")
        self.view.centerOn(self.editor.width() / 2, 0)

        self.setCentralWidget(self.view)
        app.setStyleSheet(THEME)

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
                self.save()
                event.accept() 
                
            elif clicked == donotsave_button:
                event.accept()
                
            else:
                event.ignore()

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

        print_option = file_menu.addAction("Print")
        print_option.triggered.connect(self.print_document)
        print_option.setShortcut("Ctrl+P")

    
    def tool_button(self, text, tooltip, slot, checkable=False, width=30, bold=True):
        button = QToolButton(self)
        button.setText(text)
        button.setToolTip(tooltip)
        button.setCheckable(checkable)
        button.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        button.setFixedHeight(30)
        button.setFixedWidth(width)
        if bold:
            button.setStyleSheet("font-weight: bold;")
        button.clicked.connect(slot)
        return button

    def bar_icon(self, kind):
        #small word-style glyphs drawn so the alignment buttons dont rely on ambiguous arrows
        size = 18
        pixmap = QPixmap(size, size)
        pixmap.fill(Qt.GlobalColor.transparent)
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        color = QColor("#3a4254")
        full = size - 4
        short = int(full * 0.6)
        for i, y in enumerate((3, 7, 11, 15)):
            width = full if (kind == "justify" or i % 2 == 0) else short
            if kind == "right":
                x = size - 2 - width
            elif kind == "center":
                x = (size - width) // 2
            else:
                x = 2
            painter.fillRect(x, y, width, 2, color)
        painter.end()
        return QIcon(pixmap)

    def ribbon_group(self, title, widgets):
        group = QWidget()
        outer = QVBoxLayout(group)
        outer.setContentsMargins(6, 3, 6, 1)
        outer.setSpacing(2)
        row = QHBoxLayout()
        row.setContentsMargins(0, 0, 0, 0)
        row.setSpacing(3)
        for widget in widgets:
            row.addWidget(widget)
        outer.addLayout(row)
        label = QLabel(title)
        label.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        label.setStyleSheet("color: #777; font-size: 10px;")
        outer.addWidget(label)
        return group

    def vline(self):
        line = QFrame()
        line.setFrameShape(QFrame.Shape.VLine)
        line.setStyleSheet("color: #d9d9d9;")
        return line

    def build_ribbon(self):
        #tabbed ribbon: home / insert / layout
        ribbon = QTabWidget()
        ribbon.setMaximumHeight(96)
        ribbon.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        ribbon.addTab(self.home_tab(), "Home")
        ribbon.addTab(self.insert_tab(), "Insert")
        ribbon.addTab(self.layout_tab(), "Layout")

        bar = QToolBar()
        bar.setMovable(False)
        bar.setFloatable(False)
        bar.addWidget(ribbon)
        self.addToolBar(Qt.ToolBarArea.TopToolBarArea, bar)

    def home_tab(self):
        page = QWidget()
        layout = QHBoxLayout(page)
        layout.setContentsMargins(4, 2, 4, 2)
        layout.setSpacing(2)
        layout.setAlignment(Qt.AlignmentFlag.AlignLeft)

        #font family + size
        self.font_family_menu = QFontComboBox()
        self.font_family_menu.setMaximumWidth(150)
        self.font_family_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_family_menu.currentFontChanged.connect(self.change_font_family)

        self.font_size_menu = QComboBox()
        self.font_size_menu.addItems(["6","7","8","9","10","11","12","13","14","15","16","18","20","21","22","24","26","28","32","36","40","42","44","48","54","60","66","72","80","88","96"])
        self.font_size_menu.setCurrentText("16")
        self.font_size = int(self.font_size_menu.currentText())
        self.font_size_menu.setEditable(True)
        self.font_size_menu.setFixedWidth(56)
        self.font_size_menu.lineEdit().setValidator(QIntValidator(6, 500, self))
        self.font_size_menu.activated.connect(self.change_font_size)
        self.font_size_menu.lineEdit().returnPressed.connect(self.change_font_size)
        self.font_size_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_size_menu.setInsertPolicy(QComboBox.InsertPolicy.NoInsert)
        self.font_size_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        layout.addWidget(self.ribbon_group("Font", [self.font_family_menu, self.font_size_menu]))
        layout.addWidget(self.vline())

        #character formatting
        self.bold_button = self.tool_button("B", "Bold (Ctrl+B)", self.toggle_bold, checkable=True)
        self.italic_button = self.tool_button("I", "Italic (Ctrl+I)", self.toggle_italic, checkable=True)
        self.italic_button.setStyleSheet("font-weight: bold; font-style: italic;")
        self.underline_button = self.tool_button("U", "Underline (Ctrl+U)", self.toggle_underline, checkable=True)
        self.underline_button.setStyleSheet("font-weight: bold; text-decoration: underline;")
        self.strikethrough_button = self.tool_button("S", "Strikethrough", self.toggle_strikethrough, checkable=True)
        self.strikethrough_button.setStyleSheet("font-weight: bold; text-decoration: line-through;")
        self.color_button = self.tool_button("A", "Text color", self.font_color)
        self.color_button.setStyleSheet("font-weight: bold; background-color: black; color: white;")
        self.highlight_button = self.tool_button("H", "Highlight color", self.text_highlight)
        self.highlight_button.setStyleSheet("font-weight: bold; background-color: #ffff00;")
        layout.addWidget(self.ribbon_group("Format", [self.bold_button, self.italic_button, self.underline_button,
                                                      self.strikethrough_button, self.color_button, self.highlight_button]))
        layout.addWidget(self.vline())

        #paragraph: alignment, lists, indent, spacing
        self.align_left_button = self.tool_button("", "Align left", lambda: self.align(Qt.AlignmentFlag.AlignLeft), checkable=True)
        self.align_center_button = self.tool_button("", "Align center", lambda: self.align(Qt.AlignmentFlag.AlignHCenter), checkable=True)
        self.align_right_button = self.tool_button("", "Align right", lambda: self.align(Qt.AlignmentFlag.AlignRight), checkable=True)
        self.align_justify_button = self.tool_button("", "Justify", lambda: self.align(Qt.AlignmentFlag.AlignJustify), checkable=True)
        for button, kind in ((self.align_left_button, "left"), (self.align_center_button, "center"),
                             (self.align_right_button, "right"), (self.align_justify_button, "justify")):
            button.setIcon(self.bar_icon(kind))
        self.alignment_group = QButtonGroup(self)
        self.alignment_group.setExclusive(True)
        for b in (self.align_left_button, self.align_center_button, self.align_right_button, self.align_justify_button):
            self.alignment_group.addButton(b)

        self.bullet_button = self.tool_button("•", "Bulleted list", lambda: self.insert_list(QTextListFormat.Style.ListDisc))
        self.number_button = self.tool_button("1.", "Numbered list", lambda: self.insert_list(QTextListFormat.Style.ListDecimal))
        self.outdent_button = self.tool_button("⇤", "Decrease indent", lambda: self.change_indent(-1))
        self.indent_button = self.tool_button("⇥", "Increase indent", lambda: self.change_indent(1))

        self.line_spacing_menu = QComboBox()
        self.line_spacing_menu.addItems(["1.0", "1.15", "1.5", "2.0"])
        self.line_spacing_menu.setToolTip("Line spacing")
        self.line_spacing_menu.setFixedWidth(56)
        self.line_spacing_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.line_spacing_menu.activated.connect(self.set_line_spacing)
        layout.addWidget(self.ribbon_group("Paragraph", [self.align_left_button, self.align_center_button,
                                                         self.align_right_button, self.align_justify_button,
                                                         self.bullet_button, self.number_button,
                                                         self.outdent_button, self.indent_button, self.line_spacing_menu]))
        layout.addWidget(self.vline())

        #editing
        find_button = self.tool_button("Find", "Find and replace (Ctrl+F)", self.find_replace, width=46, bold=False)
        clear_button = self.tool_button("Clear", "Clear formatting", self.clear_formatting, width=46, bold=False)
        layout.addWidget(self.ribbon_group("Editing", [find_button, clear_button]))
        layout.addStretch()
        return page

    def insert_tab(self):
        page = QWidget()
        layout = QHBoxLayout(page)
        layout.setContentsMargins(4, 2, 4, 2)
        layout.setSpacing(2)
        layout.setAlignment(Qt.AlignmentFlag.AlignLeft)
        image_button = self.tool_button("Image", "Insert image", self.insert_image, width=56, bold=False)
        table_button = self.tool_button("Table", "Insert table", self.insert_table, width=56, bold=False)
        layout.addWidget(self.ribbon_group("Insert", [image_button, table_button]))
        layout.addStretch()
        return page

    def layout_tab(self):
        page = QWidget()
        layout = QHBoxLayout(page)
        layout.setContentsMargins(4, 2, 4, 2)
        layout.setSpacing(2)
        layout.setAlignment(Qt.AlignmentFlag.AlignLeft)
        self.page_size_menu = QComboBox()
        self.page_size_menu.addItems(["A4", "Letter", "A5", "Legal"])
        self.page_size_menu.setFixedWidth(80)
        self.page_size_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.page_size_menu.activated.connect(self.change_page_size)
        margins_button = self.tool_button("Margins", "Page margins and spacing", self.page_setup, width=64, bold=False)
        layout.addWidget(self.ribbon_group("Page Setup", [self.page_size_menu, margins_button]))
        layout.addStretch()
        return page


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
        
        find = QAction(self)
        find.setShortcut(QKeySequence("Ctrl+F"))
        find.triggered.connect(self.find_replace)
        self.addAction(find)

    def change_font_size(self):
        self.font_size = int(self.font_size_menu.currentText())
        font = self.editor.currentFont()
        font.setPointSize(self.font_size)
        self.editor.setCurrentFont(font)

        self.view.viewport().setFocus()




    def sync_font(self):
        if not self.editor.textCursor().hasSelection():
            current_font = self.editor.currentFont()
            font_size = current_font.pointSize()
            if font_size > 0:
                self.font_size_menu.setCurrentText(str(font_size))

            self.font_family_menu.blockSignals(True)
            self.font_family_menu.setCurrentFont(current_font)
            self.font_family_menu.blockSignals(False)

            self.color_button.setStyleSheet(f"font-weight: bold; color: white; background-color: {self.editor.textColor().name()}")

            self.bold_button.setChecked(current_font.bold())
            self.italic_button.setChecked(current_font.italic())
            self.strikethrough_button.setChecked(current_font.strikeOut())
            self.underline_button.setChecked(current_font.underline())

            cursor = self.editor.textCursor()
            block_format = cursor.blockFormat()
            alignment_status = block_format.alignment()

            if alignment_status == (Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignLeft):
                self.align_left_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignHCenter):
                self.align_center_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignRight):
                self.align_right_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignJustify | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignJustify):
                self.align_justify_button.setChecked(True)
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
                case Qt.AlignmentFlag.AlignJustify:
                    self.align_justify_button.setChecked(True)
        cursor = self.editor.textCursor()
        block_format = cursor.blockFormat()
        self.editor.text_alignment = alignment | Qt.AlignmentFlag.AlignAbsolute
        block_format.setAlignment(self.editor.text_alignment)
        block_format.setProperty(0x010000, True)
        cursor.mergeBlockFormat(block_format)
        self.view.viewport().setFocus()

    def toggle_italic(self):
        font = self.editor.currentFont()
        font.setItalic(not font.italic())
        self.italic_button.setChecked(font.italic())
        self.editor.setCurrentFont(font)
        self.view.viewport().setFocus()

    def change_font_family(self, font):
        new_font = self.editor.currentFont()
        new_font.setFamily(font.family())
        self.editor.setCurrentFont(new_font)
        self.view.viewport().setFocus()

    def text_highlight(self):
        color = QColorDialog.getColor(QColor("#ffff00"), self, "Highlight color")
        if color.isValid():
            fmt = QTextCharFormat()
            fmt.setBackground(color)
            self.editor.textCursor().mergeCharFormat(fmt)
            self.editor.mergeCurrentCharFormat(fmt)
            self.highlight_button.setStyleSheet(f"font-weight: bold; background-color: {color.name()};")
        self.view.viewport().setFocus()

    def insert_list(self, style):
        cursor = self.editor.textCursor()
        if cursor.currentList():
            #already a list, drop it back to a normal block
            block_format = cursor.blockFormat()
            block_format.setObjectIndex(-1)
            cursor.mergeBlockFormat(block_format)
        else:
            list_format = QTextListFormat()
            list_format.setStyle(style)
            cursor.createList(list_format)
        self.view.viewport().setFocus()

    def change_indent(self, delta):
        cursor = self.editor.textCursor()
        block_format = cursor.blockFormat()
        block_format.setIndent(max(0, block_format.indent() + delta))
        cursor.mergeBlockFormat(block_format)
        self.view.viewport().setFocus()

    def set_line_spacing(self):
        value = float(self.line_spacing_menu.currentText())
        cursor = self.editor.textCursor()
        block_format = cursor.blockFormat()
        block_format.setLineHeight(value * 100, QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
        cursor.mergeBlockFormat(block_format)
        self.view.viewport().setFocus()

    def clear_formatting(self):
        cursor = self.editor.textCursor()
        if not cursor.hasSelection():
            cursor.select(QTextCursor.SelectionType.BlockUnderCursor)
        plain = QTextCharFormat()
        plain.setFontPointSize(16)
        cursor.setCharFormat(plain)
        block_format = cursor.blockFormat()
        block_format.setIndent(0)
        block_format.setObjectIndex(-1)
        cursor.setBlockFormat(block_format)
        self.editor.setCurrentCharFormat(plain)
        self.sync_font()
        self.view.viewport().setFocus()

    def find_replace(self):
        if getattr(self, "find_dialog", None) is None:
            self.find_dialog = FindReplaceDialog(self.editor, self)
        self.find_dialog.show()
        self.find_dialog.raise_()
        self.find_dialog.activateWindow()

    def print_document(self):
        printer = QPrinter(QPrinter.PrinterMode.HighResolution)
        printer.setPageSize(QPageSize(QPageSize.PageSizeId.A4))
        dialog = QPrintDialog(printer, self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.editor.document().print_(printer)
        self.view.viewport().setFocus()

    def insert_image(self):
        path, _ = QFileDialog.getOpenFileName(self, "Insert image", "", "Images (*.png *.jpg *.jpeg *.bmp *.gif)")
        if not path:
            return
        extension = Path(path).suffix.lower().lstrip(".")
        if extension == "jpg":
            extension = "jpeg"
        with open(path, "rb") as image_file:
            encoded = base64.b64encode(image_file.read()).decode("ascii")
        #keep the picture inside the page width so it doesnt overflow the sheet
        usable_width = self.editor.base_width - 120
        width = QImage(path).width()
        if width > usable_width:
            width = usable_width
        cursor = self.editor.textCursor()
        cursor.insertHtml(f'<img src="data:image/{extension};base64,{encoded}" width="{width}">')
        self.view.viewport().setFocus()

    def insert_table(self):
        rows, ok = QInputDialog.getInt(self, "Insert table", "Rows:", 2, 1, 100)
        if not ok:
            return
        columns, ok = QInputDialog.getInt(self, "Insert table", "Columns:", 2, 1, 20)
        if not ok:
            return
        table_format = QTextTableFormat()
        table_format.setCellPadding(4)
        table_format.setCellSpacing(0)
        table_format.setBorder(1)
        table_format.setBorderStyle(QTextTableFormat.BorderStyle.BorderStyle_Solid)
        table_format.setWidth(QTextLength(QTextLength.Type.PercentageLength, 100))
        self.editor.textCursor().insertTable(rows, columns, table_format)
        self.view.viewport().setFocus()

    def change_page_size(self):
        sizes = {"A4": (794, 1123), "Letter": (816, 1056), "A5": (559, 794), "Legal": (816, 1344)}
        width, height = sizes[self.page_size_menu.currentText()]
        self.editor.base_width, self.editor.base_height = width, height
        self.editor.setMinimumSize(width, height)
        self.editor.document().setPageSize(QSize(width, height))
        self.editor.page_count = self.editor.document().pageCount()
        self.editor.setFixedSize(width, self.editor.page_count * height)
        self.scene.setSceneRect(QRectF(self.editor.rect()))
        self.editor.viewport().update()
        self.view.viewport().setFocus()

    def page_setup(self):
        dialog = QDialog(self)
        dialog.setWindowTitle("Page setup")
        form = QFormLayout(dialog)
        margin_spin = QDoubleSpinBox()
        margin_spin.setRange(0, 60)
        margin_spin.setSuffix(" mm")
        margin_spin.setValue(round(self.editor.document().documentMargin() / (96 / 25.4), 1))
        form.addRow("Margins:", margin_spin)
        spacing_spin = QDoubleSpinBox()
        spacing_spin.setRange(0.5, 3.0)
        spacing_spin.setSingleStep(0.05)
        spacing_spin.setValue(1.0)
        form.addRow("Line spacing:", spacing_spin)
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(dialog.accept)
        buttons.rejected.connect(dialog.reject)
        form.addRow(buttons)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.editor.document().setDocumentMargin(margin_spin.value() * (96 / 25.4))
            cursor = self.editor.textCursor()
            cursor.select(QTextCursor.SelectionType.Document)
            block_format = QTextBlockFormat()
            block_format.setLineHeight(spacing_spin.value() * 100, QTextBlockFormat.LineHeightTypes.ProportionalHeight.value)
            cursor.mergeBlockFormat(block_format)
            self.editor.check_page_limit()
        self.view.viewport().setFocus()


class FindReplaceDialog(QDialog):
    def __init__(self, editor, parent=None):
        super().__init__(parent)
        self.editor = editor
        self.setWindowTitle("Find and replace")
        self.setFixedWidth(340)

        self.find_field = QLineEdit()
        self.replace_field = QLineEdit()
        self.match_case = QCheckBox("Match case")

        form = QFormLayout()
        form.addRow("Find:", self.find_field)
        form.addRow("Replace:", self.replace_field)

        find_next = QPushButton("Find next")
        replace = QPushButton("Replace")
        replace_all = QPushButton("Replace all")
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
        self.cursorPositionChanged.connect(self.check_current_page)
        self.was_zooming = False

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
        self.main_window.color_button.setStyleSheet(f"font-weight: bold; color: white; background-color: {color.name()}")
        self.main_window.bold_button.setChecked(font.bold())
        self.main_window.italic_button.setChecked(font.italic())
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

        total_pages = self.document().pageCount()
        gap_height = 12  #the canvas-colored strip that separates one sheet from the next

        for page_index in range(total_pages):
            page_top = page_index * self.base_height

            sheet_rect = QRect(0, page_top, self.width(), self.base_height - gap_height)

            painter.fillRect(sheet_rect, QColor("white")) #draw page

            if page_index < total_pages - 1:
                gap_rect = QRect(0, page_top + (self.base_height - gap_height), self.width(), gap_height)
                painter.fillRect(gap_rect, QColor(CANVAS)) #draw gap

        painter.end()
        
        #draw text
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
            find.triggered.connect(self.main_window.find_replace)
            
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
    
