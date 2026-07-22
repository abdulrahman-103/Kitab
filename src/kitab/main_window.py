#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

<<<<<<< HEAD
from PySide6.QtWidgets import QMainWindow, QApplication, QGraphicsScene, QGraphicsView, QStatusBar, QMessageBox
from PySide6.QtGui import QAction, QIcon, QShortcut, QPalette
from PySide6.QtCore import QTimer, Qt
import sys
from pathlib import Path
from editor import Editor
from toolbar import add_toolbar, align, sync_font
from menubar import add_menubar, _open_file
from dialogs import FindReplaceDialog
=======
from PySide6.QtWidgets import QMainWindow, QFileDialog, QApplication, QGraphicsScene, QGraphicsView, QProgressDialog, QDialog, QStatusBar, QMessageBox
from PySide6.QtGui import QAction, QIcon, QPageSize, QPdfWriter, QTextImageFormat, QShortcut, QPalette
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
from PySide6.QtCore import QTimer, Qt, QSize, QElapsedTimer, QRectF
import sys
from pathlib import Path
import zipfile
import json
from editor import Editor
from toolbar import *
from menubar import *
from dialogs import *
from recent_documents import register_recent_file
>>>>>>> b91019c (closes #44)

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

        add_toolbar(self)
        add_menubar(self)

        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        
        self.scene.addWidget(self.editor)
        self.view = QGraphicsView(self.scene)
        self.view.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.background_color = self.app.palette().color(QPalette.ColorRole.Dark)
        self.view.setStyleSheet(f"QGraphicsView {{background-color: {self.background_color.name()};}}")
        self.app.styleHints().colorSchemeChanged.connect(self.update_background_color)
        self.view.centerOn(self.editor.width() / 2, 0)
        self.setCentralWidget(self.view)

        align(self, Qt.AlignmentFlag.AlignHCenter)

        self.editor.cursorPositionChanged.connect(lambda: sync_font(self))

        self.shortcuts()

        #opening file with commandline
        if len(sys.argv) == 2:
            self.file_path = sys.argv[1]
<<<<<<< HEAD
            _open_file(self)
=======
            self._open_file()
>>>>>>> b91019c (closes #44)

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
            msg_box.addButton("Cancel", QMessageBox.ButtonRole.RejectRole)

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
<<<<<<< HEAD

    def find_replace(self):
        if getattr(self, "find_dialog", None) is None:
            self.find_dialog = FindReplaceDialog(self.editor, self)
        self.find_dialog.show()
        self.find_dialog.activateWindow()

=======
        
>>>>>>> b91019c (closes #44)
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
            shortcut.activated.connect(lambda page=i: go_to_page(page))

        def go_to_page(page):
            if page > self.editor.page_count:
                return
            target_y = (page - 1) * self.editor.base_height + (self.editor.base_height / 2)
<<<<<<< HEAD
            self.view.centerOn(self.view.sceneRect().center().x(), target_y)
=======
            self.view.centerOn(self.view.sceneRect().center().x(), target_y)

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
>>>>>>> b91019c (closes #44)
