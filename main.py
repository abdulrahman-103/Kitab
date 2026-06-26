from PySide6.QtWidgets import QApplication
from mainwindow import MainWindow
import sys

if sys.platform == "win32":
    import ctypes
    console_window = ctypes.windll.kernel32.GetConsoleWindow()
    if console_window != 0:
        ctypes.windll.user32.ShowWindow(console_window, 0)


app = QApplication(sys.argv)
screen_resolution = app.primaryScreen().availableSize()
window = MainWindow()

app.exec()
