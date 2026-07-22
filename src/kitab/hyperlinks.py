#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QDialog, QVBoxLayout, QFormLayout, QLineEdit, QHBoxLayout, QPushButton
from PySide6.QtGui import QTextCursor, QTextCharFormat, QDesktopServices
from PySide6.QtCore import Qt, QUrl

class InsertLinkDialog(QDialog):
    def __init__(self, editor, main_window):
        super().__init__(main_window)
        self.setWindowTitle("Insert Link")
        self.editor = editor
        self.setFixedSize(main_window.size_unit * 6, main_window.size_unit * 4)

        layout = QVBoxLayout(self)
        fields = QFormLayout()
        
        self.text_field = QLineEdit()
        self.url_field = QLineEdit()
        
        cursor = editor.textCursor()
        if cursor.hasSelection():
            self.text_field.setText(cursor.selectedText())

        fields.addRow("Text:", self.text_field)
        fields.addRow("URL:", self.url_field)
        layout.addLayout(fields)

        buttons = QHBoxLayout()
        apply_btn = QPushButton("Apply")
        cancel_btn = QPushButton("Cancel")
        apply_btn.setAutoDefault(False)
        cancel_btn.setAutoDefault(False)
        
        buttons.addStretch()
        buttons.addWidget(apply_btn)
        buttons.addWidget(cancel_btn)
        layout.addLayout(buttons)

        apply_btn.clicked.connect(self.apply_link)
        cancel_btn.clicked.connect(self.reject)

    def apply_link(self):
        text = self.text_field.text()
        url = self.url_field.text()
        if not url:
            return

        cursor = self.editor.textCursor()
        
        if cursor.hasSelection() and text != cursor.selectedText():
            cursor.insertText(text)
            cursor.setPosition(cursor.position() - len(text), QTextCursor.MoveMode.KeepAnchor)
        elif not cursor.hasSelection() and text:
            cursor.insertText(text)
            cursor.setPosition(cursor.position() - len(text), QTextCursor.MoveMode.KeepAnchor)

        char_format = cursor.charFormat()
        char_format.setAnchor(True)
        char_format.setAnchorHref(url)
        char_format.setForeground(Qt.GlobalColor.blue)
        char_format.setUnderlineStyle(QTextCharFormat.UnderlineStyle.SingleUnderline)
        
        cursor.mergeCharFormat(char_format)
        self.accept()

def handle_link_click(editor, event):
    if event.modifiers() == Qt.KeyboardModifier.ControlModifier and event.button() == Qt.MouseButton.LeftButton:
        pos = event.pos()
        cursor = editor.cursorForPosition(pos)
        char_format = cursor.charFormat()
        if char_format.isAnchor():
            url = char_format.anchorHref()
            if url:
                QDesktopServices.openUrl(QUrl(url))
                return True
    return False
