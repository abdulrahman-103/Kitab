
from PySide6.QtWidgets import QMainWindow, QTextEdit, QToolBar, QFileDialog, QMenu, QPushButton, QWidget, QHBoxLayout, QApplication, QGraphicsScene, QGraphicsView, QComboBox, QSizePolicy
from PySide6.QtGui import QAction, QIntValidator, QGuiApplication, QIcon
from PySide6.QtCore import QTimer, Qt, QSize
from PySide6.QtWebEngineCore import QWebEnginePage
from PySide6.QtGui import QPdfWriter, QPageLayout, QPageSize, QCursor
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        app = QApplication.instance()
        resolution = app.primaryScreen().availableSize()
        self.resize(resolution.width()/2, resolution.height())
        self.move((resolution.width()-self.width())/2, 0)
        self.setWindowTitle("Kitab")
        self.setWindowIcon(QIcon("icon.png"))
        self.showNormal()
        self.scene = QGraphicsScene()
        self.add_toolbar()
        self.editor = Editor(self)
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        self.pages = []
        self.current_page = None
        self.scene.addWidget(self.editor)
        self.view = QGraphicsView(self.scene)
        self.view.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.view.setStyleSheet("background-color: #1e1e1e;")
        self.view.centerOn(self.editor.width() / 2, 0)
        
        self.setCentralWidget(self.view)
        self.editor.cursorPositionChanged.connect(self.sync_font)
    
        self.zoom_factor = resolution.height() / self.editor.height()
        self.view.scale(self.zoom_factor, self.zoom_factor)
        self.view.viewport().installEventFilter(self)

        self.shortcuts()
        
        

    def add_toolbar(self):
        toolbar = QToolBar()
        toolbar.setMovable(False)
        file = QPushButton("File", self)
        file_menu = QMenu(self)
        file.setMenu(file_menu)

        save_as_option = file_menu.addAction("Save As")
        save_as_option.triggered.connect(self.save_as)
        
        open_option = file_menu.addAction("Open")
        open_option.triggered.connect(self.open)

        export = file_menu.addAction("Export")
        export.triggered.connect(self.export_file)
        toolbar.addWidget(file)
        toolbar.addSeparator()


        self.font_size_menu = QComboBox()
        self.font_size_menu.addItems(["6","7","8","9","10","11","12","13","14","15","16","18","20","21","22","24","26","28","32","36","40","42","44","48","54","60","66","72","80","88","96"])
        self.font_size_menu.setCurrentText("16")
        self.font_size = int(self.font_size_menu.currentText())
        self.font_size_menu.setEditable(True)
        validator = QIntValidator(6, 500, self)
        self.font_size_menu.lineEdit().setValidator(validator)
        self.font_size_menu.activated.connect(self.change_font_size)
        self.font_size_menu.lineEdit().returnPressed.connect(self.change_font_size)
        self.font_size_menu.setFocusPolicy(Qt.FocusPolicy.ClickFocus)
        self.font_size_menu.setInsertPolicy(QComboBox.InsertPolicy.NoInsert)
        self.font_size_menu.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        toolbar.addWidget(self.font_size_menu)
        toolbar.addSeparator()
        
        self.bold_button = QPushButton("B", self)
        self.bold_button.setCheckable(True)
        self.bold_button.setStyleSheet("font-weight: bold")
        self.bold_button.clicked.connect(self.toggle_bold)
        toolbar.addWidget(self.bold_button)

        self.addToolBar(toolbar)


    def eventFilter(self, watched, event):
        if event.type() == event.Type.Wheel:
            self.wheelEvent(event)
            return True  #Blocks the underlying scene elements from swallowing the scroll
        return super().eventFilter(watched, event) #If not a scroll return to original event filter


    def wheelEvent(self, event):
        if event.modifiers() == Qt.KeyboardModifier.ControlModifier:
            direction = event.angleDelta().y()
            if direction > 0:
                self.zoom("in")
            else:
                self.zoom("out")
        else:
            scroll_bar = self.view.verticalScrollBar()
            if scroll_bar:
                steps = event.angleDelta().y()
                scroll_bar.setValue(scroll_bar.value() - steps)

    def zoom(self, direction: str):
        if direction == "in" and self.zoom_factor < 5.0:
            self.zoom_factor += 0.075
        elif direction == "out" and self.zoom_factor > 0.1:
            self.zoom_factor -= 0.075
        
        self.view.resetTransform()  
        self.view.scale(self.zoom_factor, self.zoom_factor)
        

    def save_as(self):
        file_name, format_filter = QFileDialog.getSaveFileName(self, "Save As", "", "Kitab File (*.ktb);;Text File (*.txt)")
        if not file_name:
            return
        else:
            with open(file_name, "w", encoding="utf-8") as file:
                if format_filter == "Kitab File (*.ktb)":
                    data = self.editor.toHtml()
                elif format_filter == "Text File (*.txt)":
                    data = self.editor.toPlainText()
                file.write(data)

    def open(self):
        file_name, format_filter = QFileDialog.getOpenFileName(self, "Open", "", "Kitab File (*.ktb);;Text File (*.txt)")
        if not file_name:
            return
        else:
            with open(file_name, "r", encoding="utf-8") as file:
                if format_filter == "Kitab File (*.ktb)":
                    data = file.read()
                    self.editor.setHtml(data)
                elif format_filter == "Text File (*.txt)":
                    data = self.editor.toPlainText()


    def export_file(self):
        file_name, format_filter = QFileDialog.getSaveFileName(self, "Export file", "", "PDF File (*.pdf)")
        if not file_name:
            return
        else:
            pdf_writer = QPdfWriter(file_name)
            
            # 2. Force structural A4 paper layout scaling so content fits correctly
            pdf_writer.setPageSize(QPageSize.PageSizeId.A4)
            pdf_writer.setPageMargins(QPageLayout.MarginsF(10, 10, 10, 10), QPageLayout.Unit.Millimeter)
            
            # 3. Synchronously push the text document data directly into the renderer engine
            self.editor.document().print_(pdf_writer)    
    

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
        
        def printsomethingdef():
            print(self.editor.document().size())
            
        printsomething =  QAction(self)
        printsomething.setShortcut(Qt.Key.Key_F1)
        printsomething.triggered.connect(printsomethingdef)
        self.addAction(printsomething)


    def sync_font(self):
            if not self.editor.textCursor().hasSelection():
                font = self.editor.currentFont().pointSize()
                self.font_size_menu.setCurrentText(str(font))

    def change_font_size(self):
        self.font_size = int(self.font_size_menu.currentText())
        font = self.editor.currentFont()
        font.setPointSize(self.font_size)
        self.editor.setCurrentFont(font)

        self.view.viewport().setFocus()

    def toggle_bold(self):
        font = self.editor.currentFont()
        font.setBold(not font.bold())
        self.editor.setCurrentFont(font)
        self.view.viewport().setFocus()


