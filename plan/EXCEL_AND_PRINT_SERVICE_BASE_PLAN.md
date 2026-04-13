Here’s the **clean, no-fluff report** you actually need:

---

# 📊 **Document System Report (Next.js)**

## 🎯 Goal

Build a **reusable system** for:

- Printing documents (receipts, invoices)
- Exporting Excel reports
- Supporting multiple document types with shared layout

---

# 🧩 1. EXCEL EXPORT

## ✅ Recommended Library

- ExcelJS → best balance (formatting + flexibility)

## 🟡 Alternative

- SheetJS → faster, but limited styling

---

## ⚙️ Approach

- Create **central service** (`excel.service.ts`)
- Accept:
  - data (array)
  - column config (key + label)

- Transform → generate workbook → download

### Flow

```
UI → Service → Excel File
```

---

## 🧠 Rule

- No UI logic in service
- No document-specific logic
- Fully reusable across modules

---

# 🖨️ 2. PRINTING SYSTEM

## ✅ Recommended

- Native `window.print()` (no library)

## 🟡 Optional

- react-to-print (only if needed)

---

## ⚙️ Approach

### Structure

```
Template → Layout → Print Wrapper → Print Trigger
```

### Key Concepts

- Use `.print-area` to isolate content
- Use `@media print` CSS
- Hide everything else

---

## 🧠 Rules

- No print logic inside templates
- Layout handles header/footer
- Templates = pure UI

---

# 🧾 3. DOCUMENT SYSTEM

## ⚙️ Structure

```
/modules/document/
  ├── services/
  ├── components/
  ├── templates/
```

---

## Components

### 1. Layout

- Controls:
  - Header (optional)
  - Footer (optional)
  - Spacing, A4 format

### 2. Templates

- Receipt / Invoice / Bill
- Pure rendering only

### 3. Services

- Excel service
- Print service

---

## 🧠 Core Principle

> Services = generic
> Templates = specific
> Layout = reusable

---

# 🔁 4. REUSABILITY STRATEGY

## How it scales

- New document = new template only
- No change in services
- Layout reused everywhere

---

# ⚠️ ANTI-PATTERNS (DON’T DO THIS)

- Mixing DB calls in templates
- Calling `window.print()` inside UI
- Hardcoding Excel logic per document
- Copy-pasting layouts

---

# 🚀 FINAL STACK

| Concern               | Solution                |
| --------------------- | ----------------------- |
| Excel Export          | ExcelJS                 |
| Printing              | Native browser print    |
| Optional Print Helper | react-to-print          |
| Architecture          | Modular document system |

---

# 🧠 Bottom Line

If you:

- Separate **services, templates, layout**
- Keep logic out of UI
- Keep services generic

Then:
✔ Adding new receipts = trivial
✔ System stays clean
✔ No refactor hell later
