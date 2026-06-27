# Kitab — كِتاب

<img width="960" height="504" alt="Screenshot 2026-06-26 195732" src="https://github.com/user-attachments/assets/4d5c1b19-eb18-463c-9ffa-0f27eddf9154" />

A lightweight word processor built with **PySide6 (Qt6)**.  
A simple alternative to LibreOffice Writer and Microsoft Word.  
Saves documents in `.ktb` format and exports to PDF.

## Features

| Feature | Description |
|---|---|
| Rich text editing | Bold, italic, underline, strikethrough, color, font family, font size, clear formatting |
| Text alignment | Left, center, right |
| Find & Replace | Case-sensitive search with replace-all |
| Tables | Insert tables with configurable rows, columns, and width |
| Images | Insert images into the document |
| File formats | `.ktb` (Kitab — HTML-based) save and open, `.txt` save only |
| PDF export | PDF |
| Print | Print via system dialog |
| Zoom | Ctrl+scroll or right-click+scroll to zoom in/out |
| Fullscreen | F11 toggle |
| Page view | Paged document layout with visible page breaks |
| Right-click menu | Undo, redo, cut, copy, paste, find, select all |

## Tech Stack

- **Python 3.14**
- **PySide6** (Qt6 bindings)
- **pyqttooltip** — tooltip library
- **qtpy** — Qt abstraction layer (used by pyqttooltip)

## Project Structure

```
Kitab/
├── main.py          # Entry point — creates QApplication + MainWindow
├── mainwindow.py    # MainWindow, Editor (QTextEdit), FindReplaceDialog
├── images.py        # Base64-encoded app icon
├── icon.ico         # Windows icon
├── requirements.txt # Python dependencies
├── LICENSE          # GPL v3
└── README.md        # This file
```

## Installation

### Arch Linux

```bash
sudo pacman -S pyside6 python-qtpy

# pip is currently broken on Arch (expat/Python mismatch).
# Install pyqttooltip manually until it's fixed:
python3 -c "
import urllib.request
url = 'https://files.pythonhosted.org/packages/51/45/627fbd7a6dddf3a55010607e7fb354755b9ae792991a8e66a588f6dfa2a0/pyqttooltip-1.0.0-py3-none-any.whl'
urllib.request.urlretrieve(url, '/tmp/pyqttooltip-1.0.0-py3-none-any.whl')
"
mkdir -p ~/.local/lib/python3.14/site-packages/
unzip -o /tmp/pyqttooltip-1.0.0-py3-none-any.whl -d ~/.local/lib/python3.14/site-packages/

# Run
python main.py
```

### Other platforms

```bash
pip install -r requirements.txt
python main.py
```

---

## كِتاب — معالج نصوص عربي

معالج نصوص خفيف مبني على **PySide6 (Qt6)**.  
بديل بسيط لـ LibreOffice Writer و Microsoft Word.  
يحفظ المستندات بصيغة `.ktb` ويُصدّرها إلى PDF.

### الميزات

| الميزة | الشرح |
|---|---|
| تحرير نصوص منسقة | عريض، مائل، تسطير، يتوسطه خط، لون، نوع خط، حجم خط، مسح التنسيق |
| محاذاة النص | يمين، وسط، يسار |
| بحث واستبدال | بحث مع خيار مطابقة الحالة الكبيرة، استبدال الكل |
| جداول | إدراج جداول بعدد صفوف وأعمدة وعرض قابل للتعديل |
| صور | إدراج صور داخل المستند |
| صيغ الملفات | `.ktb` (كتاب — مبنية على HTML) حفظ وفتح، `.txt` حفظ فقط |
| تصدير PDF | تصدير المستند إلى PDF |
| طباعة | طباعة عبر نافذة النظام |
| تكبير/تصغير | Ctrl + عجلة الفأرة أو الزر الأيمن + عجلة الفأرة |
| شاشة كاملة | F11 |
| عرض الصفحات | تخطيط صفحات مع فواصل مرئية بينها |
| قائمة يمين الفأرة | تراجع، إعادة، قص، نسخ، لصق، بحث، تحديد الكل |

### هيكل المشروع

```
Kitab/
├── main.py          # نقطة الدخول — تُنشئ QApplication و MainWindow
├── mainwindow.py    # النافذة الرئيسية، المحرر، نافذة البحث والاستبدال
├── images.py        # أيقونة التطبيق بصيغة Base64
├── icon.ico         # أيقونة ويندوز
├── requirements.txt # متطلبات Python
├── LICENSE          # رخصة GPL v3
└── README.md        # هذا الملف
```

### التنصيب

#### أرش لينكس

```bash
sudo pacman -S pyside6 python-qtpy

# pip معطل حالياً على أرش بسبب عدم تطابق expat/Python.
# ثبت pyqttooltip يدوياً إلى أن يُحلّ المشكلة:
python3 -c "
import urllib.request
url = 'https://files.pythonhosted.org/packages/51/45/627fbd7a6dddf3a55010607e7fb354755b9ae792991a8e66a588f6dfa2a0/pyqttooltip-1.0.0-py3-none-any.whl'
urllib.request.urlretrieve(url, '/tmp/pyqttooltip-1.0.0-py3-none-any.whl')
"
mkdir -p ~/.local/lib/python3.14/site-packages/
unzip -o /tmp/pyqttooltip-1.0.0-py3-none-any.whl -d ~/.local/lib/python3.14/site-packages/

# شغّل
python main.py
```

#### منصات أخرى

```bash
pip install -r requirements.txt
python main.py
```
