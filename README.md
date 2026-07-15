# Kitab — كتاب

<img width="960" height="504" alt="Screenshot 2026-06-26 195732" src="https://github.com/user-attachments/assets/4d5c1b19-eb18-463c-9ffa-0f27eddf9154" />

## (النص العربي في الاسفل)

A lightweight word processor built with **PySide6 (Qt6)**.  
A simple alternative to LibreOffice Writer and Microsoft Word.  
Saves documents in `.ktb` format and exports to PDF.

## Features

| Feature | Description |
|---|---|
| Rich text editing | Bold, italic, underline, strikethrough, color, font family, font size, clear formatting |
| Text alignment | Left, center, right |
| Find & Replace | Case-sensitive search with "replace" and "replace all" |
| Tables | Insert tables with configurable rows, columns, and width |
| Images | Insert images into the document |
| Save file formats | `.ktb` (Kitab file format — HTML-based), `.txt` |
| Export formats | PDF |
| Print | Print via system dialog |
| Zoom | Ctrl+scroll or right-click+scroll to zoom in/out |
| Fullscreen | F11 to toggle fullscreen |
| Page system | whenever a page fills up a new page gets created |
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
├── images.py        # Base64-encoded app icon (imported by mainwindow.py)
├── icon.ico         # Windows icon
├── requirements.txt # Python dependencies
├── LICENSE          # GPLv3
└── README.md        # This file
```

## Installation

### Windows

Install the `.exe` from the releases section. 

WINDOWS DEFENDER WILL BE TRIGGERED BECAUSE THE APP USES PYTHON WHICH IS A LANGUAGE INFAMOUS FOR THE PRODUCTION OF VIRUSES. THE APPLICATION IS TOTALLY SAFE AND OPEN SOURCE.

### Debian/Ubuntu Linux

```bash
sudo apt install python3-pyside6 git python3-pip
pip install -y pyqttooltip
git clone https://github.com/abdulrahman-103/Kitab
cd Kitab
python main.py
```

### Arch Linux

```bash
sudo pacman -Syu git pyside6 python-pip
pip install -y pyqttooltip
git clone https://github.com/abdulrahman-103/Kitab
cd Kitab
python main.py
```

###  Fedora Linux

```bash
sudo dnf install -y git python3-pyside6 python3-pip
pip install -y pyqttooltip
git clone https://github.com/abdulrahman-103/Kitab
cd Kitab
python main.py
```

### Other platforms (no theming)

```bash
pip install kitab-writer
kitab
```

---

## كتاب — معالج نصوص عربي

معالج نصوص خفيف مبني على **PySide6 (Qt6)**.  
بديل بسيط لـ LibreOffice Writer و Microsoft Word.  
يحفظ المستندات بصيغة `.ktb` ويُصدّرها إلى PDF.

### الميزات

| الشرح | الميزة |
|---|---|
| عريض، مائل، تحته خط، يتوسطه خط، لون، نوع الخط، حجم الخط، مسح التنسيق | تحرير نصوص منسقة |
| يمين، وسط، يسار | محاذاة النص |
| بحث مع خيار مطابقة الحروف الكابتل، استبدال الكل | بحث واستبدال |
| إدراج جداول بعدد صفوف وأعمدة وعرض قابل للتعديل | جداول |
| إدراج صور داخل المستند | صور |
| .ktb (كتاب — مبنية على HTML)، .txt | صيغ ملفات الحفظ |
| PDF | صيغ التصدير |
| طباعة عبر نافذة النظام | طباعة |
| Ctrl + عجلة الفأرة أو الزر الأيمن + عجلة الفأرة | تكبير/تصغير |
| F11 | ملء الشاشة |
| كلما امتلأت الصفحة تنشأ صفحة جديدة | نظام الصفحات |
| تراجع، إعادة، قص، نسخ، لصق، بحث، تحديد الكل | قائمة زر الفأرة الأيمن |
### هيكل المشروع

```
Kitab/
├── main.py          # نقطة الدخول — يُنشئ QApplication و MainWindow
├── mainwindow.py    # النافذة الرئيسية، المحرر، نافذة البحث والاستبدال
├── images.py        # أيقونة التطبيق بصيغة Base64
├── icon.ico         # أيقونة ويندوز
├── requirements.txt # متطلبات Python
├── LICENSE          # رخصة GPL v3
└── README.md        # هذا الملف
```

### التنصيب

#### ‏Windows

نزل ملف ال.exe من خانة releases.

ستظهر نافذة windows defender لان التطبيق مبني بلغة بايثون سيئة السمعة بصناعة الفيروسات. التطبيق امن تماما ومفتوح المصدر وليس بفيروس تجاهل النافذة.


### Debian/Ubuntu Linux

```bash
sudo apt install python3-pyside6 git python3-pip
pip install -y pyqttooltip
git clone https://github.com/abdulrahman-103/Kitab
cd Kitab
python main.py
```

### Arch Linux

```bash
sudo pacman -Syu git pyside6 python-pip
pip install -y pyqttooltip
git clone https://github.com/abdulrahman-103/Kitab
cd Kitab
python main.py
```

###  Fedora Linux

```bash
sudo dnf install -y git python3-pyside6 python3-pip
pip install -y pyqttooltip
git clone https://github.com/abdulrahman-103/Kitab
cd Kitab
python main.py
```


#### المنصات الأخرى

```bash
pip install kitab-writer
kitab
```
