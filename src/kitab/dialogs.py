#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
from PySide6.QtWidgets import QPushButton, QSpinBox, QDoubleSpinBox, QHBoxLayout, QMessageBox, QDialog, QLineEdit, QCheckBox, QFormLayout, QVBoxLayout, QComboBox, QTableWidget, QTableWidgetItem, QLabel, QWidget, QDockWidget, QColorDialog, QGroupBox, QHeaderView
from PySide6.QtGui import QColor
from PySide6.QtGui import QTextCursor, QTextDocument, QTextTableFormat, QTextLength, QDesktopServices, QTextBlockFormat
from PySide6.QtCore import QSize, QRectF, Qt, QUrl
from urllib.parse import urlparse

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
            block_format = cursor.blockFormat()
            char_format = cursor.charFormat()
            
            table = cursor.insertTable(rows, columns, table_format)
            for r in range(rows):
                for c in range(columns):
                    cell = table.cellAt(r, c)
                    cell_cursor = cell.firstCursorPosition()
                    cell_cursor.setBlockCharFormat(char_format)
            cursor.movePosition(QTextCursor.MoveOperation.End)
            cursor.insertBlock(block_format, char_format)
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

class InsertLinkDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.dialog = True
        self.setWindowTitle("Insert Link")
        self.setFixedSize(main_window.size_unit * 7, main_window.size_unit * 4.5)

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
        button_layout.addStretch()
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
        if self.dialog:
            self.dialog = False
            self.deleteLater()
    
    @staticmethod
    def handle_link_click(editor, event):
        if event.button() == Qt.MouseButton.LeftButton and event.modifiers() == Qt.KeyboardModifier.ControlModifier:
            anchor = editor.anchorAt(event.pos())
            if anchor:
                QDesktopServices.openUrl(QUrl(anchor))
                return True
        return False

