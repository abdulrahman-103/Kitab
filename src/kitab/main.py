#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QApplication
from main_window import MainWindow
import sys
from pathlib import Path
from PySide6.QtCore import QTranslator, QLocale

version = "0.2.0"

def main():
    if len(sys.argv) == 2 and sys.argv[1] == "--version":
        print(version)
        sys.exit(0)
    app = QApplication(sys.argv)
    app.setDesktopFileName("kitab")

    locale = QLocale.system().name().split("_")[0]
    translator = QTranslator()
    translation_directory = str(Path(__file__).resolve().parent / "translations")

    if translator.load(locale, translation_directory):
        app.installTranslator(translator)

    _window = MainWindow()
    app.exec()

if __name__ == "__main__":
    main()