#Copyright (C) <2026> <Abdulrahman>
#This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

from PySide6.QtGui import QShortcut, QKeySequence

def setup_page_shortcuts(main_window):
    # baka — binds Ctrl+1 through Ctrl+9 to quickly jump to specific pages
    for i in range(1, 10):
        shortcut = QShortcut(QKeySequence(f"Ctrl+{i}"), main_window)
        shortcut.activated.connect(lambda page=i: _go_to_page(main_window, page))

def _go_to_page(main_window, page):
    editor = main_window.editor
    if page > editor.page_count:
        return
    
    target_y = (page - 1) * editor.base_height + (editor.base_height / 2)
    main_window.view.centerOn(main_window.view.sceneRect().center().x(), target_y)