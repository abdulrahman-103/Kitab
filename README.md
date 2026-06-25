معالج نصوص مكتوب بمكتبة qt (pyside6).
بديل خفيف وبسيط لlibreoffice write وmicrosoft word.
يستطيع حفظ المستند بصيغة ktb (صيغة ملفات كتاب).

A word processor written in qt (pyside6).
A simple lightweight and simple alternative to libreoffice write and microsoft word.
It can save as .ktb format (kitab file format) and export to pdf.

bugs:
1. the visual gap between pages eats 5 pixels off of the bottom of the pages.
2. optimization of viewing system (instead of making a very long editor i need to take small chunks of the document and scroll through it to not crash)
3. fix pasting text (sometimes it pasted text looks weird)
 
features to add:
1. an insert menu that has (quran, images, tables and charts (matplotlib))
2. page layout settings menu (margins, line spacing, page size)
3. add a widget that allows user to change the fonts.
4. the find function on the right click context menu
5. paraghraph borders
6. lists
7. crtl p shortcut + print button (use qprinter instead of qpdfwriter
8. crtl f4 shortcut
9. add urls functionality
10. footnotes
11. Improve zooming system (anchor and unify resolutions)
12. paginated html export (export as html where the html file has pages and looks like a pdf and adapts to screen resolution)
13. تعريب




