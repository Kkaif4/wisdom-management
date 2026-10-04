"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Receipt as ReceiptIcon,
  Loader2,
  Banknote,
  CreditCard,
  Calendar as CalendarIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from "lucide-react";
import { showToast } from "@/components/shared/Toast";
import { StudentSearchSelect } from "./StudentSearchSelect";
import { DatePicker } from "@/components/ui/date-picker";

interface IncomeCategory {
  id: string;
  name: string;
  code: string;
  affectsTuition: boolean;
}

interface Enrollment {
  id: string;
  sessionName: string;
  className: string;
  divisionName: string;
  status: string;
  totalFeesAssigned: number;
  previousFees: number;
  discount: number;
  totalPaid: number;
  remaining: number;
  receipts?: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    category: string;
    status: string;
  }>;
}

interface Student {
  id: string;
  name: string;
  className?: string;
  totalFeesAssigned?: number | string;
  totalPaid?: number | string;
}

interface ReceiptEntryModalProps {
  onSuccess: (receipt: any) => void;
  onClose: () => void;
  initialStudentId?: string;
  initialEnrollmentId?: string;
  initialStudent?: {
    id: string;
    name: string;
    grNo?: string;
    className?: string;
  } | null;
}

export function ReceiptEntryModal({
  onSuccess,
  onClose,
  initialStudentId,
  initialEnrollmentId,
  initialStudent,
}: ReceiptEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    initialStudent || null,
  );
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(
    initialEnrollmentId || "",
  );
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [isPreviousFee, setIsPreviousFee] = useState(false);
  const [formData, setFormData] = useState({
    studentId: initialStudentId || "",
    amount: "",
    paymentMode: "CASH",
    incomeCategoryId: "",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const formRef = React.useRef<HTMLFormElement>(null);
  const prevFeeInputRef = React.useRef<HTMLInputElement>(null);

  // Filter out Previous Fee from general Income Purpose dropdown
  const visibleCategories = categories.filter(
    (c) => c.code !== "PREVIOUS_FEE" && c.name.toLowerCase() !== "previous fee",
  );

  const prevFeeCategory = categories.find(
    (c) => c.code === "PREVIOUS_FEE" || c.name.toLowerCase() === "previous fee",
  );

  // Fetch income categories from DB
  useEffect(() => {
    fetch("/api/income-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          const visible = data.filter(
            (c) => c.code !== "PREVIOUS_FEE" && c.name.toLowerCase() !== "previous fee",
          );
          // Default to first regular category
          if (visible.length > 0 && !formData.incomeCategoryId) {
            setFormData((prev) => ({ ...prev, incomeCategoryId: visible[0].id }));
          }
        }
      })
      .catch(() => showToast("Failed to load income categories", "error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Fetch enrollments when student changes
  useEffect(() => {
    if (!formData.studentId) {
      setEnrollments([]);
      setSelectedEnrollmentId("");
      setSelectedStudent(null);
      setIsPreviousFee(false);
      return;
    }
    setLoadingEnrollments(true);
    fetch(`/api/students/${formData.studentId}/statement`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.student) {
          setSelectedStudent(data.student);
        }
        if (data?.enrollments && Array.isArray(data.enrollments)) {
          const enrs: Enrollment[] = data.enrollments.map((e: any) => ({
            id: e.id,
            sessionName: e.sessionName,
            className: e.className,
            divisionName: e.divisionName || "",
            status: e.status,
            totalFeesAssigned: Number(e.totalFeesAssigned),
            previousFees: Number(e.previousFees || 0),
            discount: Number(e.discount || 0),
            totalPaid: Number(e.totalPaid),
            remaining: Number(e.remaining),
            receipts: e.receipts || [],
          }));
          setEnrollments(enrs);
          const active = enrs.find((e) => e.status === "ACTIVE");
          const targetEnrId =
            initialEnrollmentId && enrs.some((e) => e.id === initialEnrollmentId)
              ? initialEnrollmentId
              : active?.id || enrs[0]?.id || "";
          setSelectedEnrollmentId(targetEnrId);
        }
      })
      .catch(() => showToast("Failed to load enrollments", "error"))
      .finally(() => setLoadingEnrollments(false));
  }, [formData.studentId, initialEnrollmentId]);

  const selectedCategory = categories.find(
    (c) => c.id === formData.incomeCategoryId,
  );
  const selectedEnrollment = enrollments.find(
    (e) => e.id === selectedEnrollmentId,
  );

  const totalPreviousFees = selectedEnrollment?.previousFees || 0;
  const paidPreviousFees =
    selectedEnrollment?.receipts
      ?.filter(
        (r) =>
          r.status !== "CANCELLED" &&
          (r.category === "Previous Fee" ||
            r.category === "Previous Tuition Fee"),
      )
      .reduce((sum, r) => sum + Number(r.amount), 0) || 0;

  const pendingPreviousFees = Math.max(
    0,
    Math.min(
      totalPreviousFees - paidPreviousFees,
      selectedEnrollment?.remaining || 0,
    ),
  );

  const enteredAmount = parseFloat(formData.amount) || 0;
  const isPartial =
    isPreviousFee &&
    pendingPreviousFees > 0 &&
    enteredAmount > 0 &&
    enteredAmount < pendingPreviousFees;
  const isFullPayment =
    isPreviousFee &&
    pendingPreviousFees > 0 &&
    enteredAmount >= pendingPreviousFees;
  const remainingPrevFee = Math.max(0, pendingPreviousFees - enteredAmount);

  // Auto-reset isPreviousFee if pending previous fee becomes 0 (e.g. switching student/enrollment)
  useEffect(() => {
    if (pendingPreviousFees <= 0 && isPreviousFee) {
      setIsPreviousFee(false);
    }
  }, [pendingPreviousFees, isPreviousFee]);

  const activeCategory = isPreviousFee ? prevFeeCategory : selectedCategory;

  const pendingAmount = isPreviousFee
    ? pendingPreviousFees > 0
      ? pendingPreviousFees
      : (selectedEnrollment?.remaining ?? null)
    : selectedEnrollment
      ? selectedEnrollment.remaining
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      showToast("Please select a student", "error");
      return;
    }

    if (
      pendingAmount !== null &&
      (isPreviousFee || activeCategory?.affectsTuition) &&
      Number(formData.amount) > pendingAmount
    ) {
      showToast(
        `Amount cannot exceed pending ${isPreviousFee ? "previous " : ""}fees (₹${pendingAmount.toLocaleString("en-IN")})`,
        "error",
      );
      return;
    }

    const remarksText = formData.remarks.trim();
    const finalRemarks = remarksText
      ? remarksText
      : isPartial
        ? `Partial Previous Fee payment: ₹${enteredAmount.toLocaleString("en-IN")} of ₹${pendingPreviousFees.toLocaleString("en-IN")} (Remaining: ₹${remainingPrevFee.toLocaleString("en-IN")})`
        : undefined;

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          enrollmentId: selectedEnrollmentId || undefined,
          amount: formData.amount,
          paymentMode: formData.paymentMode,
          date: formData.date,
          remarks: finalRemarks,
          incomeCategoryId: isPreviousFee
            ? prevFeeCategory?.id || formData.incomeCategoryId
            : formData.incomeCategoryId,
          category: isPreviousFee
            ? "Previous Fee"
            : selectedCategory?.name || "Other",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create receipt");

      showToast("Receipt created successfully", "success");
      onSuccess(data);
      onClose();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[50] animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-3xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ReceiptIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  New Receipt / Income
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Record payment or fees
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Income Purpose */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Income Purpose
                </label>
                {isPreviousFee && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Previous Fee Selected
                  </span>
                )}
              </div>
              {isPreviousFee ? (
                <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      Previous Fee (Student Session Carry-Forward)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPreviousFee(false)}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Change to Regular Fee
                  </button>
                </div>
              ) : (
                <select
                  value={formData.incomeCategoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, incomeCategoryId: e.target.value })
                  }
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
                >
                  {visibleCategories.length === 0 ? (
                    <option value="">Loading categories...</option>
                  ) : (
                    visibleCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Student Search (Mandatory) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Select Student
              </label>
              <StudentSearchSelect
                value={formData.studentId}
                selectedStudent={selectedStudent}
                onChange={(id, student) => {
                  setFormData({ ...formData, studentId: id });
                  setIsPreviousFee(false);
                  if (student) setSelectedStudent(student);
                  else setSelectedStudent(null);
                }}
              />
            </div>

            {/* Enrollment Selection (Conditional) */}
            {enrollments.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Academic Session
                </label>
                <select
                  value={selectedEnrollmentId}
                  onChange={(e) => {
                    setSelectedEnrollmentId(e.target.value);
                    setIsPreviousFee(false);
                  }}
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
                >
                  {enrollments.map((enr) => (
                    <option key={enr.id} value={enr.id}>
                      {enr.sessionName} - {enr.className}
                      {enr.divisionName ? ` ${enr.divisionName}` : ""}
                      {enr.remaining > 0
                        ? ` · Due: ₹${enr.remaining.toLocaleString("en-IN")}`
                        : " · Cleared"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Previous Fee Session Area when Student is Selected */}
            {selectedStudent && selectedEnrollment && totalPreviousFees > 0 && (
              <>
                {/* Fully Cleared State: totalPreviousFees > 0 but pendingPreviousFees === 0 */}
                {pendingPreviousFees === 0 ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          Previous Fees Cleared
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          Carry forward of ₹{totalPreviousFees.toLocaleString("en-IN")} has been fully paid.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Pending Previous Fees > 0: Show Due & Action Button */
                  <div
                    className={`rounded-2xl border p-4 transition-all ${
                      isPreviousFee
                        ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30"
                        : "bg-amber-500/5 border-amber-500/20"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                            Previous Pending Fee
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300">
                            Carry Forward
                          </span>
                          {isPreviousFee && isPartial && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-xs">
                              Partial Mode ({pendingPreviousFees > 0 ? ((enteredAmount / pendingPreviousFees) * 100).toFixed(0) : 0}%)
                            </span>
                          )}
                          {isPreviousFee && isFullPayment && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                              Full Payment (100%)
                            </span>
                          )}
                          {isPreviousFee && enteredAmount === 0 && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              Enter Amount
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-mono font-black text-foreground">
                            ₹{pendingPreviousFees.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            due (assigned: ₹{totalPreviousFees.toLocaleString("en-IN")})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isPreviousFee ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setIsPreviousFee(true);
                                setFormData((prev) => ({
                                  ...prev,
                                  amount: String(pendingPreviousFees),
                                }));
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm bg-amber-600 text-white hover:bg-amber-700 active:scale-95 flex items-center gap-1"
                            >
                              Pay Full
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsPreviousFee(true);
                                setFormData((prev) => ({
                                  ...prev,
                                  amount: "",
                                }));
                                setTimeout(() => prevFeeInputRef.current?.focus(), 50);
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-amber-500/40 text-amber-800 dark:text-amber-300 bg-background/80 hover:bg-amber-500/10 active:scale-95 flex items-center gap-1.5"
                            >
                              <Edit3 className="h-3 w-3" />
                              Pay Partial
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsPreviousFee(false);
                              setFormData((prev) => ({
                                ...prev,
                                amount: "",
                              }));
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/15"
                          >
                            ✕ Cancel Previous Fee
                          </button>
                        )}
                      </div>
                    </div>

                    {isPreviousFee && (
                      <div className="mt-4 pt-3.5 border-t border-amber-500/25 space-y-3.5 animate-in fade-in-50 duration-200">
                        {/* Dynamic Manual Amount Input */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <span>Paying Amount (Manual / Dynamic)</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                · Type any custom amount
                              </span>
                            </label>
                            {formData.amount && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, amount: "" }));
                                  prevFeeInputRef.current?.focus();
                                }}
                                className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                              ₹
                            </span>
                            <input
                              ref={prevFeeInputRef}
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={pendingPreviousFees}
                              placeholder={`Enter custom amount (e.g. 500, 1200, ${pendingPreviousFees})`}
                              value={formData.amount}
                              onChange={(e) =>
                                setFormData({ ...formData, amount: e.target.value })
                              }
                              className="w-full bg-background border border-amber-500/40 focus:border-amber-500 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-muted-foreground/40 placeholder:font-sans placeholder:font-normal"
                            />
                          </div>
                        </div>

                        {/* Real-time Dynamic Feedback & Progress */}
                        {enteredAmount > 0 && (
                          <div className="space-y-2 rounded-xl bg-background/60 p-2.5 border border-amber-500/20">
                            {/* Progress bar */}
                            <div className="h-1.5 w-full bg-amber-500/20 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                  enteredAmount >= pendingPreviousFees ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, Math.max(0, (enteredAmount / pendingPreviousFees) * 100))}%`,
                                }}
                              />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div>
                                {isPartial ? (
                                  <span className="text-amber-800 dark:text-amber-300 font-medium">
                                    Partial payment: Paying{" "}
                                    <b className="font-mono font-bold text-foreground">
                                      ₹{enteredAmount.toLocaleString("en-IN")}
                                    </b>
                                    {" "}
                                    <span className="text-muted-foreground font-normal">
                                      ({((enteredAmount / pendingPreviousFees) * 100).toFixed(1)}% of pending fee)
                                    </span>
                                  </span>
                                ) : enteredAmount === pendingPreviousFees ? (
                                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Full clearance payment of ₹{pendingPreviousFees.toLocaleString("en-IN")}
                                  </span>
                                ) : enteredAmount > pendingPreviousFees ? (
                                  <span className="text-rose-500 font-semibold flex items-center gap-1">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Amount exceeds pending fee by ₹{(enteredAmount - pendingPreviousFees).toLocaleString("en-IN")}
                                  </span>
                                ) : null}
                              </div>

                              {isPartial && (
                                <span className="font-bold text-amber-950 dark:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md text-[11px]">
                                  Remaining After Payment: ₹{remainingPrevFee.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quick Presets (Optional Shortcuts) */}
                        <div className="pt-0.5 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>Quick Presets (or type custom amount above)</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  amount: String(pendingPreviousFees),
                                }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                enteredAmount === pendingPreviousFees
                                  ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                                  : "bg-background/90 hover:bg-amber-500/10 text-foreground border-border/60 hover:border-amber-500/40"
                              }`}
                            >
                              Full Due (₹{pendingPreviousFees.toLocaleString("en-IN")})
                            </button>

                            {[75, 50, 25].map((pct) => {
                              const val = Math.round((pendingPreviousFees * pct) / 100);
                              if (val <= 0 || val >= pendingPreviousFees) return null;
                              return (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      amount: String(val),
                                    }))
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                    enteredAmount === val
                                      ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                                      : "bg-background/90 hover:bg-amber-500/10 text-foreground border-border/60 hover:border-amber-500/40"
                                  }`}
                                >
                                  {pct}% (₹{val.toLocaleString("en-IN")})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                    <span>{isPreviousFee ? "Previous Fee Amount" : "Payment Amount"}</span>
                    {isPreviousFee && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        Dynamic / Synced
                      </span>
                    )}
                  </label>
                  {isPreviousFee && pendingPreviousFees > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      Due: ₹{pendingPreviousFees.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                    ₹
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={
                      isPreviousFee
                        ? pendingPreviousFees
                        : pendingAmount !== null && activeCategory?.affectsTuition && pendingAmount > 0
                          ? pendingAmount
                          : undefined
                    }
                    placeholder="0.00"
                    className={`w-full bg-muted/20 border rounded-2xl pl-8 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold ${
                      isPreviousFee
                        ? "border-amber-500/40 bg-amber-500/5 focus:ring-amber-500/20 focus:border-amber-500"
                        : "border-border/50"
                    }`}
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                {/* Visual feedback for partial payment */}
                {isPreviousFee && enteredAmount > 0 && (
                  <div className="flex items-center justify-between text-[11px] pt-1 px-1">
                    {isPartial ? (
                      <>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          Partial payment ({pendingPreviousFees > 0 ? ((enteredAmount / pendingPreviousFees) * 100).toFixed(1) : 0}%)
                        </span>
                        <span className="text-muted-foreground font-medium">
                          Remaining:{" "}
                          <b className="font-mono text-foreground font-bold">
                            ₹{remainingPrevFee.toLocaleString("en-IN")}
                          </b>
                        </span>
                      </>
                    ) : enteredAmount === pendingPreviousFees ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Full clearance payment
                      </span>
                    ) : enteredAmount > pendingPreviousFees ? (
                      <span className="text-rose-500 font-semibold">
                        Amount exceeds pending previous fees (₹{pendingPreviousFees.toLocaleString("en-IN")})
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Payment Mode
                </label>
                <div className="flex gap-2 p-1 bg-muted/30 border border-border/50 rounded-2xl">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, paymentMode: "CASH" })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                      formData.paymentMode === "CASH"
                        ? "bg-white text-emerald-600 shadow-sm border border-emerald-100"
                        : "text-muted-foreground hover:bg-white/50"
                    }`}
                  >
                    <Banknote className="h-4 w-4" />
                    CASH
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, paymentMode: "BANK" })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                      formData.paymentMode === "BANK"
                        ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                        : "text-muted-foreground hover:bg-white/50"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    BANK
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Collection Date
                </label>
                <DatePicker
                  value={formData.date}
                  onChange={(val) => setFormData({ ...formData, date: val })}
                  required
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Remarks / Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <input
                    placeholder="Optional notes..."
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-11 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-muted/30 border-t flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3.5 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-[2] py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Receipt"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
