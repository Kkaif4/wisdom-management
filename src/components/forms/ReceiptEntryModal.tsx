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
} from "lucide-react";
import { showToast } from "@/components/shared/Toast";
import { StudentSearchSelect } from "./StudentSearchSelect";

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
  totalPaid: number;
  remaining: number;
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
}

export function ReceiptEntryModal({
  onSuccess,
  onClose,
}: ReceiptEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    paymentMode: "CASH",
    incomeCategoryId: "",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  // Fetch income categories from DB
  useEffect(() => {
    fetch("/api/income-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          // Default to first category
          if (data.length > 0 && !formData.incomeCategoryId) {
            setFormData((prev) => ({ ...prev, incomeCategoryId: data[0].id }));
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
      return;
    }
    setLoadingEnrollments(true);
    fetch(`/api/students/${formData.studentId}/statement`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.enrollments && Array.isArray(data.enrollments)) {
          const enrs: Enrollment[] = data.enrollments.map((e: any) => ({
            id: e.id,
            sessionName: e.sessionName,
            className: e.className,
            divisionName: e.divisionName || "",
            status: e.status,
            totalFeesAssigned: Number(e.totalFeesAssigned),
            totalPaid: Number(e.totalPaid),
            remaining: Number(e.remaining),
          }));
          setEnrollments(enrs);
          const active = enrs.find((e) => e.status === "ACTIVE");
          setSelectedEnrollmentId(active?.id || enrs[0]?.id || "");
        }
      })
      .catch(() => showToast("Failed to load enrollments", "error"))
      .finally(() => setLoadingEnrollments(false));
  }, [formData.studentId]);

  const selectedCategory = categories.find(
    (c) => c.id === formData.incomeCategoryId,
  );
  const selectedEnrollment = enrollments.find(
    (e) => e.id === selectedEnrollmentId,
  );
  const pendingAmount = selectedEnrollment
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
      selectedCategory?.affectsTuition &&
      Number(formData.amount) > pendingAmount
    ) {
      showToast(
        `Amount cannot exceed pending fees (₹${pendingAmount.toLocaleString()})`,
        "error",
      );
      return;
    }

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
          remarks: formData.remarks,
          incomeCategoryId: formData.incomeCategoryId,
          category: selectedCategory?.name || "Other",
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
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Income Purpose
              </label>
              <select
                value={formData.incomeCategoryId}
                onChange={(e) =>
                  setFormData({ ...formData, incomeCategoryId: e.target.value })
                }
                className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
              >
                {categories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Student Search (Mandatory) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Select Student
              </label>
              <StudentSearchSelect
                value={formData.studentId}
                onChange={(id, student) => {
                  setFormData({ ...formData, studentId: id });
                  if (student) setSelectedStudent(student);
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
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Payment Amount
                  </label>
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
                      pendingAmount !== null && selectedCategory?.affectsTuition
                        ? pendingAmount > 0
                          ? pendingAmount
                          : undefined
                        : undefined
                    }
                    placeholder="0.00"
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-8 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
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
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Collection Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <input
                    required
                    type="date"
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-11 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
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
