#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QToolBar, QLabel, QPushButton, QHBoxLayout, QComboBox, QButtonGroup, QFontComboBox, QColorDialog
from PySide6.QtGui import QIntValidator, QIcon, QColor, QTextCharFormat
from PySide6.QtCore import Qt

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

def font_family(self, font):
    new_font = self.editor.currentFont()
    new_font.setFamily(font.family())
    self.editor.setCurrentFont(new_font)

def change_font_size(self):
    self.font_size = int(self.font_size_menu.currentText())
    font = self.editor.currentFont()
    font.setPointSize(self.font_size)
    self.editor.setCurrentFont(font)

    self.view.viewport().setFocus()

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

def clear_formatting(self):
    cursor = self.editor.textCursor()
    plain = QTextCharFormat()
    cursor.setCharFormat(plain)
    block_format = cursor.blockFormat()
    block_format.clearBackground()
    block_format.setIndent(0)
    block_format.setObjectIndex(-1)
    cursor.setBlockFormat(block_format)
    self.editor.setCurrentCharFormat(plain)
    sync_font(self)
    font_size = self.editor.currentFont().pointSize()
    self.font_size_menu.setCurrentText(str(font_size))
    self.color_button.setStyleSheet(f"QPushButton {{ background-color: {self.editor.textColor().name()}; }}")
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
    self.font_family_menu.currentFontChanged.connect(lambda font: (font_family(self, font), self.view.viewport().setFocus()))
    self.font_family_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
    self.toolbar.addWidget(self.font_family_menu)
    self.toolbar.addSeparator()

    self.font_size_menu = QComboBox()
    self.font_size_menu.setToolTip("Font Size")
    self.font_size_menu.addItems(["6","7","8","9","10","11","12","13","14","15","16","18","20","21","22","24","26","28","32","36","40","42","44","48","54","60","66","72","80","88","96"])
    self.font_size_menu.setCurrentText(str(self.editor.DEFAULT_FONT_SIZE))
    self.font_size = int(self.font_size_menu.currentText())
    self.font_size_menu.setEditable(True)
    self.font_size_menu.setInsertPolicy(QComboBox.InsertPolicy.NoInsert)
    self.font_size_menu.lineEdit().setValidator(QIntValidator(6, 500, self))
    self.font_size_menu.activated.connect(lambda: change_font_size(self))
    self.font_size_menu.lineEdit().returnPressed.connect(lambda: (change_font_size(self), self.view.viewport().setFocus()))
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
    self.color_button.clicked.connect(lambda: font_color(self))
    self.toolbar.addWidget(self.color_button)
    self.toolbar.addSeparator()

    self.highlight_color = QColor("yellow")
    self.highlight_button = QPushButton()
    hightlight_icon = QIcon.fromTheme("draw-highlight-symbolic")
    self.highlight_button.setIcon(hightlight_icon)
    self.highlight_button.setToolTip("Hightlight")
    self.highlight_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.highlight_button.clicked.connect(lambda: highlight_text(self))
    self.toolbar.addWidget(self.highlight_button)
    self.toolbar.addSeparator()

    self.bold_button = QPushButton()
    bold_icon = QIcon.fromTheme("format-text-bold-symbolic")
    self.bold_button.setIcon(bold_icon)
    self.bold_button.setToolTip("Bold")
    self.bold_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.bold_button.setCheckable(True)
    self.bold_button.clicked.connect(lambda: toggle_bold(self))
    self.toolbar.addWidget(self.bold_button)

    self.strikethrough_button = QPushButton()
    strikethrough_icon = QIcon.fromTheme("format-text-strikethrough-symbolic")
    self.strikethrough_button.setIcon(strikethrough_icon)
    self.strikethrough_button.setToolTip("Strikethrough")
    self.strikethrough_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.strikethrough_button.setCheckable(True)
    self.strikethrough_button.clicked.connect(lambda: toggle_strikethrough(self))
    self.toolbar.addWidget(self.strikethrough_button)

    self.underline_button = QPushButton()
    underline_icon = QIcon.fromTheme("format-text-underline-symbolic")
    self.underline_button.setIcon(underline_icon)
    self.underline_button.setToolTip("Underline")
    self.underline_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.underline_button.setCheckable(True)
    self.underline_button.clicked.connect(lambda: toggle_underline(self))
    self.toolbar.addWidget(self.underline_button)

    self.italic_button = QPushButton()
    italic_icon = QIcon.fromTheme("format-text-italic-symbolic")
    self.italic_button.setIcon(italic_icon)
    self.italic_button.setToolTip("Italic")
    self.italic_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.italic_button.setCheckable(True)
    self.italic_button.clicked.connect(lambda: toggle_italic(self))
    self.toolbar.addWidget(self.italic_button)

    self.clear_formatting_button = QPushButton()
    clear_formatting_icon = QIcon.fromTheme("edit-clear-symbolic")
    self.clear_formatting_button.setIcon(clear_formatting_icon)
    self.clear_formatting_button.setToolTip("Clear Formatting")
    self.clear_formatting_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.clear_formatting_button.clicked.connect(lambda: clear_formatting(self))
    self.toolbar.addWidget(self.clear_formatting_button)
    self.toolbar.addSeparator()

    self.align_left_button = QPushButton()
    align_left_icon = QIcon.fromTheme("format-justify-left-symbolic")
    self.align_left_button.setIcon(align_left_icon)
    self.align_left_button.setShortcut("Ctrl+L")
    self.align_left_button.setToolTip("Align Left")
    self.align_left_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.align_left_button.setCheckable(True)
    self.align_left_button.clicked.connect(lambda: align(self, Qt.AlignmentFlag.AlignLeft))
    self.toolbar.addWidget(self.align_left_button)

    self.align_center_button = QPushButton()
    align_center_icon = QIcon.fromTheme("format-justify-center-symbolic")
    self.align_center_button.setIcon(align_center_icon)
    self.align_center_button.setShortcut("Ctrl+E")
    self.align_center_button.setToolTip("Align Center")
    self.align_center_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.align_center_button.setCheckable(True)
    self.align_center_button.clicked.connect(lambda: align(self, Qt.AlignmentFlag.AlignHCenter))
    self.toolbar.addWidget(self.align_center_button)

    self.align_right_button = QPushButton()
    align_right_icon = QIcon.fromTheme("format-justify-right-symbolic")
    self.align_right_button.setIcon(align_right_icon)
    self.align_right_button.setShortcut("Ctrl+R")
    self.align_right_button.setToolTip("Align Right")
    self.align_right_button.setFixedSize(self.size_unit*1.5, self.size_unit)
    self.align_right_button.setCheckable(True)
    self.align_right_button.clicked.connect(lambda: align(self, Qt.AlignmentFlag.AlignRight))
    self.toolbar.addWidget(self.align_right_button)
    self.alignment_group = QButtonGroup(self)
    self.alignment_group.setExclusive(True)
    self.alignment_group.addButton(self.align_left_button)
    self.alignment_group.addButton(self.align_center_button)
    self.alignment_group.addButton(self.align_right_button)

    self.addToolBar(self.toolbar)