class Editor(QTextEdit):
    def __init__(self, main_window):
        super().__init__()
        self.page_count = self.document().pageCount()
        self.base_width, self.base_height= 794, 1123
        self.main_window = main_window
        self.setMinimumSize(self.base_width, self.base_height)
        self.document().setPageSize(QSize(self.base_width, self.base_height))
        self.document().setDocumentMargin(20*(96/25.4)) #mm to pt (inch is 72 pt and is 25.4mm)
        self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        
        self.setStyleSheet("QTextEdit {background-color: white; color: black;}")

        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        
        font = self.font()
        font.setPointSize(16)
        self.setFont(font)
        self.textChanged.connect(self.check_page_limit)
        self.textChanged.connect(self.printinfo)

    def printinfo(self):
        print(self.document().pageCount())
        
    def check_page_limit(self):
        self.setFixedSize(self.width(), self.document().pageCount() * self.base_height)
        self.document().setPageSize(QSize(self.base_width, self.base_height))
        
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.RightButton:
            menu = QMenu()
            
            undo = menu.addAction("Undo")
            undo.setEnabled(self.document().isUndoAvailable())
            undo.triggered.connect(self.undo)
            
            redo = menu.addAction("Redo")
            redo.setEnabled(self.document().isRedoAvailable())
            redo.triggered.connect(self.redo)
            
            menu.addSeparator()
            
            cut = menu.addAction("Cut")
            cut.setEnabled(self.textCursor().hasSelection())
            cut.triggered.connect(self.cut)
            
            copy = menu.addAction("Copy")
            copy.setEnabled(self.textCursor().hasSelection())
            copy.triggered.connect(self.copy)
            
            paste = menu.addAction("Paste")
            paste.triggered.connect(self.paste)
            
            menu.addSeparator()

            find = menu.addAction("Find")
            #find.triggered.connect()
            
            select_all = menu.addAction("Select All")
            select_all.triggered.connect(self.selectAll)

            menu.exec(QCursor.pos())
            event.accept()
            return
            
        super().mousePressEvent(event)