class ChartPanel(QWidget):

    RESIZE_MARGIN = 6   
    MIN_WIDTH = 260
    MAX_WIDTH = 900

    def __init__(self, main_window, apply_callback):
        super().__init__(main_window)
        self.main_window = main_window
        self.apply_callback = apply_callback
        self.current_chart_id = None

        self._resizing = False
        self._resize_start_x = 0
        self._resize_start_width = 0
        self.setMouseTracking(True)

        size_unit = getattr(main_window, 'size_unit', 60)
        start_width = max(self.MIN_WIDTH, min(self.MAX_WIDTH, size_unit * 8))
        self.setFixedWidth(start_width)

        self.type_combo = QComboBox()
        self.type_combo.addItems(['Bar', 'Line', 'Pie'])

        self.title_field = QLineEdit()
        self.title_field.setPlaceholderText('Chart title')

        self.legend_checkbox = QCheckBox('Show legend')
        self.legend_position = QComboBox()
        self.legend_position.addItems(['Right', 'Bottom', 'None'])

        self.table = QTableWidget(0, 3)
        self.table.setHorizontalHeaderLabels(['Label', 'Value', 'Color'])
        self.table.cellDoubleClicked.connect(self._pick_color)
        self.table.verticalHeader().setVisible(False)
        self.table.horizontalHeader().setStretchLastSection(False)
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.ResizeToContents)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setAlternatingRowColors(True)
        self.table.setEditTriggers(QTableWidget.EditTrigger.DoubleClicked | QTableWidget.EditTrigger.EditKeyPressed)

        add_btn = QPushButton('Add')
        remove_btn = QPushButton('Remove')
        apply_btn = QPushButton('Apply')
        apply_btn.setDefault(True)
        close_btn = QPushButton('Close')

        add_btn.clicked.connect(self.add_row)
        remove_btn.clicked.connect(self.remove_row)
        apply_btn.clicked.connect(self._on_apply)
        close_btn.clicked.connect(lambda: self.hide())
        row_btn_layout = QHBoxLayout()
        row_btn_layout.setSpacing(6)
        row_btn_layout.addWidget(add_btn)
        row_btn_layout.addWidget(remove_btn)
        row_btn_layout.addStretch()

        bottom_layout = QHBoxLayout()
        bottom_layout.setSpacing(6)
        bottom_layout.addStretch()
        bottom_layout.addWidget(apply_btn)
        bottom_layout.addWidget(close_btn)

        settings_group = QGroupBox('Chart settings')
        form = QFormLayout()
        form.setSpacing(8)
        form.setLabelAlignment(Qt.AlignmentFlag.AlignRight)
        form.addRow('Type:', self.type_combo)
        form.addRow('Title:', self.title_field)
        form.addRow(self.legend_checkbox)
        form.addRow('Legend position:', self.legend_position)
        settings_group.setLayout(form)

        data_group = QGroupBox('Data')
        data_layout = QVBoxLayout()
        data_layout.setSpacing(6)
        data_layout.addLayout(row_btn_layout)
        data_layout.addWidget(self.table)
        data_group.setLayout(data_layout)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(self.RESIZE_MARGIN + 6, 10, 10, 10)
        layout.setSpacing(10)
        layout.addWidget(settings_group)
        layout.addWidget(data_group, 1)
        layout.addLayout(bottom_layout)

    def set_data(self, data, chart_id=None):
        self.current_chart_id = chart_id
        self.table.setRowCount(0)
        if not data:
            self.type_combo.setCurrentIndex(0)
            self.title_field.setText('')
            self.legend_checkbox.setChecked(True)
            self.legend_position.setCurrentText('Right')
            return
        self.type_combo.setCurrentText(data.get('type', 'Bar'))
        self.title_field.setText(data.get('title', ''))
        self.legend_checkbox.setChecked(bool(data.get('show_legend', True)))
        pos = data.get('legend_position', 'Right')
        if pos not in ['Right', 'Bottom', 'None']:
            pos = 'Right'
        self.legend_position.setCurrentText(pos)
        labels = data.get('labels', [])
        values = data.get('values', [])
        colors = data.get('colors', [])
        for i, (l, v) in enumerate(zip(labels, values)):
            color = colors[i] if i < len(colors) else ['#4caf50', '#f44336', '#2196f3'][i % 3]
            self._append_row(l, str(v), color)

    def add_row(self):
        index = self.table.rowCount()
        letter = chr(ord('A') + index) if index < 26 else str(index + 1)
        value = f'{index + 1}.0'
        color = ['#4caf50', '#f44336', '#2196f3'][index % 3]
        self._append_row(f'Data {letter}', value, color)

    def _append_row(self, label, value, color):
        row = self.table.rowCount()
        self.table.insertRow(row)
        self.table.setItem(row, 0, QTableWidgetItem(label))
        self.table.setItem(row, 1, QTableWidgetItem(value))
        color_item = QTableWidgetItem(color)
        try:
            color_item.setBackground(QColor(color))
        except Exception:
            pass
        color_item.setData(Qt.ItemDataRole.UserRole, color)
        self.table.setItem(row, 2, color_item)

    def remove_row(self):
        row = self.table.currentRow()
        if row >= 0:
            self.table.removeRow(row)

    def _pick_color(self, row, column):
        if column != 2:
            return
        item = self.table.item(row, column)
        initial = item.data(Qt.ItemDataRole.UserRole) if item is not None else '#4caf50'
        col = QColorDialog.getColor(QColor(initial), self)
        if col.isValid():
            hexc = col.name()
            item.setText(hexc)
            item.setData(Qt.ItemDataRole.UserRole, hexc)
            item.setBackground(QColor(hexc))

    def _on_apply(self):
        chart_type = self.type_combo.currentText()
        title = self.title_field.text()
        show_legend = self.legend_checkbox.isChecked()
        legend_position = self.legend_position.currentText()
        labels = []
        values = []
        colors = []
        for r in range(self.table.rowCount()):
            lab = self.table.item(r, 0)
            val = self.table.item(r, 1)
            col = self.table.item(r, 2)
            if lab is None or val is None:
                continue
            labels.append(lab.text())
            try:
                values.append(float(val.text()))
            except Exception:
                try:
                    values.append(int(val.text()))
                except Exception:
                    values.append(0)
            colors.append(col.data(Qt.ItemDataRole.UserRole) if col is not None else '#4caf50')
        data = {
            'type': chart_type,
            'title': title,
            'labels': labels,
            'values': values,
            'show_legend': show_legend,
            'legend_position': legend_position,
            'colors': colors,
        }
        self.apply_callback(self.current_chart_id, data)

    def _in_resize_zone(self, pos):
        return pos.x() <= self.RESIZE_MARGIN

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton and self._in_resize_zone(event.pos()):
            self._resizing = True
            self._resize_start_x = event.globalPosition().x()
            self._resize_start_width = self.width()
            event.accept()
        else:
            super().mousePressEvent(event)

    def mouseMoveEvent(self, event):
        if self._resizing:
            delta = self._resize_start_x - event.globalPosition().x()
            new_width = self._resize_start_width + delta
            new_width = max(self.MIN_WIDTH, min(self.MAX_WIDTH, new_width))
            self.setFixedWidth(int(new_width))
            event.accept()
            return
        if self._in_resize_zone(event.pos()):
            self.setCursor(Qt.CursorShape.SizeHorCursor)
        else:
            self.setCursor(Qt.CursorShape.ArrowCursor)
        super().mouseMoveEvent(event)

    def mouseReleaseEvent(self, event):
        if self._resizing and event.button() == Qt.MouseButton.LeftButton:
            self._resizing = False
            self.setCursor(Qt.CursorShape.ArrowCursor)
            event.accept()
        else:
            super().mouseReleaseEvent(event)

    def leaveEvent(self, event):
        if not self._resizing:
            self.setCursor(Qt.CursorShape.ArrowCursor)
        super().leaveEvent(event)