#Copyright (C) <2026> <Abdulrahman>
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QPushButton, QSpinBox, QDoubleSpinBox, QHBoxLayout, QMessageBox, QDialog, QLineEdit, QCheckBox, QFormLayout, QVBoxLayout, QComboBox
from PySide6.QtGui import QTextCursor, QTextDocument, QTextTableFormat, QTextLength
from PySide6.QtCore import QSize, QRectF

class FindReplaceDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.editor = editor
        self.setWindowTitle("Find and replace")
        self.setFixedSize(main_window.size_unit*10, main_window.size_unit*5)

        self.find_field = QLineEdit()
        self.replace_field = QLineEdit()
        self.match_case = QCheckBox("Match case")

        fields = QFormLayout()
        fields.addRow("Find:", self.find_field)
        fields.addRow("Replace:", self.replace_field)

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
        layout.addLayout(fields)
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


class InsertTableDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.dialog = True
        self.setWindowTitle("Insert Table")
        self.setFixedSize(main_window.size_unit * 6, main_window.size_unit * 5.5)

        layout = QVBoxLayout()
        page_size_combo = QComboBox()

        columns_field = QSpinBox()
        rows_field = QSpinBox()
        width_field = QSpinBox()
        fields = QFormLayout()
        fields.addRow("Columns:", columns_field)
        fields.addRow("Rows:", rows_field)
        fields.addRow("Width:", width_field)
        layout.addLayout(fields)

        button_layout = QHBoxLayout()
        apply_button = QPushButton("Apply")
        cancel_button = QPushButton("Cancel")
        apply_button.setAutoDefault(False)
        cancel_button.setAutoDefault(False)
        button_layout.addStretch()
        button_layout.addWidget(apply_button)
        button_layout.addWidget(cancel_button)

        layout.addLayout(button_layout)
        self.setLayout(layout)
        
        apply_button.clicked.connect(lambda: self.insert_table(main_window, editor, columns_field.value(), rows_field.value(), width_field.value()))
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
            table = cursor.insertTable(rows, columns, table_format)
            main_window.view.viewport().setFocus()
            if self.dialog:
                self.dialog = False
                self.deleteLater()

class PageSizeDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.dialog = True
        self.setWindowTitle("Page Size")
        self.setFixedSize(main_window.size_unit * 6, main_window.size_unit * 5.5)

        layout = QVBoxLayout()

        page_size_combo = QComboBox()
        size_names = list(editor.PAGE_SIZES.keys())
        page_size_combo.addItems(size_names)

        current = (editor.base_width, editor.base_height)
        for i, name in enumerate(size_names):
            if editor.PAGE_SIZES[name] == current:
                page_size_combo.setCurrentIndex(i)
                break

        layout.addWidget(page_size_combo)

        width_field = QDoubleSpinBox()
        height_field = QDoubleSpinBox()
        fields = QFormLayout()
        fields.addRow("Width:", width_field)
        fields.addRow("Height:", height_field)
        layout.addLayout(fields)

        button_layout = QHBoxLayout()
        apply_button = QPushButton("Apply")
        cancel_button = QPushButton("Cancel")
        apply_button.setAutoDefault(False)
        cancel_button.setAutoDefault(False)
        button_layout.addStretch()
        button_layout.addWidget(apply_button)
        button_layout.addWidget(cancel_button)

        layout.addLayout(button_layout)
        self.setLayout(layout)
        
        apply_button.clicked.connect(lambda: (editor.document().setModified(True), self.apply_page_size(page_size_combo.currentText(), editor, main_window)))
        cancel_button.clicked.connect(self.reject)

    def apply_page_size(self, size, editor, main_window):
        name = size
        width, height = editor.PAGE_SIZES[name]
        editor.page_size = name
        editor.base_width = width
        editor.base_height = height
        editor.document().setPageSize(QSize(width, height))
        editor.page_count = editor.document().pageCount()
        editor.setMinimumSize(width, height)
        editor.setFixedSize(width, editor.page_count * height)
        main_window.scene.setSceneRect(QRectF(editor.rect()))
        editor.document().setPageSize(QSize(width, height))
        editor.page_count = editor.document().pageCount()
        if self.dialog:
            self.dialog = False
            self.deleteLater()