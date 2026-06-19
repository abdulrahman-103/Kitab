from PySide6.QtWidgets import QApplication
from mainwindow import MainWindow
import sys

app = QApplication(sys.argv)
screen_resolution = app.primaryScreen().availableSize()
window = MainWindow()

app.exec()