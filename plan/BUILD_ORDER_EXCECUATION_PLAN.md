- **Phased implementation**
- **Clear dependencies**
- **What to build first vs later**
- **What NOT to overbuild**

---

# 🔥 **EXECUTION PLAN (ACTUAL BUILD ORDER)**

---

# 🧩 **PHASE 1 — CORE STABILITY (Must Fix)**

👉 If you skip anything here, your system will break in production.

---

## 1. Excel Service (FOUNDATION)

### Build in this exact order:

### Step 1 — Data Transformation Layer

```ts
normalizeData(data);
```

Must handle:

- nested objects → flatten
- null/undefined → ""
- dates → formatted string
- numbers → safe (no scientific notation)

---

### Step 2 — Column Config System

```ts
columns: [
  {
    key: "student.name",
    label: "Student Name",
    transform: (v) => v?.toUpperCase(),
  },
];
```

---

### Step 3 — Formatting Engine

Support:

- currency
- date
- number
- custom transform

---

### Step 4 — Excel Export (with ExcelJS)

- header styling
- column width
- freeze header

---

### Step 5 — Progress + Chunking

- required for large datasets
- prevent UI freeze

---

## ⚠️ If you skip transformation layer → Excel WILL break

---

# 🖨️ **PHASE 1 — PRINT SERVICE (CRITICAL)**

---

## Step 1 — Print Queue (DO THIS FIRST)

Without this:
👉 users will spam print → multiple dialogs → garbage UX

---

## Step 2 — Image Load Handling

Must:

```ts
await waitForImages(element);
```

---

## Step 3 — Safe Print Trigger

- validate element exists
- wrap in try/catch

---

## Step 4 — Fix CSS (NON-NEGOTIABLE)

- remove visibility hack
- use display isolation
- enforce A4

---

## Step 5 — Error Handling

Handle:

- missing element
- image load failure
- print cancel

---

# 🧾 **PHASE 1 — TEMPLATE SYSTEM**

---

## Add Mode System

```ts
mode: "screen" | "print";
```

Rules:

- print → no buttons, no actions
- screen → full UI

---

## ⚠️ If you skip this:

👉 your print will always include garbage UI

---

# 📊 **PHASE 1 — AUDIT LOGGING**

---

## Minimal Implementation

Track:

- document type
- action (print/export/pdf)
- timestamp
- userId

---

## DO NOT overengineer:

- no versioning yet
- no snapshot storage yet

---

# 🚀 **PHASE 2 — HIGH VALUE FEATURES**

👉 Only start AFTER Phase 1 is stable

---

## 📄 1. PDF Service

Use:

- Puppeteer

Supports:

- server-side generation
- email attachment
- batch export

---

## 📊 2. Excel Enhancements

Add:

- formulas
- branding (header colors, logo)
- advanced formatting

---

## 🧾 3. Watermark Support

In layout:

```ts
watermark: {
  text: "PAID";
}
```

---

## ⚡ 4. Progress Feedback

UI:

- loading bar
- % progress

---

# 🧩 **PHASE 3 — NICE TO HAVE (DON’T RUSH)**

---

## Multi-sheet Excel

Only if:

- reports require grouping

---

## Custom print headers/footers

Low priority (browser limitations anyway)

---

## Error Boundaries

Useful but not urgent

---

# ⚠️ WHAT YOU SHOULD NOT DO

Let me stop you before you screw this up:

### ❌ Don’t do all phases at once

You’ll build half-baked everything.

### ❌ Don’t overdesign Excel first

Most bugs come from data, not styling.

### ❌ Don’t jump to PDF early

Fix print first → then PDF.

---

# 🔥 PRIORITY STACK (SHORT VERSION)

```id="priority01"
1. Excel transformation + export
2. Print service (queue + image handling)
3. Template mode system
4. Audit logging

THEN:

5. PDF service
6. Excel enhancements
7. Watermark

LAST:

8. Multi-sheet
9. i18n
```

---

# 🧠 REALITY CHECK

If you follow this:

✔ Your system will scale
✔ Adding new document = trivial
✔ No rewrite later

If you don’t:

❌ Excel breaks on real data
❌ Print randomly fails
❌ Users lose trust
❌ You rewrite everything in 2 months
