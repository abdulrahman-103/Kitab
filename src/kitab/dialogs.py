#Copyright (C) 2026 Abdulrahman 103 and Kitab contributors
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QSizePolicy, QLabel, QPushButton, QSpinBox, QDoubleSpinBox, QHBoxLayout, QMessageBox, QDialog, QLineEdit, QCheckBox, QFormLayout, QVBoxLayout, QComboBox, QRadioButton, QButtonGroup, QGroupBox
from PySide6.QtGui import QTextCursor, QTextDocument, QTextTableFormat, QTextLength, QDesktopServices, QTextBlockFormat
from PySide6.QtCore import Qt, QUrl
from urllib.parse import urlparse
from vector2 import Vector2

class FindReplaceDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.main_window = main_window
        self.editor = editor
        self.setWindowTitle("Find and Replace")
        self.setMinimumSize(main_window.size_unit*12, main_window.size_unit*5)

        self.find_field = QLineEdit()
        self.replace_field = QLineEdit()
        self.match_case = QCheckBox("Match case")

        fields = QFormLayout()
        fields.addRow("Find:", self.find_field)
        fields.addRow("Replace:", self.replace_field)

        find_next = QPushButton("Find Next")
        find_previous = QPushButton("Find Previous")
        replace = QPushButton("Replace")
        replace_all = QPushButton("Replace All")

        find_next.setAutoDefault(False)
        find_previous.setAutoDefault(False)
        replace.setAutoDefault(False)
        replace_all.setAutoDefault(False)

        find_next.clicked.connect(self.find_next)
        find_previous.clicked.connect(self.find_previous)
        replace.clicked.connect(self.replace_one)
        replace_all.clicked.connect(self.replace_all)

        buttons = QHBoxLayout()
        buttons.addWidget(find_previous)
        buttons.addWidget(find_next)
        buttons.addWidget(replace)
        buttons.addWidget(replace_all)

        layout = QVBoxLayout(self)
        layout.addLayout(fields)
        layout.addWidget(self.match_case)
        layout.addLayout(buttons)

        self.find_field.returnPressed.connect(self.find_next)
        self.replace_field.returnPressed.connect(self.replace_one)

    def flags(self):
        flags = QTextDocument.FindFlag(0)
        if self.match_case.isChecked():
            flags |= QTextDocument.FindFlag.FindCaseSensitively
        return flags

    def follow_cursor(self):
        x = self.main_window.view.sceneRect().center().x()
        y = self.editor.cursorRect().center().y()
        self.main_window.view.centerOn(x, y)

    def find_next(self):
        text = self.find_field.text()
        if not text:
            return False
        found = self.editor.find(text, self.flags())
        self.follow_cursor()
        if not found:
            #wrap around to the top and try once more
            cursor = self.editor.textCursor()
            cursor.movePosition(QTextCursor.MoveOperation.Start)
            self.editor.setTextCursor(cursor)
            found = self.editor.find(text, self.flags())
            self.follow_cursor()
        return found

    def find_previous(self):
        text = self.find_field.text()
        if not text:
            return False
        flags = self.flags() | QTextDocument.FindFlag.FindBackward
        found = self.editor.find(text, flags)
        self.follow_cursor()
        if not found:
            # Wrap around to the bottom and try once more
            cursor = self.editor.textCursor()
            cursor.movePosition(QTextCursor.MoveOperation.End)
            self.editor.setTextCursor(cursor)
            found = self.editor.find(text, flags)
            self.follow_cursor()
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


class InsertTableDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.dialog = True
        self.setWindowTitle("Insert Table")
        self.setMinimumSize(main_window.size_unit * 6, main_window.size_unit * 5.5)

        layout = QVBoxLayout()

        columns_field = QSpinBox()
        rows_field = QSpinBox()
        self.width_field = QSpinBox()

        fields = QFormLayout()
        fields.addRow("Columns:", columns_field)
        fields.addRow("Rows:", rows_field)
        fields.addRow("Width:", self.width_field)

        fields_layout = QHBoxLayout()
        fields_layout.addStretch()
        fields_layout.addLayout(fields)
        fields_layout.addStretch()
        layout.addLayout(fields_layout)

        button_layout = QHBoxLayout()
        apply_button = QPushButton("Apply")
        cancel_button = QPushButton("Cancel")
        apply_button.setAutoDefault(False)
        cancel_button.setAutoDefault(False)
        button_layout.addWidget(apply_button)
        button_layout.addWidget(cancel_button)

        layout.addLayout(button_layout)
        self.setLayout(layout)
        
        apply_button.clicked.connect(lambda: self.insert_table(main_window, editor, columns_field.value(), rows_field.value(), self.width_field.value()))
        cancel_button.clicked.connect(self.reject)

    def insert_table(self, main_window, editor, columns, rows, width_percentage):
            table_format = QTextTableFormat()
            table_format.setCellPadding(4)
            table_format.setBorder(1)
            table_format.setBorderStyle(QTextTableFormat.BorderStyle.BorderStyle_Solid)
            table_format.setWidth(QTextLength(QTextLength.Type.PercentageLength, width_percentage))
            column_width = 100 / columns
            constraints = [QTextLength(QTextLength.Type.PercentageLength, column_width)] * columns
            table_format.setColumnWidthConstraints(constraints)
            cursor = editor.textCursor()
            block_format = cursor.blockFormat()
            char_format = cursor.charFormat()
            
            table = cursor.insertTable(rows, columns, table_format)
            for r in range(rows):
                for c in range(columns):
                    cell = table.cellAt(r, c)
                    cell_cursor = cell.firstCursorPosition()
                    cell_cursor.setBlockCharFormat(char_format)
                    cell_cursor.setBlockFormat(block_format)

            cursor.movePosition(QTextCursor.MoveOperation.End)
            cursor.insertBlock(block_format, char_format)
            main_window.view.viewport().setFocus()
            if self.dialog:
                self.dialog = False
                self.deleteLater()

class PageSetupDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.main_window = main_window
        self.editor = editor
        self.setWindowTitle("Page Setup")
        self.setMinimumSize(main_window.size_unit * 7, main_window.size_unit * 6)

        layout = QVBoxLayout()

        self.units_group = QButtonGroup(self)
        self.millimeter = QRadioButton("Millimeter")
        self.inch = QRadioButton("Inch")
        if self.editor.unit == "millimeter":
            self.millimeter.setChecked(True)
        else:
            self.inch.setChecked(True)
        self.units_group.addButton(self.millimeter)
        self.units_group.addButton(self.inch)
        
        units_layout = QHBoxLayout()
        units_layout.addStretch()
        units_layout.addWidget(QLabel("Unit:"))
        units_layout.addWidget(self.millimeter)
        units_layout.addWidget(self.inch)
        units_layout.addStretch()
        layout.addLayout(units_layout)

        page_size_layout = QVBoxLayout()
        page_size_group = QGroupBox("Page Size")
        page_size_group.setLayout(page_size_layout)

        page_size_combo = QComboBox()
        sizes = list(editor.PAGE_SIZES.keys())
        page_size_combo.addItems(sizes)
        page_size_combo.addItem("Custom")
        custom_index = page_size_combo.count() - 1
        current_size = Vector2(editor.base_width, editor.base_height).pixels_to_mm()
        for i, name in enumerate(sizes):
            if self.editor.unit == "inch":
                if round(editor.PAGE_SIZES[name].mm_to_inches(), 2) == round(current_size.mm_to_inches(), 2):
                    page_size_combo.setCurrentIndex(i)
                    break
            else:
                if editor.PAGE_SIZES[name] == current_size:
                    page_size_combo.setCurrentIndex(i)
                    break
        else:
            page_size_combo.setCurrentIndex(custom_index)

        page_size_layout.addWidget(page_size_combo)

        x = self.editor.page_size.x
        y = self.editor.page_size.y

        self.width_field = QDoubleSpinBox()
        self.width_field.setMaximum(100000)
        self.width_field.setValue(x)
        self.height_field = QDoubleSpinBox()
        self.height_field.setMaximum(100000)
        self.height_field.setValue(y)

        size_fields = QFormLayout()
        size_fields.addRow("Width:", self.width_field)
        size_fields.addRow("Height:", self.height_field)

        size_fields_layout = QHBoxLayout()
        size_fields_layout.addStretch()
        size_fields_layout.addLayout(size_fields)
        size_fields_layout.addStretch()

        page_size_layout.addLayout(size_fields_layout)
        layout.addWidget(page_size_group)


        spacing_layout = QVBoxLayout()
        spacing_group = QGroupBox("Spacing")
        spacing_group.setLayout(spacing_layout)

        self.editor.line_spacing = self.editor.textCursor().blockFormat().lineHeight()
        self.line_spacing_field = QSpinBox()
        self.line_spacing_field.setSuffix(" %")
        self.line_spacing_field.setMinimum(100)
        self.line_spacing_field.setMaximum(300)
        self.line_spacing_field.setValue(self.editor.line_spacing)
        #self.paragraph_spacing_field = QSpinBox()

        spacing_fields = QFormLayout()
        spacing_fields.addRow("Line Spacing:", self.line_spacing_field)
        #spacing_fields.addRow("Paragraph Spacing:", self.paragraph_spacing_field)

        spacing_fields_layout = QHBoxLayout()
        spacing_fields_layout.addStretch()
        spacing_fields_layout.addLayout(spacing_fields)
        spacing_fields_layout.addStretch()

        spacing_layout.addLayout(spacing_fields_layout)
        layout.addWidget(spacing_group)


    
        self.editor.margins = self.editor.textCursor().blockFormat().lineHeight()
        self.margin_field = QSpinBox()
        self.margin_field.setMinimum(0)
        self.margin_field.setMaximum(300)
        self.margin_field.setValue(self.editor.document().documentMargin() / (96 / 25.4))
        margin_fields = QFormLayout()
        margin_fields.addRow("Margin:", self.margin_field)
        margin_group = QGroupBox("Margins")
        margin_layout = QHBoxLayout()
        margin_layout.addStretch()
        margin_layout.addLayout(margin_fields)
        margin_layout.addStretch()
        margin_group.setLayout(margin_layout)
        margin_layout.addLayout(margin_layout)
        layout.addWidget(margin_group)


        button_layout = QHBoxLayout()
        apply_button = QPushButton("Apply")
        cancel_button = QPushButton("Cancel")
        apply_button.setAutoDefault(False)
        cancel_button.setAutoDefault(False)
        button_layout.addWidget(apply_button)
        button_layout.addWidget(cancel_button)

        layout.addLayout(button_layout)
        self.setLayout(layout)
        
        page_size_combo.currentTextChanged.connect(lambda: self.page_size_combo_sync(page_size_combo.currentText()))
        self.inch.toggled.connect(lambda: self.unit_change_sync())
        self.width_field.textChanged.connect(lambda: page_size_combo.setCurrentIndex(custom_index))
        self.height_field.textChanged.connect(lambda: page_size_combo.setCurrentIndex(custom_index))
        apply_button.clicked.connect(lambda: (editor.document().setModified(True), self.set_page_size(page_size_combo.currentText()), self.editor.set_line_spacing(self.line_spacing_field.value()), self.editor.document().setDocumentMargin(self.margin_field.value() * (96 / 25.4))))
        cancel_button.clicked.connect(self.reject)

        
    def unit_change_sync(self):
        if self.inch.isChecked():
            width = self.width_field.value()
            height = self.height_field.value()
            self.width_field.blockSignals(True)
            self.height_field.blockSignals(True)
            self.width_field.setValue(width / 25.4)
            self.height_field.setValue(height / 25.4)
            self.width_field.blockSignals(False)
            self.height_field.blockSignals(False)
        else:
            width = self.width_field.value()
            height = self.height_field.value()
            self.width_field.blockSignals(True)
            self.height_field.blockSignals(True)
            self.width_field.setValue(width * 25.4)
            self.height_field.setValue(height * 25.4)
            self.width_field.blockSignals(False)
            self.height_field.blockSignals(False)

    def page_size_combo_sync(self, preset):
        if preset != "Custom":
            if self.inch.isChecked():
                size = self.editor.PAGE_SIZES[preset].mm_to_inches()
            else:
                size = self.editor.PAGE_SIZES[preset]
            self.width_field.blockSignals(True)
            self.height_field.blockSignals(True)
            self.width_field.setValue(size.x)
            self.height_field.setValue(size.y)
            self.width_field.blockSignals(False)
            self.height_field.blockSignals(False)

    def set_page_size(self, preset):
        size = Vector2(float(self.width_field.value()), float(self.height_field.value()))
        if self.inch.isChecked():
            self.editor.unit = "inch"
        else:
            self.editor.unit = "millimeter"
        self.editor.set_page_size(size)
        self.accept()

class InsertLinkDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.dialog = True
        self.setWindowTitle("Insert Link")
        self.setMinimumSize(main_window.size_unit * 7, main_window.size_unit * 4.5)
        
        self.main_window = main_window

        layout = QVBoxLayout()

        text_field = QLineEdit()
        url_field = QLineEdit()
        fields = QFormLayout()
        fields.addRow("Text:", text_field)
        fields.addRow("URL:", url_field)
        layout.addLayout(fields)

        button_layout = QHBoxLayout()
        apply_button = QPushButton("Apply")
        cancel_button = QPushButton("Cancel")
        apply_button.setAutoDefault(False)
        cancel_button.setAutoDefault(False)
        button_layout.addWidget(apply_button)
        button_layout.addWidget(cancel_button)

        layout.addLayout(button_layout)
        self.setLayout(layout)

        apply_button.clicked.connect(lambda: self.insert_link(editor, text_field.text(), url_field.text()))
        cancel_button.clicked.connect(self.reject)

    @staticmethod
    def insert_https(url):
        url = url.strip()
        # Check if a protocol (like http, https, ftp) already exists
        parsed = urlparse(url)
        if parsed.scheme:
            return url
        return f"https://{url}"

    def insert_link(self, editor, text, url):
        if not url:
            return
        url = self.insert_https(url)
        display_text = text if text else url
        cursor = editor.textCursor()
        font_size = cursor.charFormat().font().pointSize()
        font_family = cursor.charFormat().font().families()
        old_pos = cursor.position()
        cursor.insertHtml(f'<a href="{url}">{display_text}</a>')
        cursor.setPosition(old_pos, QTextCursor.MoveMode.KeepAnchor)
        char_format = cursor.charFormat()
        char_format.setFontPointSize(font_size)
        char_format.setFontFamilies(font_family)
        cursor.mergeCharFormat(char_format)
        self.main_window.toolbar.font_size_menu.setCurrentText(str(font_size))
        self.main_window.toolbar.font_family_menu.setCurrentFont(font_family)
        if self.dialog:
            self.dialog = False
            self.deleteLater()
    
    # Opening links with Ctrl + Right click
    @staticmethod
    def handle_link_click(editor, event):
        if event.button() == Qt.MouseButton.LeftButton and event.modifiers() == Qt.KeyboardModifier.ControlModifier:
            anchor = editor.anchorAt(event.pos())
            if anchor:
                QDesktopServices.openUrl(QUrl(anchor))
                return True
        return False


class GoToPageDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.dialog = True
        self.setWindowTitle("Go to Page")
        self.setMinimumSize(main_window.size_unit * 6, main_window.size_unit * 5.5)
        self.editor = editor

        layout = QVBoxLayout()

        field_layout = QHBoxLayout()
        label = QLabel("Page:")
        field_layout.addWidget(label)
        label.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        self.page_field = QSpinBox()
        self.page_field.setRange(1, editor.page_count)
        self.page_field.setMinimumWidth(main_window.size_unit * 4)
        field_layout.addWidget(self.page_field)
        
        layout.addLayout(field_layout)

        button_layout = QHBoxLayout()
        apply_button = QPushButton("Apply")
        cancel_button = QPushButton("Cancel")
        apply_button.setAutoDefault(False)
        cancel_button.setAutoDefault(False)
        button_layout.addWidget(apply_button)
        button_layout.addWidget(cancel_button)
        layout.addLayout(button_layout)

        self.setLayout(layout)
        
        apply_button.clicked.connect(self.go_to_page)
        self.page_field.returnPressed.connect(self.go_to_page)
        cancel_button.clicked.connect(self.reject)

    def go_to_page(self):
        self.editor.go_to_page(self.page_field.value())
        if self.dialog:
            self.dialog = False
            self.deleteLater()