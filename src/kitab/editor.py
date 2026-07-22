#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QTextEdit, QMenu, QSizePolicy
from PySide6.QtGui import QIcon, QPainter, QCursor, QTextCursor, QTextBlockFormat, QTextOption
from PySide6.QtCore import Qt, QSize, QRectF
from menubar import _open_file
from dialogs import handle_link_click

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
        self.document().setDocumentMargin(20*(96/25.4))
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
    
    def dropEvent(self, event):
        if event.mimeData().hasUrls():
            path_list = event.mimeData().urls()
            if len(path_list) == 1:
                path = path_list[0].toLocalFile()
                if path.endswith(".txt") or path.endswith("ktb") or path.endswith("md"):
                    self.main_window.file_path = path
                    _open_file()
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
            self.textCursor().insertBlock()
        else:
            super().keyPressEvent(event)

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
        gap_height = 6
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
        if handle_link_click(self, event):
            event.accept()
            return
            
        if event.button() == Qt.MouseButton.RightButton:
            self.was_zooming = False
        super().mousePressEvent(event)
