current schema **cannot support this cleanly**. Right now you’ve tied financial state (`totalFeesAssigned`, `totalPaid`) directly to the **Student**, which is fundamentally wrong for anything involving class progression.

You’re trying to introduce **time-based academic context (class/division per year)** on top of a **flat student model**. That will break fast.

---

# 🔥 Core Problem (don’t ignore this)

You are mixing:

- **Identity layer** → Student
- **Academic lifecycle** → Class, Division, Year
- **Financial ledger** → Fees, Payments

These must be **separated**, or promotions + historical tracking will become a mess.

---

# ✅ Refined Architecture (Correct Way)

## 1. Introduce Academic Structure

### New Models

### **Class**

- id
- name (e.g., "Class 10")

### **Division**

- id
- name (e.g., "A", "B")
- classId → Class

👉 Division belongs to a Class

---

### **AcademicSession (IMPORTANT)**

You didn’t think about this — big mistake.

Without session/year, your system will corrupt data over time.

- id
- name (e.g., "2025-26")
- startDate
- endDate
- isActive

---

## 2. Replace Student Financial Fields (Critical Change)

❌ REMOVE from Student:

- totalFeesAssigned
- totalPaid

These do NOT belong here.

---

## 3. Introduce Student Enrollment (CORE ENTITY)

This is the **most important model you’re missing**.

### **StudentEnrollment**

Represents:

> A student in a specific class + division + academic session

Fields:

- id
- studentId
- classId
- divisionId
- academicSessionId
- totalFeesAssigned
- totalPaid
- status (ACTIVE, PROMOTED, DROPPED)
- createdAt

👉 This becomes your **true source of truth for fees**

---

## 4. Update Receipt Mapping

Currently:

- Receipt → Student

❌ Wrong.

✅ Change:

- Receipt → StudentEnrollment

Why?
Because payment must be tied to:

> specific class + session

---

## 5. Promotion Logic (Real-world correct flow)

When promoting:

### OLD:

Student → Class4 → overwritten to Class5 ❌

### NEW:

- Old enrollment stays intact
- New enrollment created

Example:

| Student | Class   | Session | Fees | Paid |
| ------- | ------- | ------- | ---- | ---- |
| A       | Class 4 | 2024-25 | 10k  | 8k   |
| A       | Class 5 | 2025-26 | 12k  | 0    |

👉 No mutation. Only **new row inserted**

---

## 6. Ledger Behavior (What you actually want)

When fetching:

### Student Fee Summary:

```
Class 4 (2024-25)
  Assigned: 10k
  Paid: 8k
  Remaining: 2k

Class 5 (2025-26)
  Assigned: 12k
  Paid: 3k
  Remaining: 9k
```

👉 This becomes trivial with StudentEnrollment

---

## 7. TransactionHistory Fix

Add:

- studentEnrollmentId

Because:

> A transaction must belong to a specific academic context

---

## 8. Expense → No change needed

Good separation already.

---

# 📄 Functional Requirements (FRD)

## Module: Class & Division Management

### Features:

- Create Class (e.g., Class 1–12)
- Create Divisions under Class (A, B, C)
- Assign capacity (optional future)

---

## Module: Academic Session

### Features:

- Create session (2025–26)
- Only one active session at a time
- Lock past sessions (read-only)

---

## Module: Student Enrollment

### Features:

- Assign student to:

  - Class
  - Division
  - Session
- Define fees per enrollment (NOT global)
- Track:

  - total assigned
  - total paid
  - remaining (computed)

---

## Module: Fee Management

### Features:

- Fees defined per enrollment
- Partial payments supported
- Overpayment validation
- Category support (tuition, transport, etc.)

---

## Module: Promotion

### Features:

- Promote student:

  - Select next class
  - Select division
  - Select next session
- System:

  - Creates new StudentEnrollment
  - Copies student reference
  - DOES NOT modify old data

---

## Module: Receipt Changes

### Changes:

- Receipt must reference:

  - studentEnrollmentId (mandatory)
- Remove direct dependency on Student

---

## Module: Reporting

### Student Ledger View:

- Group by enrollment
- Show:
  - Assigned
  - Paid
  - Remaining

---

# ⚠️ Critical Constraints (Don’t screw this up)

1. **NO updates on old enrollments**
2. **NO global student fee fields**
3. **ALL financial records must link to enrollment**
4. **Session must exist — don’t skip it**
5. **Promotion = insert, not update**

---

# 🧠 Reality Check (Your current design flaws)

Blunt truth:

- Your schema is **transactionally decent**, but **academically naive**
- You didn’t model **time/versioning**, which is essential
- You tried to shortcut with `Student.totalPaid` — that will destroy reporting accuracy

---

# 🚀 Minimal Schema Changes Summary

### ADD:

- Class
- Division
- AcademicSession
- StudentEnrollment

### MODIFY:

- Receipt → add studentEnrollmentId
- TransactionHistory → add studentEnrollmentId

### REMOVE:

- Student.totalFeesAssigned
- Student.totalPaid

---

# If you ignore this…

You’ll end up with:

- Broken reports
- Impossible promotions
- Data overwrites
- Manual fixes later (which always become hacks)
