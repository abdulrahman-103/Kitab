#Copyright (C) 2026 Abdulrahman
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

from PySide6.QtWidgets import QFileDialog, QProgressDialog, QDialog, QMenuBar, QDockWidget, QMessageBox
from PySide6.QtGui import QIcon, QPageSize, QPdfWriter, QTextImageFormat
from PySide6.QtPrintSupport import QPrinter, QPrintDialog
from PySide6.QtCore import QTimer, Qt, QSize, QElapsedTimer, QRectF
from pathlib import Path
import zipfile
import json
from recent_documents import *
from dialogs import PageSizeDialog, InsertTableDialog, InsertLinkDialog, ChartPanel, encode_chart_href
import subprocess
import pygal
import uuid
import base64

class MenuBar(QMenuBar):

    CHART_WIDTH = 800
    CHART_HEIGHT = 500
    CHART_DISPLAY_WIDTH = 450

    def __init__(self, main_window, parent=None):
        super().__init__(parent)
        self.main_window = main_window
        self.editor = self.main_window.editor
        file_menu = self.addMenu("File")

        new_option = file_menu.addAction("New")
        new_icon = QIcon.fromTheme("document-new-symbolic")
        new_option.setIcon(new_icon)
        new_option.triggered.connect(self.new)
        new_option.setShortcut("Ctrl+N")

        open_option = file_menu.addAction("Open")
        open_icon = QIcon.fromTheme("document-open-symbolic")
        open_option.setIcon(open_icon)
        open_option.triggered.connect(self.open_file)
        open_option.setShortcut("Ctrl+O")

        recent_option = file_menu.addAction("Recent Documents")
        recent_icon = QIcon.fromTheme("document-open-recent-symbolic")
        recent_option.setIcon(recent_icon)
        recent_option.triggered.connect(lambda: show_recent_dialog(self.main_window))
        recent_option.setShortcut("Ctrl+H")

        save_option = file_menu.addAction("Save")
        save_icon = QIcon.fromTheme("document-save-symbolic")
        save_option.setIcon(save_icon)
        save_option.triggered.connect(self.save)
        save_option.setShortcut("Ctrl+S")

        save_as_option = file_menu.addAction("Save As")
        save_as_icon = QIcon.fromTheme("document-save-as-symbolic")
        save_as_option.setIcon(save_as_icon)
        save_as_option.triggered.connect(self.save_as)
        save_as_option.setShortcut("Ctrl+Shift+S")

        export_option = file_menu.addAction("Export")
        export_icon = QIcon.fromTheme("document-export-symbolic")
        export_option.setIcon(export_icon)
        export_option.triggered.connect(self.export_file)
        export_option.setShortcut("Ctrl+Shift+E")

        print_option = file_menu.addAction("Print")
        print_icon = QIcon.fromTheme("document-print-symbolic")
        print_option.setIcon(print_icon)
        print_option.triggered.connect(self.print_document)
        print_option.setShortcut("Ctrl+P")

        exit_option = file_menu.addAction("Exit")
        exit_icon = QIcon.fromTheme("application-exit-symbolic")
        exit_option.setIcon(exit_icon)
        exit_option.triggered.connect(self.main_window.app.quit)
        exit_option.setShortcut("Alt+F4")

        insert_menu = self.addMenu("Insert")

        table_option = insert_menu.addAction("Table")
        insert_table_icon = QIcon.fromTheme("insert-table-symbolic")
        table_option.setIcon(insert_table_icon)
        table_option.triggered.connect(self.insert_table)
        table_option.setShortcut("Ctrl+T")

        image_option = insert_menu.addAction("Image")
        insert_image_icon = QIcon.fromTheme("insert-image-symbolic")
        image_option.setIcon(insert_image_icon)
        image_option.triggered.connect(self.insert_image)
        image_option.setShortcut("Ctrl+I")

        chart_option = insert_menu.addAction("Chart")
        chart_icon = next((i for name in ("office-chart-bar", "x-office-chart", "view-statistics") if not (i := QIcon.fromTheme(name)).isNull()), QIcon())
        chart_option.setIcon(chart_icon)
        chart_option.triggered.connect(self.insert_chart)
        chart_option.setShortcut("Ctrl+Shift+C")
        
        link_option = insert_menu.addAction("Link")
        link_icon = QIcon.fromTheme("insert-link-symbolic")
        link_option.setIcon(link_icon)
        link_option.triggered.connect(self.insert_link)
        link_option.setShortcut("Ctrl+K")

        self.horizontal_line_option = insert_menu.addAction("Horizontal Line")
        if self.main_window.color_scheme == Qt.ColorScheme.Dark:
            horizontal_line_icon_path = str(Path(__file__).resolve().parent / "images" / "insert_horizontal_line_dark.svg")
        elif self.main_window.color_scheme == Qt.ColorScheme.Light:
            horizontal_line_icon_path = str(Path(__file__).resolve().parent / "images" / "insert_horizontal_line_light.svg")
        horizontal_line_icon = QIcon(horizontal_line_icon_path)
        self.horizontal_line_option.setIcon(horizontal_line_icon)
        self.horizontal_line_option.triggered.connect(self.insert_horizontal_line)
        self.horizontal_line_option.setShortcut("Ctrl+K")

        page_menu = self.addMenu("Page")

        page_size_option = page_menu.addAction("Page Size")
        page_size_option.triggered.connect(self.page_size)

        #page_margins_option = page_menu.addAction("Page Margins")
        #page_margins_option.triggered.connect(self.page_margins)

        self.main_window.setMenuBar(self)

        self.chart_dock = QDockWidget('Chart', self.main_window)
        self.chart_panel = ChartPanel(self.main_window, self._on_chart_apply)
        self.chart_dock.setWidget(self.chart_panel)
        self.chart_dock.setFeatures(QDockWidget.DockWidgetClosable | QDockWidget.DockWidgetMovable)
        self.main_window.addDockWidget(Qt.RightDockWidgetArea, self.chart_dock)
        self.chart_dock.hide()

    def _save_file(self):
        saving = QProgressDialog("Saving...", None, 0, 0, self)
        saving.setWindowTitle("Saving...")
        saving.setWindowModality(Qt.WindowModality.WindowModal)
        save_timer = QElapsedTimer()
        save_timer.start()
        saving.show()

        if self.main_window.file_path.endswith(".txt"):
            data = self.editor.toPlainText()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif self.main_window.file_path.endswith(".html"):
            data = self.editor.toHtml()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif self.main_window.file_path.endswith(".md"):
            data = self.editor.toMarkdown()
            with open(self.main_window.file_path, "w", encoding="utf-8") as file:
                file.write(data)
        elif self.main_window.file_path.endswith(".ktb"):
            html_data = self.editor.toHtml()
            json_data = {"page size": self.editor.page_size}
            with zipfile.ZipFile(self.main_window.file_path, mode="w") as zip:
                zip.writestr("mimetype", "application/prs.ktb+zip", compress_type=zipfile.ZIP_STORED)
                zip.writestr("document.html", html_data, compress_type=zipfile.ZIP_DEFLATED)
                zip.writestr("info.json", json.dumps(json_data), compress_type=zipfile.ZIP_DEFLATED)
        elif self.main_window.file_path.endswith(".odt"):
            odf_kit = Path(__file__).resolve().parent / "odf-kit"
            js = odf_kit / "html_to_odt.js"
            html = self.editor.toHtml()
            result = subprocess.run(["node", js, self.main_window.file_path], cwd=odf_kit, capture_output=True, text=True, input=html)
            if result.returncode != 0:
                saving.close()
                QMessageBox.warning(self, "Export failed", result.stderr or "Unable to convert document to ODT.")
                return

        self.editor.document().setModified(False)
        self.main_window.file_name = Path(self.main_window.file_path).name
        self.main_window.setWindowTitle(f"{self.main_window.file_name}  –  Kitab")

        try:
            register_recent_file(self.main_window.file_path)
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
        if not self.main_window.file_path:
            self.main_window.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", self.main_window.last_directory, "Kitab Document (*.ktb);;ODF Text Document (*.odt);;Text (*.txt);;Markdown File  (*.md);;HTML Document (*.html)")
            if not self.main_window.file_path:
                return "canceled"
            self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
            self._save_file()
        else:
            self._save_file()

    def save_as(self, show_dialog=True):
        file_path, format_filter = self.main_window.file_path, self.format_filter
        self.main_window.file_path, self.format_filter = QFileDialog.getSaveFileName(self, "Save As", self.main_window.last_directory, "Kitab Document (*.ktb);;ODF Text Document (*.odt);;Text (*.txt);;Markdown File  (*.md);;HTML Document (*.html)")
        if not self.main_window.file_path:
            self.main_window.file_path, self.format_filter = file_path, format_filter
        else:
            self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
            self._save_file()

    def new(self):
        self.main_window.setWindowTitle("Kitab")
        self.main_window.file_path = None
        self.format_filter = None
        self.main_window.file_name = None
        self.editor.clear()
        self.editor.document().setModified(False)
        self.main_window.view.viewport().setFocus()
        self.editor.setFocus()

    def _open_file(self):
        if self.main_window.file_path.endswith(".ktb"):
            with zipfile.ZipFile(self.main_window.file_path, "r") as zip:
                html_data = zip.read("document.html").decode("utf-8")
                json_data = json.loads(zip.read("info.json").decode("utf-8"))
            self.editor.setHtml(html_data)
            self.apply_page_size(json_data["page size"])
        elif self.main_window.file_path.endswith(".html"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                html_data = file.read()
            self.editor.setHtml(html_data)
        elif self.main_window.file_path.endswith(".txt"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                self.editor.setPlainText(data)
        elif self.main_window.file_path.endswith(".md"):
            with open(self.main_window.file_path, "r", encoding="utf-8") as file:
                data = file.read()
                self.editor.setMarkdown(data)
        elif self.main_window.file_path.endswith(".odt"):
            odf_kit = Path(__file__).resolve().parent / "odf-kit"
            js = odf_kit / "odt_to_html.js"
            result = subprocess.run(["node", js, self.main_window.file_path], cwd=odf_kit, capture_output=True, text=True)
            if result.returncode != 0:
                QMessageBox.warning(self, "Open failed", result.stderr or "Unable to convert document from ODT.")
                return
            self.editor.setHtml(result.stdout)

        self.editor.document().setModified(False)
        self.editor.document().setPageSize(QSize(self.editor.base_width, self.editor.base_height))
        total_pages = self.editor.document().pageCount()
        self.editor.setFixedSize(self.editor.width(), total_pages * self.editor.base_height)
        self.main_window.file_name = Path(self.main_window.file_path).name
        self.main_window.setWindowTitle(f"{self.main_window.file_name}  –  Kitab")

        try:
            register_recent_file(self.main_window.file_path)
        except ImportError:
            pass

    def open_file(self):
        self.main_window.file_path, self.format_filter = QFileDialog.getOpenFileName(self, "Open", self.main_window.last_directory, "Kitab, Text, Markdown, ODF Text Documents and HTML Documents (*.ktb *.odt *.txt *.md *.html);;Kitab Document (*.ktb);;ODF Text Document (*.odt);;Text (*.txt);;Markdown File (*.md);;HTML Document (*.html)")
        if not self.main_window.file_path:
            return
        self.main_window.last_directory = str(Path(self.main_window.file_path).parent)
        self._open_file()

    def export_file(self):
        file_path, format_filter = QFileDialog.getSaveFileName(self, "Export file", self.main_window.last_directory, "PDF File (*.pdf)")
        if not file_path:
            return
        self.main_window.last_directory = str(Path(file_path).parent)
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
        path, _ = QFileDialog.getOpenFileName(self, "Choose image", self.main_window.last_directory, "Image Files (*.png *.jpg *.jpeg *.bmp *.gif *.svg);;PNG Image (*.png);;JPEG Image (*.jpg *.jpeg);;SVG Image (*.svg);;BMP Image (*.bmp);;GIF Image (*.gif);;All Files (*)")
        if not path:
            return
        self.main_window.last_directory = str(Path(path).parent)
        image_format = QTextImageFormat()
        image_format.setName(path)
        image_format.setWidth(self.editor.base_width - 100)
        cursor = self.editor.textCursor()
        block_format = cursor.blockFormat()
        char_format = cursor.charFormat()
        cursor.insertImage(image_format)
        cursor.setBlockFormat(block_format)
        cursor.setCharFormat(char_format)
        cursor.insertBlock(block_format, char_format)

    def insert_chart(self):
        self.chart_panel.set_data(None, None)
        self.chart_dock.show()
        self.chart_panel.show()

    def edit_chart(self, chart_id, data):
        if data is None:
            return
        self.chart_panel.set_data(data, chart_id)
        self.chart_dock.show()
        self.chart_panel.show()

    def _render_chart(self, data):
        chart_type = data.get('type', 'Bar')
        show_legend = bool(data.get('show_legend', True))
        legend_position = data.get('legend_position', 'Right')
        title = data.get('title', '')
        labels = data.get('labels', [])
        values = data.get('values', [])
        colors = data.get('colors', ['#4caf50', '#f44336', '#2196f3'])
        style = pygal.style.Style(colors=colors, background='white', plot_background='white')
        chart_kwargs = {
            'style': style,
            'width': self.CHART_WIDTH,
            'height': self.CHART_HEIGHT,
            'title': title,
            'show_legend': show_legend,
            'legend_at_bottom': legend_position == 'Bottom',
        }
        if chart_type == 'Bar':
            chart = pygal.Bar(**chart_kwargs)
            chart.x_labels = labels
            chart.add(title or 'Series', values)
        elif chart_type == 'Line':
            chart = pygal.Line(**chart_kwargs)
            chart.x_labels = labels
            chart.add(title or 'Series', values)
        else:
            chart = pygal.Pie(**chart_kwargs)
            for label, value in zip(labels, values):
                chart.add(label, value)
        try:
            png_bytes = chart.render_to_png()
            return 'data:image/png;base64,' + base64.b64encode(png_bytes).decode('ascii')
        except Exception:
            return chart.render_data_uri()

    def _on_chart_apply(self, chart_id, data):
        data_uri = self._render_chart(data)
        display_height = round(self.CHART_DISPLAY_WIDTH * self.CHART_HEIGHT / self.CHART_WIDTH)
        target_id = chart_id or f"chart-{uuid.uuid4().hex}"
        href = encode_chart_href(target_id, data)
        img_html = f'<a href="{href}"><img src="{data_uri}" width="{self.CHART_DISPLAY_WIDTH}" height="{display_height}"/></a>'

        if chart_id is None:
            cursor = self.editor.textCursor()
            block_format = cursor.blockFormat()
            char_format = cursor.charFormat()
            cursor.insertHtml(img_html)
            cursor.setBlockFormat(block_format)
            cursor.setCharFormat(char_format)
            cursor.insertBlock(block_format, char_format)
            return

        doc = self.editor.document()
        block = doc.begin()
        while block.isValid():
            it = block.begin()
            while not it.atEnd():
                frag = it.fragment()
                if frag.isValid():
                    fmt = frag.charFormat()
                    try:
                        frag_href = fmt.anchorHref()
                    except Exception:
                        frag_href = ''
                    if frag_href.startswith(f'chart://{chart_id}'):
                        pos = frag.position()
                        length = frag.length()
                        cursor = self.editor.textCursor()
                        cursor.setPosition(pos)
                        cursor.setPosition(pos + length, cursor.MoveMode.KeepAnchor)
                        cursor.removeSelectedText()
                        cursor.insertHtml(img_html)
                        return
                it += 1
            block = block.next()

    def insert_table(self):
        if getattr(self, "insert_table_dialog", None) is None:
            self.insert_table_dialog = InsertTableDialog(self.editor, self.main_window)
        try:
            self.insert_table_dialog.exec()
        except RuntimeError:
            self.insert_table_dialog = InsertTableDialog(self.editor, self.main_window)
            self.insert_table_dialog.exec()
            
    def insert_link(self):
        if getattr(self, "insert_link_dialog", None) is None:
            self.insert_link_dialog = InsertLinkDialog(self.editor, self.main_window)
        try:
            self.insert_link_dialog.exec()
        except RuntimeError:
            self.insert_link_dialog = InsertLinkDialog(self.editor, self.main_window)
            self.insert_link_dialog.exec()

    def insert_horizontal_line(self):
        cursor = self.editor.textCursor()
        block_format = cursor.blockFormat()
        char_format = cursor.charFormat()
        cursor.insertHtml("<hr>")
        cursor.insertBlock(block_format, char_format)

    def page_size(self):
        if getattr(self, "page_size_dialog", None) is None:
            self.page_size_dialog = PageSizeDialog(self.editor, self.main_window)
        try:
            self.page_size_dialog.exec()
        except RuntimeError:
            self.page_size_dialog = PageSizeDialog(self.editor, self.main_window)
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
        self.main_window.scene.setSceneRect(QRectF(self.editor.rect()))
        self.editor.document().setPageSize(QSize(width, height))
        self.editor.page_count = self.editor.document().pageCount()