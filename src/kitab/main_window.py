#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QMainWindow, QToolButton, QApplication, QGraphicsScene, QGraphicsView, QStatusBar, QMessageBox, QWidget, QHBoxLayout
from PySide6.QtGui import QAction, QIcon, QShortcut, QPalette
from PySide6.QtCore import QTimer, Qt
import sys
from pathlib import Path
from editor import Editor
from toolbar import Toolbar
from menubar import  MenuBar
from dialogs import FindReplaceDialog, GoToPageDialog
from minimap import Minimap

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.app = QApplication.instance()
        self.resolution = self.app.primaryScreen().availableSize()
        self.resize(self.resolution.width()/1.5, self.resolution.height()/1.5)
        self.setWindowTitle(self.tr("Kitab"))
        self.file_path = None
        self.file_name = None
        self.format_filter = None
        self.last_directory = None
        
        icon_path = str(Path(__file__).resolve().parents[2] / "data" / "images" / "icon.svg")
        self.setWindowIcon(QIcon(icon_path))

        self.showMaximized()
        self.scene = QGraphicsScene()
        self.editor = Editor(self)

        self.color_scheme = self.app.styleHints().colorScheme()

        self.toolbar = Toolbar(self)
        self.menubar = MenuBar(self)

        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        
        self.scene.addWidget(self.editor)
        self.view = QGraphicsView(self.scene)
        self.view.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.background_color = self.app.palette().color(QPalette.ColorRole.Dark)
        self.view.setStyleSheet(f"QGraphicsView {{background-color: {self.background_color.name()};}}")
        self.app.styleHints().colorSchemeChanged.connect(self.update_colors)
        self.view.centerOn(self.editor.width() / 2, 0)
        
        self.minimap = Minimap(self)
        central_widget = QWidget()
        layout = QHBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        layout.addWidget(self.view)
        layout.addWidget(self.minimap)
        self.setCentralWidget(central_widget)

        self.toolbar.align(Qt.AlignmentFlag.AlignHCenter)
        self.editor.document().clearUndoRedoStacks()

        self.editor.cursorPositionChanged.connect(self.toolbar.sync_font)

        self.shortcuts()

        #opening file with commandline
        if len(sys.argv) == 2:
            self.file_path = sys.argv[1]
            self.editor._open_file()

        self.scroll_bar = self.view.verticalScrollBar()
        self.add_statusbar()
        self.default_zoom_factor = self.resolution.height() / self.editor.base_height / 1.25
        self.zoom_factor = self.default_zoom_factor
        self.view.scale(self.zoom_factor, self.zoom_factor)
        self.view.viewport().installEventFilter(self)
        self.scroll_bar.setValue(0)
        self.editor.document().setModified(False)
        QTimer.singleShot(0, lambda: (self.view.viewport().setFocus(), self.editor.setFocus()))

    def update_colors(self): #updates colors on system theme change
        self.color_scheme = self.app.styleHints().colorScheme()
        self.background_color = self.app.palette().color(QPalette.ColorRole.Dark)
        self.view.setStyleSheet(f"QGraphicsView {{background-color: {self.background_color.name()};}}")
        if self.color_scheme == Qt.ColorScheme.Dark:
            horizontal_line_icon_path = str(Path(__file__).resolve().parents[2] / "data" / "images" / "insert_horizontal_line_dark.svg")
            horizontal_line_icon = QIcon(horizontal_line_icon_path)
            self.menubar.horizontal_line_option.setIcon(horizontal_line_icon)
        elif self.color_scheme == Qt.ColorScheme.Light:
            horizontal_line_icon_path = str(Path(__file__).resolve().parents[2] / "data" / "images" / "insert_horizontal_line_light.svg")
            horizontal_line_icon = QIcon(horizontal_line_icon_path)
            self.menubar.horizontal_line_option.setIcon(horizontal_line_icon)
        
        self.minimap.setStyleSheet(f"background-color: {self.background_color.name()};")

        self.statusbar.button.setStyleSheet("color: palette(WindowText); padding-left: 5px;")

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
                status = self.menubar.save()
                if status == "canceled":
                    event.ignore()
                else:
                    event.accept() 
                
            elif clicked == donotsave_button:
                event.accept()
            else:
                event.ignore()

    def go_to_page(self):
        if getattr(self, "insert_link_dialog", None) is None:
            self.go_to_page_dialog = GoToPageDialog(self.editor, self)
        try:
            self.go_to_page_dialog.exec()
        except RuntimeError:
            self.go_to_page_dialog = GoToPageDialog(self.editor, self)
            self.go_to_page_dialog.exec()

    def add_statusbar(self):
        self.statusbar = QStatusBar()
        self.statusbar.button = QToolButton()
        self.statusbar.button.setShortcut("Ctrl+G")
        self.statusbar.button.clicked.connect(self.go_to_page)
        self.statusbar.button.setStyleSheet("color: palette(WindowText); padding-left: 5px;")
        self.statusbar.addWidget(self.statusbar.button)
        self.statusbar.button.setText(f"Page {self.editor.current_page()} of {self.editor.page_count}")
        self.editor.textChanged.connect(lambda: self.statusbar.button.setText(f"Page {self.editor.current_page()} of {self.editor.page_count}"))
        self.scroll_bar.valueChanged.connect(lambda: self.statusbar.button.setText(f"Page {self.editor.current_page()} of {self.editor.page_count}"))
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
        resolution_factor = self.resolution.height() / 720 #my resolution is 1080p with 150% scaling. the factor use is to make the max and min limits equal on all resolutions
        page_size_factor = self.editor.PAGE_SIZES["A4"].mm_to_pixels().y / self.editor.base_height
        min = 0.05 * resolution_factor * page_size_factor
        max = 5.0 * resolution_factor * page_size_factor
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

    def find_replace(self):
        if getattr(self, "find_dialog", None) is None:
            self.find_dialog = FindReplaceDialog(self.editor, self)
        self.find_dialog.show()
        self.find_dialog.activateWindow()

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

        go_to_page_shortcut = QAction(self)
        go_to_page_shortcut.setShortcut("Ctrl+G")
        go_to_page_shortcut.triggered.connect(self.go_to_page)
        self.addAction(go_to_page_shortcut)

        self.find_action = QAction(self)
        self.find_action.setText("Find")
        self.find_action.setShortcut("Ctrl+F")
        self.find_action.triggered.connect(self.find_replace)
        self.addAction(self.find_action)

        # binds Ctrl+1 through Ctrl+9 to quickly jump to specific pages
        for i in range(1, 10):
            shortcut = QShortcut(f"Ctrl+{i}", self)
            shortcut.activated.connect(lambda page=i: self.editor.go_to_page(page))
