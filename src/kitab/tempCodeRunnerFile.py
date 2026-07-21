
        if dialog.exec() == QColorDialog.Accepted:
            self.highlight_color = dialog.selectedColor()
            cursor = self.editor.textCursor()
            char_format = self.editor.currentCharFormat()
            char_format.setBackground(self.highlight_color)
            self.editor.setCurrentCharFormat(char_format)
            self.highlight_button.setStyleSheet(f"QPushButton {{background-color: {self.highlight_color.name()}; }}")
        self.view.viewport().setFocus()