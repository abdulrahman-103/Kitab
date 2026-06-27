# Contributing to Kitab

Thank you for considering a contribution! Here's how to get started.

## Reporting Issues

- **Bug report**: describe what you expected vs what happened, steps to reproduce, and your environment (OS, Python version).
- **Feature request**: explain the use case and why it fits Kitab's scope.

## Setting Up the Development Environment

1. Fork the repo and clone your fork.
2. Install dependencies (see README.md).
3. Make your changes in a feature branch:
   ```
   git checkout -b feature/export-md
   ```

## Coding Style

- Follow the existing code style (PEP 8-ish, no type hints enforced).
- Add comments for ambiguous logic using the `# what?` marker:
  ```python
  # what? — why is this divided by 25.4?
  ```
- Keep functions focused and under 50 lines where possible.
- Use descriptive variable names (not `x`, `y`, `tmp` unless trivial).

## Logging

For easier debugging, add logs at:
```
~/magnus/Kitab/logs/
```
Use `print()` for now (a logging system is planned).

## Commit Messages

```
  type    scope         description
   │       │                │
   ▼       ▼                ▼
 fix(toolbar): correct font size not updating after clear formatting
               │
               ▼
              colon then space
```

### Types

| Type | When to use | Examples |
|---|---|---|
| `feat` | New feature | `feat(toolbar): add heading dropdown` |
| `fix` | Bug fix | `fix(dialog): page size dialog shows empty` |
| `docs` | Documentation | `docs(readme): fix Arch install instructions` |
| `refactor` | Code changes that aren't a fix or feature — includes renaming variables for clarity, extracting functions, fixing indentation, removing dead code, reformatting, splitting a large file into modules, changing comment style, adding `# baka` markers. **Anything that changes how the code reads, not what it does.** | `refactor(save): extract duplicated write logic into helper` |
| `chore` | Maintenance | `chore(deps): update PySide6 version` |

## Pull Request Process

1. Create a feature branch from `main`:
   ```
   git checkout -b feature/export-md
   ```
2. Push your branch to your fork.
3. Open a PR against `abdulrahman-103/Kitab`.
4. Describe what your change does and why.
5. Reference any related issues (e.g. `Closes #12`).
6. Wait for review — address feedback if any.

### Branch naming examples

| Branch name | Purpose |
|---|---|
| `feature/export-md` | New feature: markdown export |
| `fix/zoom-shortcuts` | Bug fix: zoom keyboard shortcuts |
| `fix/page-size-dialog` | Bug fix: empty page size dialog |
| `docs/contributing-guide` | Documentation: CONTRIBUTING.md |
| `refactor/split-mainwindow` | Code restructure: split into modules |
| `chore/update-deps` | Maintenance: update dependencies |

## Code of Conduct

Be respectful and constructive. Kitab is a learning project — everyone is welcome.

---

## المساهمة في كتاب

شكراً لاهتمامك بالمساهمة! إليك كيفية البدء.

### الإبلاغ عن المشاكل

- **بلاغ خطأ**: صف ما توقعت حدوثه مقابل ما حدث فعلاً، خطوات إعادة الإنتاج، وبيئة عملك (نظام التشغيل، إصدار Python).
- **طلب ميزة**: اشرح حالة الاستخدام ولماذا تناسب نطاق كِتاب.

### تهيئة بيئة التطوير

1. انسخ المستودع (fork) واستنسخ نسختك محلياً.
2. ثبّت المتطلبات (انظر README.md).
3. اعمل في فرع مستقل:
   ```
   git checkout -b feature/export-md
   ```

### أسلوب الكتابة

- اتبع أسلوب الكود الموجود (PEP 8 تقريباً، بدون فرض تلميحات الأنواع).
- أضف تعليقات للكود الغامض باستخدام `# baka`:
  ```python
  # baka — لماذا نقسم على 25.4؟
  ```
- اجعل الدوال محدودة وتحت 50 سطراً قدر الإمكان.
- استخدم أسماء متغيرات وصفية.

### سجل التتبع

لتسهيل التصحيح، أضف السجلات في:
```
~/magnus/Kitab/logs/
```
استخدم `print()` حالياً (نظام تسجيل مُخطط له).

### رسائل الالتزام (Commit Messages)

```
  type    scope         description
   │       │                │
   ▼       ▼                ▼
 fix(toolbar): correct font size not updating after clear formatting
               │
               ▼
              colon then space
```

### الأنواع

| النوع | متى يُستخدم | أمثلة |
|---|---|---|
| `feat` | ميزة جديدة | `feat(toolbar): add heading dropdown` |
| `fix` | إصلاح خطأ | `fix(dialog): page size dialog shows empty` |
| `docs` | توثيق | `docs(readme): fix Arch install instructions` |
| `refactor` | تغييرات كود ليست إصلاحاً ولا ميزة — يشمل إعادة تسمية متغيرات للوضوح، استخراج دوال، إصلاح المسافات البادئة، إزالة كود ميت، إعادة تنسيق، تقسيم ملف كبير إلى وحدات، تغيير أسلوب التعليقات، إضافة `# baka`. **أي شيء يغير كيف يُقرأ الكود، لا ماذا يفعل.** | `refactor(save): extract duplicated write logic into helper` |
| `chore` | صيانة | `chore(deps): update PySide6 version` |

### عملية طلب السحب (Pull Request)

1. أنشئ فرعاً من `main`:
   ```
   git checkout -b feature/export-md
   ```
2. ادفع فرعك إلى نسختك (fork).
3. افتح PR ضد `abdulrahman-103/Kitab`.
4. صف ما يفعله تغييرك ولماذا.
5. أشر إلى أي مشكلة ذات صلة (مثلاً `Closes #12`).
6. انتظر المراجعة — تعامل مع أي ملاحظات.

### أمثلة أسماء الفروع

| اسم الفرع | الغرض |
|---|---|
| `feature/export-md` | ميزة جديدة: تصدير ماركداون |
| `fix/zoom-shortcuts` | إصلاح خطأ: اختصارات التكبير |
| `fix/page-size-dialog` | إصلاح خطأ: نافذة حجم الصفحة الفارغة |
| `docs/contributing-guide` | توثيق: دليل المساهمة |
| `refactor/split-mainwindow` | إعادة هيكلة: تقسيم إلى وحدات |
| `chore/update-deps` | صيانة: تحديث التبعيات |

### مدونة السلوك

كن محترماً وبناءً. كِتاب مشروع تعليمي — الجميع مرحب به.
