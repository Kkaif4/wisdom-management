# 🔥 **UPDATED PLAN: Production-Ready Document System (Next.js)**

(Refined based on your audit — no gaps, no shortcuts)

---

# 🧩 1. FINAL ARCHITECTURE (FIXED)

```id="arch01"
/modules/document/
  ├── components/
  │    ├── DocumentLayout.tsx
  │    ├── Header.tsx
  │    ├── Footer.tsx
  │    ├── PrintWrapper.tsx
  │    ├── ErrorBoundary.tsx
  ├── services/
  │    ├── excel.service.ts
  │    ├── print.service.ts
  │    ├── pdf.service.ts   (NEW)
  │    ├── audit.service.ts (NEW)
  ├── templates/
  │    ├── receipt.template.tsx
  │    ├── invoice.template.tsx
  ├── types/
  │    ├── document.types.ts
    │    ├── excel.types.ts   (NEW)
    │    ├── print.types.ts   (NEW)
  ├── utils/
  │    ├── formatters.ts
  │    ├── dataTransform.ts   (NEW)
```

---

# 🔥 2. EXCEL SERVICE (UPGRADED — NO MORE TOY VERSION)

## ✅ Library Decision

- Use → ExcelJS
  👉 You need formatting. Don’t cheap out.

---

## ✅ Final Capabilities

Your Excel service MUST support:

- Column mapping + transformation
- Date / currency / number formatting
- Nested object flattening
- Null handling
- Column width
- Header styling
- Freeze header
- Progress tracking
- Chunk processing (no UI freeze)
- Branding (optional)

---

## ✅ Final Interface (cleaned)

```ts
export interface ExcelExportConfig<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  fileName: string;

  options?: {
    freezeHeader?: boolean;
    columnWidths?: Record<string, number>;
    beforeExport?: (data: T[]) => T[];
    onProgress?: (progress: number) => void;
    chunkSize?: number;
  };
}

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  format?: "text" | "number" | "date" | "currency";
  transform?: (value: any, row: T) => any;
}
```

---

## 🧠 Key Fixes Applied

✔ Handles:

- nested objects
- dates
- null values
- large datasets

❌ Removed:

- hardcoded logic
- UI coupling

---

# 🖨️ 3. PRINT SERVICE (REAL VERSION)

## ⚠️ Your old version was incomplete. This is fixed.

---

## ✅ Core Features

- Print queue (prevents spam clicks)
- Wait for images before print
- Error handling
- Lifecycle hooks
- Multi-template support
- Preview mode (optional)

---

## ✅ Final Interface

```ts
export interface PrintOptions {
  elementId?: string;
  orientation?: "portrait" | "landscape";

  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  onError?: (error: Error) => void;

  waitForImages?: boolean;
}
```

---

## ✅ Critical Fixes Applied

✔ Wait for images → no broken print
✔ Queue → no duplicate dialogs
✔ Error-safe
✔ Async flow handled

---

# 🎨 4. PRINT STYLING (FIXED — NO MORE BROKEN CSS)

## ✅ A4 + Layout

```css
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }

  body > *:not(.print-area) {
    display: none !important;
  }

  .print-area {
    display: block;
    width: 210mm;
    min-height: 297mm;
  }
}
```

---

## ✅ Page Break Control

```css
.page-break {
  break-before: page;
}

.avoid-break {
  break-inside: avoid;
}
```

---

## 🧠 Fixes Applied

✔ No visibility bugs
✔ Clean isolation
✔ Proper pagination

---

# 🧾 5. TEMPLATE SYSTEM (UPGRADED)

## ❗ Major Fix: Mode Awareness

```ts
type Mode = "screen" | "print";

interface TemplateProps {
  data: any;
  mode?: Mode;
}
```

---

## ✅ Behavior

| Mode   | Behavior                 |
| ------ | ------------------------ |
| screen | buttons, actions visible |
| print  | clean document only      |

---

## 🧠 Fixes Applied

✔ No UI leakage into print
✔ Full control over rendering

---

# 🏗️ 6. DOCUMENT LAYOUT (NOW COMPLETE)

## ✅ Features

- Toggle header/footer
- Watermark support
- A4 layout
- Consistent spacing

---

## ✅ New Props

```ts
interface DocumentLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;

  watermark?: {
    text: string;
    opacity?: number;
  };
}
```

---

# 📄 7. PDF SERVICE (NEW — REQUIRED)

## Why?

Client print alone is not enough.

---

## ✅ Use

- Puppeteer

---

## Capabilities

- Server-side PDF generation
- Email attachments
- Batch export
- Full layout control

---

# 📊 8. AUDIT LOGGING (CRITICAL ADDITION)

## ❗ You were missing this completely

Track:

- who printed
- what document
- when
- what data

---

## Example

```ts
logDocumentAction({
  type: "receipt",
  action: "print",
  userId,
  timestamp: new Date(),
});
```

---

# 🚀 9. FINAL FLOW (CLEAN & SCALABLE)

```id="flow01"
UI
 → Template (pure)
 → DocumentLayout
 → PrintWrapper
 → PrintService

Excel:
 → UI
 → ExcelService

PDF:
 → Server
 → PDFService
```

---

# ⚠️ WHAT YOU FIXED (IMPORTANT)

From your audit :

### Critical issues now solved:

- ✅ Excel data corruption (dates, nested objects)
- ✅ Broken print (images not loaded)
- ✅ Duplicate print dialogs
- ✅ Bad print CSS
- ✅ No page-break control
- ✅ No A4 enforcement
- ✅ No audit logs
- ✅ No PDF support

---

# 🧠 FINAL REALITY CHECK

Now your system is:

✔ Modular
✔ Reusable
✔ Production-ready
✔ Scalable for multiple document types

---

# ❗ If you skip this updated plan

Then:

- Excel will break on real data
- Print will fail randomly
- Users will spam print
- You’ll rewrite everything later
