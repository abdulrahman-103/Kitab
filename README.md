<img width="960" height="504" alt="Screenshot 2026-06-25 213709" src="https://github.com/user-attachments/assets/260e02eb-bb3a-4052-a75c-ac4864a00b6c" />


معالج نصوص مكتوب بمكتبة qt (pyside6).
بديل خفيف وبسيط لlibreoffice write وmicrosoft word.
يستطيع حفظ المستند بصيغة ktb (صيغة ملفات كتاب) وتصدير ملفات الpdf.
الواجهة الآن شريط تبويبات (Home / Insert / Layout) بثيم حديث بدل التولبار القديم.

A word processor written in qt (pyside6).
A simple lightweight and simple alternative to libreoffice write and microsoft word.
It can save as .ktb format (kitab file format) and export to pdf.
the toolbar got replaced with a tabbed ribbon (home / insert / layout) and a cleaner modern theme.

what it can do now:
- font family + size, bold/italic/underline/strikethrough, text color and highlight
- left/center/right/justify, bulleted and numbered lists, indent, line spacing
- find and replace (ctrl+f, also on the right click menu)
- print (ctrl+p, uses qprinter)
- insert images and tables
- page size (a4/letter/a5/legal) and margins
- clear formatting

install:
```
pip install -r requirements.txt
python main.py
```
no longer pulls the full pyside6 build (the unused qtwebengine/chromium part), so the install is a lot smaller now.

bugs:
1. the visual gap between pages eats 5 pixels off of the bottom of the pages.
2. optimization of viewing system (instead of making a very long editor i need to take small chunks of the document and scroll through it to not crash)

features to add:
1. an insert menu that has (quran, charts (matplotlib))
2. paraghraph borders
3. crtl f4 shortcut
4. add urls functionality
5. footnotes
6. Improve zooming system (anchor and unify resolutions)
7. paginated html export (export as html where the html file has pages and looks like a pdf and adapts to screen resolution)
8. تعريب
