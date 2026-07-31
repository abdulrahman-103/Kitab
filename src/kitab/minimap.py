import math
from PySide6.QtWidgets import QGraphicsView, QFrame, QMenu
from PySide6.QtGui import QPainter, QColor, QPen, QFont, QShortcut, QKeySequence
from PySide6.QtCore import Qt, QRectF, QTimer

class Minimap(QGraphicsView):

    def __init__(self, main_window):
        super().__init__(main_window.scene)
        self.main_window = main_window
        self.WIDTH = self.main_window.size_unit * 5
        self._hovering = False
        self._dragging = False
        self._side = "right"

        self._setup_view()
        self._apply_style()
        self._connect_signals()
        self._setup_shortcut()
        self._update_scale()

    def _setup_view(self):
        self.setFixedWidth(self.WIDTH)
        self.setRenderHints(
            QPainter.RenderHint.Antialiasing
            | QPainter.RenderHint.SmoothPixmapTransform
        )
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setFrameShape(QFrame.Shape.NoFrame)
        self.setViewportUpdateMode(
            QGraphicsView.ViewportUpdateMode.SmartViewportUpdate
        )
        self.setDragMode(QGraphicsView.DragMode.NoDrag)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setAttribute(Qt.WidgetAttribute.WA_Hover, True)
        self.setInteractive(False)

    def _apply_style(self):
        bg = self.main_window.background_color.name()
        border_side = "border-left" if self._side == "right" else "border-right"
        self.setStyleSheet(f"""
            QGraphicsView {{
                background-color: {bg};
                {border_side}: 1px solid rgba(255, 255, 255, 25);
            }}
        """)

    def _setup_shortcut(self):
        self._toggle_shortcut = QShortcut(QKeySequence("F7"), self.main_window)
        self._toggle_shortcut.setContext(Qt.ShortcutContext.ApplicationShortcut)
        self._toggle_shortcut.activated.connect(self.main_window.toolbar.toggle_minimap)

    def contextMenuEvent(self, event):
        menu = QMenu(self)
        action_label = "Hide minimap (F7)"
        action = menu.addAction(action_label)
        action.triggered.connect(self.main_window.toolbar.toggle_minimap)

        side_label = "Move to left" if self._side == "right" else "Move to right"
        side_action = menu.addAction(side_label)
        side_action.triggered.connect(self.toggle_side)

        menu.exec(event.globalPos())

    def _get_container_layout(self):
        parent = self.parentWidget()
        return parent.layout() if parent is not None else None

    def toggle_side(self):
        layout = self._get_container_layout()
        if layout is None:
            return

        layout.removeWidget(self)

        if self._side == "right":
            layout.insertWidget(0, self)
            self._side = "left"
        else:
            layout.addWidget(self)
            self._side = "right"

        self._apply_style()
        self.viewport().update()

    def _connect_signals(self):
        self._update_timer = QTimer(self)
        self._update_timer.setSingleShot(True)
        self._update_timer.setInterval(16)
        self._update_timer.timeout.connect(self.viewport().update)

        self.main_window.view.verticalScrollBar().valueChanged.connect(
            self._on_main_scroll
        )
        self.main_window.editor.textChanged.connect(self._schedule_update)
        self.scene().sceneRectChanged.connect(self._on_scene_rect_changed)

    def _schedule_update(self, *_):
        if not self._update_timer.isActive():
            self._update_timer.start()

    def _on_main_scroll(self, *_):
        self._sync_scroll()
        self._schedule_update()

    def _on_scene_rect_changed(self, *_):
        self._update_scale()
        self._sync_scroll()
        self._schedule_update()

    def _update_scale(self):
        scene_rect = self.scene().sceneRect()
        if scene_rect.width() <= 0:
            return
        factor = self.WIDTH / scene_rect.width()
        self.resetTransform()
        self.scale(factor, factor)

    def _sync_scroll(self):
        main_bar = self.main_window.view.verticalScrollBar()
        own_bar = self.verticalScrollBar()
        if main_bar.maximum() <= 0 or own_bar.maximum() <= 0:
            own_bar.setValue(0)
            return
        ratio = main_bar.value() / main_bar.maximum()
        own_bar.setValue(round(ratio * own_bar.maximum()))

    def resizeEvent(self, event):
        super().resizeEvent(event)
        self._update_scale()
        self._sync_scroll()

    def paintEvent(self, event):
        super().paintEvent(event)

        painter = QPainter(self.viewport())
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        self._draw_page_numbers(painter)

        rect = self._visible_area_rect()
        if rect is not None and rect.isValid():
            self._draw_viewport_box(painter, rect)

        painter.end()

    def _draw_page_numbers(self, painter: QPainter):
        scene_rect = self.scene().sceneRect()
        page_height = self.main_window.editor.base_height
        if page_height <= 0:
            return

        page_count = max(1, math.ceil(scene_rect.height() / page_height))
        viewport_bounds = self.viewport().rect()

        font = QFont()
        font.setPointSizeF(8)
        font.setBold(True)
        painter.setFont(font)

        for i in range(page_count):
            page_top = scene_rect.top() + i * page_height
            page_rect_scene = QRectF(scene_rect.left(), page_top, scene_rect.width(), page_height)
            mapped = self.mapFromScene(page_rect_scene).boundingRect()

            if not viewport_bounds.intersects(mapped):
                continue

            label = str(i + 1)
            metrics = painter.fontMetrics()
            text_width = metrics.horizontalAdvance(label)
            text_height = metrics.height()

            padding_x = 4
            padding_y = 2
            badge_width = text_width + padding_x * 2
            badge_height = text_height + padding_y * 2

            badge_x = mapped.right() - badge_width - 4
            badge_y = mapped.top() + 4
            badge_rect = QRectF(badge_x, badge_y, badge_width, badge_height)

            painter.setPen(Qt.PenStyle.NoPen)
            painter.setBrush(QColor(20, 20, 20, 220))
            painter.drawRoundedRect(badge_rect, 3, 3)

            painter.setPen(QColor(255, 255, 255, 255))
            painter.drawText(badge_rect, Qt.AlignmentFlag.AlignCenter, label)

    def _visible_area_rect(self) -> QRectF:
        main_view = self.main_window.view
        viewport_rect = main_view.viewport().rect()
        visible_scene_rect = main_view.mapToScene(viewport_rect).boundingRect()
        return self.mapFromScene(visible_scene_rect).boundingRect()

    def _draw_viewport_box(self, painter: QPainter, rect: QRectF):
        accent = QColor(90, 160, 255) if not self._hovering else QColor(120, 180, 255)

        color = QColor(accent.red(), accent.green(), accent.blue(), 100)
        painter.setBrush(color)

        pen = QPen(accent, 1.4)
        pen.setJoinStyle(Qt.PenJoinStyle.RoundJoin)
        painter.setPen(pen)

        painter.drawRoundedRect(rect, 3, 3)

    def _navigate_to(self, pos):
        scene_pos = self.mapToScene(pos)
        self.main_window.view.centerOn(scene_pos)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self._dragging = True
            self._navigate_to(event.pos())
        super().mousePressEvent(event)

    def mouseMoveEvent(self, event):
        if self._dragging and (event.buttons() & Qt.MouseButton.LeftButton):
            self._navigate_to(event.pos())
        super().mouseMoveEvent(event)

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self._dragging = False
        super().mouseReleaseEvent(event)

    def enterEvent(self, event):
        self._hovering = True
        self.viewport().update()
        super().enterEvent(event)

    def leaveEvent(self, event):
        self._hovering = False
        self.viewport().update()
        super().leaveEvent(event)

    def wheelEvent(self, event):
        self.main_window.view.wheelEvent(event)