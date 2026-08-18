#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QSizePolicy, QWidget, QToolBar, QLabel, QPushButton, QHBoxLayout, QComboBox, QButtonGroup, QFontComboBox, QColorDialog
from PySide6.QtGui import QFont, QTextCharFormat, QIntValidator, QIcon, QColor, QTextListFormat, QTextCursor
from PySide6.QtCore import Qt, QSize
class Toolbar(QToolBar):
    def __init__(self, main_window, parent=None):
        super().__init__(parent)
        self.main_window = main_window
        self.layout().setSpacing(5)
        self.setContentsMargins(3, 3, 3, 3)
        self.setMovable(False)

        self.font_color = QColor("blue")
        self.color_button = QPushButton()
        self.main_window.size_unit = self.color_button.sizeHint().height()
        color_icon = QIcon.fromTheme("format-text-color-symbolic")
        self.color_button.setIcon(color_icon)
        self.color_button.setToolTip("Font Color")
        self.color_button.setFixedSize(self.main_window.size_unit * 1.5, self.main_window.size_unit)
        self.color_button.setStyleSheet(f"QPushButton {{background-color: {self.main_window.editor.DEFAULT_FONT_COLOR};}}")
        self.color_button.clicked.connect(self.change_font_color)

        self.font_family_menu = QFontComboBox()
        self.font_family_menu.setToolTip("Font Family")
        self.font_family_menu.setFontFilters(QFontComboBox.FontFilter.ScalableFonts)
        self.font_family_menu.setFixedWidth(self.main_window.size_unit*6)
        self.font_family_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_family_menu.currentFontChanged.connect(lambda font: self.font_family(font))
        self.font_family_menu.activated.connect(lambda: self.main_window.view.viewport().setFocus())
        self.font_family_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        self.addWidget(self.font_family_menu)

        self.font_size_menu = QComboBox()
        self.font_size_menu.setToolTip("Font Size")
        self.font_size_menu.addItems(["6","7","8","9","10","11","12","13","14","15","16","18","20","21","22","24","26","28","32","36","40","42","44","48","54","60","66","72","80","88","96"])
        self.font_size_menu.setCurrentText(str(self.main_window.editor.DEFAULT_FONT_SIZE))
        self.font_size = int(self.font_size_menu.currentText())
        self.font_size_menu.setEditable(True)
        self.font_size_menu.setInsertPolicy(QComboBox.InsertPolicy.NoInsert)
        self.font_size_menu.lineEdit().setValidator(QIntValidator(6, 500, self))
        self.font_size_menu.activated.connect(self.change_font_size)
        self.font_size_menu.lineEdit().returnPressed.connect(lambda: (self.change_font_size(), self.main_window.view.viewport().setFocus()))
        self.font_size_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_size_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        self.font_size_menu.setFixedWidth(self.main_window.size_unit*2.5)

        pt = QLabel("pt", self.font_size_menu)
        pt_layout = QHBoxLayout()
        self.font_size_menu.lineEdit().setLayout(pt_layout)
        pt_layout.setContentsMargins(self.main_window.size_unit, 0, 0, 0)
        pt_layout.addWidget(pt)

        self.addWidget(self.font_size_menu)
        self.addSeparator()

        self.addWidget(self.color_button)

        self.highlight_color = QColor("yellow")
        self.highlight_button = QPushButton()
        highlight_icon = QIcon.fromTheme("draw-highlight-symbolic")
        self.highlight_button.setIcon(highlight_icon)
        self.highlight_button.setToolTip("Highlight")
        self.highlight_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.highlight_button.clicked.connect(self.highlight_text)
        self.addWidget(self.highlight_button)
        self.addSeparator()

        self.bold_button = QPushButton()
        bold_icon = QIcon.fromTheme("format-text-bold-symbolic")
        self.bold_button.setIcon(bold_icon)
        self.bold_button.setShortcut("Ctrl+B")
        self.bold_button.setToolTip("Bold (Ctrl+B)")
        self.bold_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.bold_button.setCheckable(True)
        self.bold_button.clicked.connect(self.toggle_bold)
        self.addWidget(self.bold_button)

        self.strikethrough_button = QPushButton()
        strikethrough_icon = QIcon.fromTheme("format-text-strikethrough-symbolic")
        self.strikethrough_button.setIcon(strikethrough_icon)
        self.strikethrough_button.setToolTip("Strikethrough")
        self.strikethrough_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.strikethrough_button.setCheckable(True)
        self.strikethrough_button.clicked.connect(self.toggle_strikethrough)
        self.addWidget(self.strikethrough_button)

        self.underline_button = QPushButton()
        underline_icon = QIcon.fromTheme("format-text-underline-symbolic")
        self.underline_button.setIcon(underline_icon)
        self.underline_button.setShortcut("Ctrl+U")
        self.underline_button.setToolTip("Underline (Ctrl+U)")
        self.underline_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.underline_button.setCheckable(True)
        self.underline_button.clicked.connect(self.toggle_underline)
        self.addWidget(self.underline_button)

        self.italic_button = QPushButton()
        italic_icon = QIcon.fromTheme("format-text-italic-symbolic")
        self.italic_button.setIcon(italic_icon)
        self.italic_button.setShortcut("Ctrl+I")
        self.italic_button.setToolTip("Italic (Ctrl+I)")
        self.italic_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.italic_button.setCheckable(True)
        self.italic_button.clicked.connect(self.toggle_italic)
        self.addWidget(self.italic_button)
        self.addSeparator()
        
        self.clear_formatting_button = QPushButton()
        clear_formatting_icon = QIcon.fromTheme("edit-clear-symbolic")
        self.clear_formatting_button.setIcon(clear_formatting_icon)
        self.clear_formatting_button.setToolTip("Clear Formatting")
        self.clear_formatting_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.clear_formatting_button.clicked.connect(self.clear_formatting)
        self.addWidget(self.clear_formatting_button)
        self.addSeparator()

        self.numbered_list_button = QPushButton()
        self.numbered_list_button.setIcon(QIcon.fromTheme("format-list-ordered-symbolic"))
        self.numbered_list_button.setToolTip("Numbered List")
        self.numbered_list_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.numbered_list_button.setCheckable(True)
        self.numbered_list_button.clicked.connect(self.toggle_numbered_list)
        self.addWidget(self.numbered_list_button)

        self.bulleted_list_button = QPushButton()
        self.bulleted_list_button.setIcon(QIcon.fromTheme("format-list-unordered-symbolic"))
        self.bulleted_list_button.setToolTip("Bulleted List")
        self.bulleted_list_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.bulleted_list_button.setCheckable(True)
        self.bulleted_list_button.clicked.connect(self.toggle_bulleted_list)
        self.addWidget(self.bulleted_list_button)
        self.addSeparator()

        self.align_left_button = QPushButton()
        align_left_icon = QIcon.fromTheme("format-justify-left-symbolic")
        self.align_left_button.setIcon(align_left_icon)
        self.align_left_button.setShortcut("Ctrl+L")
        self.align_left_button.setToolTip("Align Left (Ctrl+L)")
        self.align_left_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.align_left_button.setCheckable(True)
        self.align_left_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignLeft))
        self.addWidget(self.align_left_button)

        self.align_center_button = QPushButton()
        align_center_icon = QIcon.fromTheme("format-justify-center-symbolic")
        self.align_center_button.setIcon(align_center_icon)
        self.align_center_button.setShortcut("Ctrl+E")
        self.align_center_button.setToolTip("Align Center (Ctrl+E)")
        self.align_center_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.align_center_button.setCheckable(True)
        self.align_center_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignHCenter))
        self.addWidget(self.align_center_button)

        self.align_right_button = QPushButton()
        align_right_icon = QIcon.fromTheme("format-justify-right-symbolic")
        self.align_right_button.setIcon(align_right_icon)
        self.align_right_button.setShortcut("Ctrl+R")
        self.align_right_button.setToolTip("Align Right (Ctrl+R)")
        self.align_right_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.align_right_button.setCheckable(True)
        self.align_right_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignRight))
        self.addWidget(self.align_right_button)

        self.justify_button = QPushButton()
        justify_icon = QIcon.fromTheme("format-justify-fill-symbolic")
        self.justify_button.setIcon(justify_icon)
        self.justify_button.setShortcut("Ctrl+J")
        self.justify_button.setToolTip("Justify (Ctrl+J)")
        self.justify_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.justify_button.setCheckable(True)
        self.justify_button.clicked.connect(lambda: self.align(Qt.AlignmentFlag.AlignJustify))
        self.addWidget(self.justify_button)

        self.alignment_group = QButtonGroup(self)
        self.alignment_group.setExclusive(True)
        self.alignment_group.addButton(self.align_left_button)
        self.alignment_group.addButton(self.align_center_button)
        self.alignment_group.addButton(self.align_right_button)
        self.alignment_group.addButton(self.justify_button)
        self.addSeparator()

        self.superscript_button = QPushButton()
        superscript_icon = QIcon.fromTheme("format-text-superscript-symbolic")
        self.superscript_button.setIcon(superscript_icon)
        self.superscript_button.setShortcut("Ctrl+B")
        self.superscript_button.setToolTip("superscript (Ctrl+B)")
        self.superscript_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.superscript_button.setCheckable(True)
        self.superscript_button.clicked.connect(self.toggle_superscript)
        self.addWidget(self.superscript_button)

        self.subscript_button = QPushButton()
        subscript_icon = QIcon.fromTheme("format-text-subscript-symbolic")
        self.subscript_button.setIcon(subscript_icon)
        self.subscript_button.setShortcut("Ctrl+B")
        self.subscript_button.setToolTip("subscript (Ctrl+B)")
        self.subscript_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit)
        self.subscript_button.setCheckable(True)
        self.subscript_button.clicked.connect(self.toggle_subscript)
        self.addWidget(self.subscript_button)

        spacer = QWidget()
        spacer.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)
        self.addWidget(spacer)
        
        self.toggle_minimap_button = QPushButton()
        self.minimap_right_close_icon = QIcon.fromTheme("sidebar-collapse-right-symbolic")
        self.minimap_right_open_icon = QIcon.fromTheme("sidebar-expand-right-symbolic")
        self.minimap_left_close_icon = QIcon.fromTheme("sidebar-collapse-left-symbolic")
        self.minimap_left_open_icon = QIcon.fromTheme("sidebar-expand-left-symbolic")
        self.toggle_minimap_button.setIcon(self.minimap_right_close_icon)
        self.toggle_minimap_button.setToolTip("Close Minimap (F7)")
        self.toggle_minimap_button.setIconSize(QSize(self.main_window.size_unit/1.25, self.main_window.size_unit/1.25))
        self.toggle_minimap_button.setFixedSize(self.main_window.size_unit*1.5, self.main_window.size_unit*1)
        self.toggle_minimap_button.clicked.connect(self.toggle_minimap)
        self.addWidget(self.toggle_minimap_button)

        self.main_window.addToolBar(self)

    def toggle_list(self, style):
        editor = self.main_window.editor
        cursor = editor.textCursor()
        cursor.beginEditBlock()

        if cursor.hasSelection():
            doc = editor.document()

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
        self.sync_font()
        self.main_window.view.viewport().setFocus()

    def toggle_numbered_list(self):
        self.toggle_list(QTextListFormat.Style.ListDecimal)

    def toggle_bulleted_list(self):
        self.toggle_list(QTextListFormat.Style.ListDisc)
        
    def toggle_minimap(self):
        minimap = self.main_window.minimap
        minimap.setVisible(not minimap.isVisible())
        if minimap.isVisible():
            self.toggle_minimap_button.setToolTip("Close Minimap (F7)")
        else:
            self.toggle_minimap_button.setToolTip("Open Minimap (F7)")
        self.update_minimap_icon()

    def update_minimap_icon(self):
        minimap = self.main_window.minimap
        if minimap.isVisible():
            if minimap.side == "right":
                self.toggle_minimap_button.setIcon(self.minimap_right_close_icon)
            else:
                self.toggle_minimap_button.setIcon(self.minimap_left_close_icon)
        else:
            if minimap.side == "right":
                self.toggle_minimap_button.setIcon(self.minimap_right_open_icon)
            else:
                self.toggle_minimap_button.setIcon(self.minimap_left_open_icon)
    
    def sync_font(self):
        if not self.main_window.editor.textCursor().hasSelection():
            font = self.main_window.editor.currentFont()
            font_size = font.pointSize()
            self.font_size_menu.setCurrentText(str(font_size))
            
            self.font_family_menu.setCurrentFont(font)

            self.color_button.setStyleSheet(f"QPushButton {{ background-color: {self.main_window.editor.textColor().name()}; }}")

            bold_status = font.bold()
            self.bold_button.setChecked(bold_status)

            strikethrough_status = font.strikeOut()
            self.strikethrough_button.setChecked(strikethrough_status)

            underline_status = font.underline()
            self.underline_button.setChecked(underline_status)

            italic_status = font.italic()
            self.italic_button.setChecked(italic_status)

            current_list = self.main_window.editor.textCursor().currentList()
            if current_list:
                style = current_list.format().style()
                self.numbered_list_button.setChecked(style == QTextListFormat.Style.ListDecimal)
                self.bulleted_list_button.setChecked(style == QTextListFormat.Style.ListDisc)
            else:
                self.numbered_list_button.setChecked(False)
                self.bulleted_list_button.setChecked(False)

            char_format = self.main_window.editor.textCursor().charFormat()
            bg_color = char_format.background()
            if bg_color.style() != Qt.BrushStyle.NoBrush:
                self.highlight_button.setStyleSheet(f"QPushButton {{ background-color: {bg_color.color().name()}; }}")
            else:
                self.highlight_button.setStyleSheet("")

            cursor = self.main_window.editor.textCursor()
            block_format = cursor.blockFormat()
            alignment_status = block_format.alignment()

            if alignment_status == (Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignLeft):
                self.align_left_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignHCenter):
                self.align_center_button.setChecked(True)
            elif alignment_status == (Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignAbsolute) or alignment_status == (Qt.AlignmentFlag.AlignRight):
                self.align_right_button.setChecked(True)

            if char_format.verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSuperScript:
                self.superscript_button.setChecked(True)
                self.subscript_button.setChecked(False)
            elif char_format.verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSubScript:
                self.superscript_button.setChecked(False)
                self.subscript_button.setChecked(True)
            else:
                self.superscript_button.setChecked(False)
                self.subscript_button.setChecked(False)
            
    def font_family(self, font):
        self.main_window.editor.setFontFamily(font.family())

    def change_font_size(self):
        self.font_size = int(self.font_size_menu.currentText())
        font = self.main_window.editor.currentFont()
        font.setPointSize(self.font_size)
        self.main_window.editor.setFontPointSize(font.pointSize())
        self.main_window.view.viewport().setFocus()

    def change_font_color(self):
        dialog = QColorDialog(self.font_color)
        if dialog.exec() == QColorDialog.Accepted:
            self.font_color = dialog.selectedColor()
            self.main_window.editor.setTextColor(self.font_color)
            self.color_button.setStyleSheet(f"QPushButton {{ background-color: {self.font_color.name()}; }}")
        self.main_window.view.viewport().setFocus()

    def highlight_text(self):
        dialog = QColorDialog(self.highlight_color)
        if dialog.exec() == QColorDialog.Accepted:
            self.highlight_color = dialog.selectedColor()
            char_format = self.main_window.editor.currentCharFormat()
            char_format.setBackground(self.highlight_color)
            self.main_window.editor.setTextBackgroundColor(self.highlight_color)
            self.highlight_button.setStyleSheet(f"QPushButton {{background-color: {self.highlight_color.name()}; }}")
        self.main_window.view.viewport().setFocus()

    def toggle_bold(self):
        editor = self.main_window.editor
        cursor = editor.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(editor.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_bold = check_cursor.charFormat().fontWeight() == QFont.Weight.Bold
            char_format = QTextCharFormat()
            char_format.setFontWeight(QFont.Weight.Normal if is_bold else QFont.Weight.Bold)
            cursor.mergeCharFormat(char_format)
            editor.setTextCursor(cursor)
        else:
            char_format = editor.currentCharFormat()
            is_bold = char_format.fontWeight() == QFont.Weight.Bold
            char_format.setFontWeight(QFont.Weight.Normal if is_bold else QFont.Weight.Bold)
            editor.mergeCurrentCharFormat(char_format)
        self.bold_button.setChecked(not is_bold)
        self.main_window.view.viewport().setFocus()

    def toggle_strikethrough(self):
        editor = self.main_window.editor
        cursor = editor.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(editor.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_strikethrough = check_cursor.charFormat().fontStrikeOut()
            char_format = QTextCharFormat()
            char_format.setFontStrikeOut(not is_strikethrough)
            cursor.mergeCharFormat(char_format)
            editor.setTextCursor(cursor)
        else:
            char_format = editor.currentCharFormat()
            is_strikethrough = char_format.fontStrikeOut()
            char_format.setFontStrikeOut(not is_strikethrough)
            editor.mergeCurrentCharFormat(char_format)
        self.strikethrough_button.setChecked(not is_strikethrough)
        self.main_window.view.viewport().setFocus()

    def toggle_underline(self):
        editor = self.main_window.editor
        cursor = editor.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(editor.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_underline = check_cursor.charFormat().fontUnderline()
            char_format = QTextCharFormat()
            char_format.setFontUnderline(not is_underline)
            cursor.mergeCharFormat(char_format)
            editor.setTextCursor(cursor)
        else:
            char_format = editor.currentCharFormat()
            is_underline = char_format.fontUnderline()
            char_format.setFontUnderline(not is_underline)
            editor.mergeCurrentCharFormat(char_format)
        self.underline_button.setChecked(not is_underline)
        self.main_window.view.viewport().setFocus()

    def toggle_italic(self):
        editor = self.main_window.editor
        cursor = editor.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(editor.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_italic = check_cursor.charFormat().fontItalic()
            char_format = QTextCharFormat()
            char_format.setFontItalic(not is_italic)
            cursor.mergeCharFormat(char_format)
            editor.setTextCursor(cursor)
        else:
            char_format = editor.currentCharFormat()
            is_italic = char_format.fontItalic()
            char_format.setFontItalic(not is_italic)
            editor.mergeCurrentCharFormat(char_format)
        self.italic_button.setChecked(not is_italic)
        self.main_window.view.viewport().setFocus()

    def toggle_superscript(self):
        editor = self.main_window.editor
        cursor = editor.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(editor.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_superscript = check_cursor.charFormat().verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSuperScript
            char_format = QTextCharFormat()
            char_format.setVerticalAlignment(QTextCharFormat.VerticalAlignment.AlignNormal if is_superscript else QTextCharFormat.VerticalAlignment.AlignSuperScript)
            cursor.mergeCharFormat(char_format)
            editor.setTextCursor(cursor)
            
        else:
            char_format = editor.currentCharFormat()
            is_superscript = char_format.verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSuperScript
            char_format.setVerticalAlignment(QTextCharFormat.VerticalAlignment.AlignNormal if is_superscript else QTextCharFormat.VerticalAlignment.AlignSuperScript)
            editor.mergeCurrentCharFormat(char_format)
        self.superscript_button.setChecked(not is_superscript)
        self.subscript_button.setChecked(False)
        self.main_window.view.viewport().setFocus()

    def toggle_subscript(self):
        editor = self.main_window.editor
        cursor = editor.textCursor()
        if cursor.hasSelection():
            check_cursor = QTextCursor(editor.document())
            check_cursor.setPosition(cursor.selectionStart())
            check_cursor.movePosition(QTextCursor.MoveOperation.NextCharacter, QTextCursor.MoveMode.KeepAnchor)
            is_subscript = check_cursor.charFormat().verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSubScript
            char_format = QTextCharFormat()
            char_format.setVerticalAlignment(QTextCharFormat.VerticalAlignment.AlignNormal if is_subscript else QTextCharFormat.VerticalAlignment.AlignSubScript)
            cursor.mergeCharFormat(char_format)
            editor.setTextCursor(cursor)
            
        else:
            char_format = editor.currentCharFormat()
            is_subscript = char_format.verticalAlignment() == QTextCharFormat.VerticalAlignment.AlignSubScript
            char_format.setVerticalAlignment(QTextCharFormat.VerticalAlignment.AlignNormal if is_subscript else QTextCharFormat.VerticalAlignment.AlignSubScript)
            editor.mergeCurrentCharFormat(char_format)
        self.subscript_button.setChecked(not is_subscript)
        self.superscript_button.setChecked(False)
        self.main_window.view.viewport().setFocus()
        
    def clear_formatting(self):
        self.main_window.editor.blockSignals(True)
        cursor = self.main_window.editor.textCursor()
        plain = self.main_window.editor.DEFAULT_CHAR_FORMAT
        cursor.setCharFormat(plain)
        self.main_window.editor.setFont(self.main_window.editor.DEFAULT_FONT)
        block_format = cursor.blockFormat()
        block_format.clearBackground()
        block_format.setIndent(0)
        block_format.setObjectIndex(-1)
        cursor.setBlockFormat(block_format)
        self.main_window.editor.setCurrentCharFormat(plain)
        font_size = self.main_window.editor.currentFont().pointSize()
        self.font_size_menu.setCurrentText(str(font_size))
        self.color_button.setStyleSheet(f"QPushButton {{ background-color: {self.main_window.editor.textColor().name()}; }}")
        self.main_window.view.viewport().setFocus()
        self.sync_font()
        self.main_window.editor.blockSignals(False)

    def align(self, alignment):
        match alignment:
                case Qt.AlignmentFlag.AlignLeft:
                    self.align_left_button.setChecked(True)
                case Qt.AlignmentFlag.AlignHCenter:
                    self.align_center_button.setChecked(True)
                case Qt.AlignmentFlag.AlignRight:
                    self.align_right_button.setChecked(True)
                case Qt.AlignmentFlag.AlignJustify:
                    self.justify_button.setChecked(True)
        cursor = self.main_window.editor.textCursor()
        block_format = cursor.blockFormat()
        if alignment != Qt.AlignmentFlag.AlignHCenter and alignment != Qt.AlignmentFlag.AlignJustify:
            self.main_window.editor.text_alignment = alignment | Qt.AlignmentFlag.AlignAbsolute
        else:
            self.main_window.editor.text_alignment = alignment
        block_format.setAlignment(self.main_window.editor.text_alignment)
        cursor.mergeBlockFormat(block_format)
        self.main_window.view.viewport().setFocus()
