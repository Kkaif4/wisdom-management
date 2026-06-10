"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Printer,
  ChevronDown,
  ChevronRight,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  X,
  Edit,
  UserMinus,
  Briefcase,
  BookOpen,
  Percent,
} from "lucide-react";
import { ExcelService } from "@/modules/document/services/excel.service";
import { PrintService } from "@/modules/document/services/print.service";
import { PrintWrapper } from "@/modules/document/components/PrintWrapper";
import { StudentStatementTemplate } from "@/modules/document/templates/student-statement.template";
import { showToast } from "@/components/shared/Toast";
import { PermissionGate } from "@/components/auth/PermissionGate";

interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  paymentMode: string;
  category: string;
  status: string;
  remarks: string | null;
}

interface EnrollmentEntry {
  id: string;
  className: string;
  divisionName: string;
  sessionName: string;
  status: string;
  totalFeesAssigned: number;
  discount: number;
  totalPaid: number;
  remaining: number;
  remarks: string | null;
  receipts: Receipt[];
}

interface Student {
  id: string;
  grNo: string;
  name: string;
  rollNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  aadharNo: string | null;
  lastSchoolAttended: string | null;
  religion: string | null;
  caste: string | null;
  subCaste: string | null;
  nationality: string | null;
  fatherName: string | null;
  fatherQualification: string | null;
  fatherOccupation: string | null;
  motherName: string | null;
  motherQualification: string | null;
  motherOccupation: string | null;
  receivedApplicationOf: string | null;
  contactNumber: string | null;
  telNo: string | null;
  email: string | null;
  address: string | null;
  status: string;
}

interface StatementData {
  student: Student;
  enrollments: EnrollmentEntry[];
  totalOutstanding: number;
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export function StatementClient({ data }: { data: StatementData }) {
  const router = useRouter();
  const { student: initialStudent, enrollments, totalOutstanding } = data;

  const [student, setStudent] = useState<Student>(initialStudent);
  const [activeTab, setActiveTab] = useState<"profile" | "ledger">("ledger");
  const [isPrinting, setIsPrinting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(
    enrollments.find((e) => e.status === "ACTIVE")?.id ||
      enrollments[0]?.id ||
      null,
  );

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Discount form state
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentEntry | null>(null);
  const [discountForm, setDiscountForm] = useState({ discount: 0, remarks: "" });
  const [isSavingDiscount, setIsSavingDiscount] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Omit<Student, "id" | "status">>({
    name: student.name,
    grNo: student.grNo,
    rollNumber: student.rollNumber || "",
    dateOfBirth: student.dateOfBirth || "",
    gender: student.gender || "",
    placeOfBirth: student.placeOfBirth || "",
    aadharNo: student.aadharNo || "",
    lastSchoolAttended: student.lastSchoolAttended || "",
    religion: student.religion || "",
    caste: student.caste || "",
    subCaste: student.subCaste || "",
    nationality: student.nationality || "Indian",
    fatherName: student.fatherName || "",
    fatherQualification: student.fatherQualification || "",
    fatherOccupation: student.fatherOccupation || "",
    motherName: student.motherName || "",
    motherQualification: student.motherQualification || "",
    motherOccupation: student.motherOccupation || "",
    receivedApplicationOf: student.receivedApplicationOf || "",
    contactNumber: student.contactNumber || "",
    telNo: student.telNo || "",
    email: student.email || "",
    address: student.address || "",
  });

  // Withdraw form state
  const [withdrawForm, setWithdrawForm] = useState({
    withdrawalDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "PROMOTED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "WITHDRAWN":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "COMPLETED":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const handleExportExcel = async () => {
    try {
      type LedgerRow = {
        session: string;
        className: string;
        receiptDate: string;
        receiptNumber: string;
        paymentMode: string;
        amount: number;
        status: string;
      };

      const flatRows: LedgerRow[] = enrollments.flatMap((e) =>
        e.receipts.map((r) => ({
          session: e.sessionName,
          className: `${e.className} ${e.divisionName}`,
          receiptDate: r.date,
          receiptNumber: r.receiptNumber,
          paymentMode: r.paymentMode,
          amount: r.amount,
          status: r.status,
        })),
      );

      await ExcelService.export({
        data: flatRows,
        columns: [
          { key: "session", label: "Session", format: "text", width: 15 },
          { key: "className", label: "Class", format: "text", width: 15 },
          { key: "receiptDate", label: "Date", format: "date" },
          { key: "receiptNumber", label: "Receipt #", format: "text" },
          { key: "paymentMode", label: "Mode", format: "text" },
          { key: "amount", label: "Amount", format: "currency" },
          { key: "status", label: "Status", format: "text" },
        ],
        fileName: `Ledger_${student.grNo}`,
        options: {
          sheetName: "Ledger",
          headerStyle: { fillColor: "4F46E5", fontColor: "FFFFFF", bold: true },
        },
      });
      showToast("Ledger exported successfully", "success");
    } catch (err) {
      showToast("Failed to export ledger", "error");
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    await PrintService.print({
      elementId: "student-ledger-print",
      onAfterPrint: () => setIsPrinting(false),
      onError: () => setIsPrinting(false),
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.name.trim() || !editForm.grNo.trim()) {
      showToast("Name and G.R. No are required", "error");
      return;
    }

    if (editForm.aadharNo && !/^\d{12}$/.test(editForm.aadharNo.trim())) {
      showToast("Aadhar Number must be a 12-digit number", "error");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update student");
      }

      const updated = await res.json();
      setStudent(updated);
      setIsEditOpen(false);
      showToast("Student profile updated successfully", "success");
      router.refresh();
    } catch (error: any) {
      showToast(error.message || "Failed to update student details", "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!withdrawForm.reason.trim()) {
      showToast("Reason for withdrawal is required", "error");
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await fetch(`/api/students/${student.id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withdrawForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to withdraw student");
      }

      const updated = await res.json();
      setStudent(updated);
      setIsWithdrawOpen(false);
      showToast("Student withdrawn successfully", "success");
      router.refresh();
    } catch (error: any) {
      showToast(error.message || "Failed to withdraw student", "error");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEnrollment) return;

    if (discountForm.discount < 0) {
      showToast("Discount cannot be negative", "error");
      return;
    }

    if (discountForm.discount > selectedEnrollment.totalFeesAssigned) {
      showToast("Discount cannot exceed total assigned fees", "error");
      return;
    }

    setIsSavingDiscount(true);
    try {
      const res = await fetch(`/api/enrollments/${selectedEnrollment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discount: discountForm.discount,
          remarks: discountForm.remarks,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update discount");
      }

      showToast("Student discount updated successfully", "success");
      setIsDiscountOpen(false);
      router.refresh();
    } catch (error: any) {
      showToast(error.message || "Failed to update discount", "error");
    } finally {
      setIsSavingDiscount(false);
    }
  };

  const activeEnrollment = enrollments[0];

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in mb-10">
      <Link
        href="/dashboard/students"
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground inline-flex items-center gap-1"
      >
        ← Back to Students
      </Link>

      {/* Premium Profile Header Card */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/20">
              {student.name.charAt(0)}
            </div>
             <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  {student.name}
                </h1>
                {enrollments.some((e) => e.discount > 0) && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    <Percent className="h-3 w-3" />
                    Discounted
                  </span>
                )}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${statusColor(student.status)}`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <span className="font-semibold text-foreground/80">
                  {activeEnrollment
                    ? `${activeEnrollment.className} ${activeEnrollment.divisionName}`
                    : "Not Enrolled"}
                </span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="font-mono text-xs uppercase tracking-widest text-primary/80 font-bold">
                  GR No: {student.grNo}
                </span>
                {student.rollNumber && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-xs font-medium">
                      Roll No: {student.rollNumber}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/60 hover:border-border rounded-xl text-sm font-bold text-foreground/80 hover:bg-muted/30 transition-all active:scale-95 shadow-sm"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
              Edit Profile
            </button>
            {student.status === "ACTIVE" && (
              <button
                onClick={() => setIsWithdrawOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-500/20 transition-all active:scale-95"
              >
                <UserMinus className="h-4 w-4" />
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/60 gap-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === "profile"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview & Profile
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === "ledger"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Financial Ledger
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity & Demographics */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Personal & Academic Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Gender
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.gender || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Date of Birth
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Place of Birth
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.placeOfBirth || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Aadhar Number
                  </p>
                  <p className="text-sm font-semibold font-mono text-foreground/90 mt-0.5">
                    {student.aadharNo || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Nationality
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.nationality || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Religion
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.religion || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Caste & Sub-Caste
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.caste
                      ? `${student.caste}${student.subCaste ? ` (${student.subCaste})` : ""}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Last School Attended
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.lastSchoolAttended || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Parent & Guardian Info */}
            <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Parent & Guardian Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Father / Guardian Name
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.fatherName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Father Qualification & Occupation
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {[student.fatherQualification, student.fatherOccupation]
                      .filter(Boolean)
                      .join(" — ") || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Mother Name
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.motherName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Mother Qualification & Occupation
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {[student.motherQualification, student.motherOccupation]
                      .filter(Boolean)
                      .join(" — ") || "—"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Received Application of
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {student.receivedApplicationOf || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Mobile Number
                  </p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {student.contactNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Telephone Number
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {student.telNo || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {student.email || "—"}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    Residential Address
                  </p>
                  <p className="text-sm font-semibold text-foreground/95 mt-1 leading-relaxed whitespace-pre-line">
                    {student.address || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="space-y-6">
          {/* Outstanding Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl p-6 shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                Total Outstanding (All Years)
              </p>
              <p
                className={`text-3xl font-black tracking-tight ${totalOutstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}
              >
                {fmt(totalOutstanding)}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-bold text-foreground/70 hover:bg-muted/50 transition-all active:scale-95"
              >
                <Download className="h-4 w-4" />
                Spreadsheet
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
              >
                <Printer className="h-4 w-4" />
                Print Ledger
              </button>
            </div>
          </div>

          {/* Enrollment History */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              Enrollment History ({enrollments.length} sessions)
            </h2>

            {enrollments.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center text-muted-foreground/50 text-sm font-bold border border-border/50">
                No enrollments found
              </div>
            ) : (
              enrollments.map((e) => (
                <div
                  key={e.id}
                  className="glass rounded-2xl border border-border/50 overflow-hidden bg-white dark:bg-zinc-900"
                >
                  {/* Enrollment Header */}
                  <button
                    onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {expanded === e.id ? (
                        <ChevronDown className="h-4 w-4 text-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <p className="text-sm font-black text-foreground">
                          {e.sessionName} — {e.className} {e.divisionName}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColor(e.status)}`}
                      >
                        {e.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-right justify-between sm:justify-end">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">
                          Assigned
                        </p>
                        <p className="text-sm font-mono font-bold text-muted-foreground/80">
                          {fmt(e.totalFeesAssigned)}
                        </p>
                      </div>
                      {e.discount > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">
                            Discount
                          </p>
                          <p className="text-sm font-mono font-bold text-amber-600/85">
                            {fmt(e.discount)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">
                          Paid
                        </p>
                        <p className="text-sm font-mono font-bold text-emerald-600/80">
                          {fmt(e.totalPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">
                          Due
                        </p>
                        <p
                          className={`text-sm font-mono font-black ${e.remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}
                        >
                          {fmt(e.remaining)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Receipts Table & Actions */}
                  {expanded === e.id && (
                    <div>
                      <div className="border-t border-border/30 overflow-x-auto">
                        {e.receipts.length === 0 ? (
                          <div className="px-6 py-8 text-center text-muted-foreground/50 text-sm font-medium">
                            No payments in this enrollment period
                          </div>
                        ) : (
                          <table className="w-full text-left min-w-[600px]">
                            <thead>
                              <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 border-b border-border/30">
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Receipt #</th>
                                <th className="px-6 py-3">Purpose</th>
                                <th className="px-6 py-3">Mode</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                              {e.receipts.map((r) => (
                                <tr
                                  key={r.id}
                                  className="hover:bg-muted/20 transition-colors"
                                >
                                  <td className="px-6 py-3 text-xs text-muted-foreground">
                                    {new Date(r.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </td>
                                  <td className="px-6 py-3 text-sm font-mono font-medium text-foreground">
                                    {r.receiptNumber}
                                  </td>
                                  <td className="px-6 py-3 text-xs font-bold text-muted-foreground">
                                    {r.category}
                                  </td>
                                  <td className="px-6 py-3">
                                    <span
                                      className={`text-[10px] font-black px-2 py-1 rounded ${r.paymentMode === "CASH" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}
                                    >
                                      {r.paymentMode}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-right text-sm font-mono font-bold text-primary">
                                    {fmt(r.amount)}
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-1 rounded ${r.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
                                    >
                                      {r.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Action Bar for Discount / Remarks */}
                      <div className="px-6 py-4 border-t border-border/20 bg-muted/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                          {e.remarks ? (
                            <span>
                              <span className="font-bold text-foreground/85">Remarks: </span>
                              {e.remarks}
                            </span>
                          ) : (
                            <span>No remarks listed for this enrollment period.</span>
                          )}
                        </div>
                        <PermissionGate permission="APPLY_DISCOUNTS">
                          <button
                            onClick={() => {
                              setSelectedEnrollment(e);
                              setDiscountForm({
                                discount: e.discount,
                                remarks: e.remarks || "",
                              });
                              setIsDiscountOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 rounded-xl text-xs font-bold transition-all w-full sm:w-auto"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Manage Discount
                          </button>
                        </PermissionGate>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Edit className="h-5 w-5 text-primary" />
                Edit Student Details
              </h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Academic */}
                <div className="sm:col-span-3 pb-2 border-b border-border/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                    Academic Information
                  </h4>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    G.R. No *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.grNo}
                    onChange={(e) =>
                      setEditForm({ ...editForm, grNo: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={editForm.rollNumber || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, rollNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Personal / Demographics */}
                <div className="sm:col-span-3 pt-4 pb-2 border-b border-border/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                    Personal & Demographics
                  </h4>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={editForm.gender || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    value={editForm.placeOfBirth || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, placeOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={editForm.aadharNo || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, aadharNo: e.target.value })
                    }
                    placeholder="12-digit number"
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={editForm.nationality || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nationality: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Religion
                  </label>
                  <input
                    type="text"
                    value={editForm.religion || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, religion: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Caste
                  </label>
                  <input
                    type="text"
                    value={editForm.caste || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, caste: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Sub-Caste
                  </label>
                  <input
                    type="text"
                    value={editForm.subCaste || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subCaste: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Last School Attended
                  </label>
                  <input
                    type="text"
                    value={editForm.lastSchoolAttended || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        lastSchoolAttended: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Parents Info */}
                <div className="sm:col-span-3 pt-4 pb-2 border-b border-border/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                    Parent & Guardian Details
                  </h4>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={editForm.fatherName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fatherName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Father Qualification
                  </label>
                  <input
                    type="text"
                    value={editForm.fatherQualification || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        fatherQualification: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Father Occupation
                  </label>
                  <input
                    type="text"
                    value={editForm.fatherOccupation || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        fatherOccupation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Mother Name
                  </label>
                  <input
                    type="text"
                    value={editForm.motherName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, motherName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Mother Qualification
                  </label>
                  <input
                    type="text"
                    value={editForm.motherQualification || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        motherQualification: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Mother Occupation
                  </label>
                  <input
                    type="text"
                    value={editForm.motherOccupation || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        motherOccupation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Received Application of
                  </label>
                  <input
                    type="text"
                    value={editForm.receivedApplicationOf || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        receivedApplicationOf: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Contact */}
                <div className="sm:col-span-3 pt-4 pb-2 border-b border-border/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                    Contact Details
                  </h4>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editForm.contactNumber || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        contactNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Telephone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.telNo || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, telNo: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Residential Address
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.address || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-border/60 rounded-xl text-sm font-bold text-foreground/80 hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-rose-50/5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                Withdraw Student
              </h2>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                You are about to withdraw{" "}
                <span className="font-bold text-foreground">
                  {student.name}
                </span>
                . This will update their global status to{" "}
                <span className="font-bold text-rose-600">WITHDRAWN</span> and
                pause/cancel their active academic enrollment details.
              </p>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                  Withdrawal Date *
                </label>
                <input
                  type="date"
                  required
                  value={withdrawForm.withdrawalDate}
                  onChange={(e) =>
                    setWithdrawForm({
                      ...withdrawForm,
                      withdrawalDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                  Reason for Withdrawal *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter reason for leaving or pausing..."
                  value={withdrawForm.reason}
                  onChange={(e) =>
                    setWithdrawForm({ ...withdrawForm, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 border border-border/60 rounded-xl text-sm font-bold text-foreground/80 hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingWithdraw
                    ? "Withdrawing..."
                    : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISCOUNT MODAL */}
      {isDiscountOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-amber-50/5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-amber-600">
                <Edit className="h-5 w-5" />
                Manage Student Discount
              </h2>
              <button
                onClick={() => setIsDiscountOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDiscountSubmit} className="p-6 space-y-4">
              <div className="bg-muted/10 p-3.5 rounded-xl border border-border/30 space-y-1.5 text-xs text-muted-foreground">
                <div>
                  <span className="font-bold text-foreground/80">Student:</span> {student.name}
                </div>
                <div>
                  <span className="font-bold text-foreground/80">Class:</span> {selectedEnrollment.className} {selectedEnrollment.divisionName}
                </div>
                <div>
                  <span className="font-bold text-foreground/80">Academic Session:</span> {selectedEnrollment.sessionName}
                </div>
                <div className="pt-1.5 border-t border-border/20 flex justify-between items-center text-sm font-semibold">
                  <span className="text-foreground/80">Total Assigned Fees:</span>
                  <span className="font-mono text-foreground font-black">{fmt(selectedEnrollment.totalFeesAssigned)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                  Discount Amount (INR) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={selectedEnrollment.totalFeesAssigned}
                  value={discountForm.discount}
                  onChange={(e) =>
                    setDiscountForm({
                      ...discountForm,
                      discount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                  Discount Remarks / Reason
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter reason for applying discount (e.g. Merit Scholarship, Sibling discount, etc.)"
                  value={discountForm.remarks}
                  onChange={(e) =>
                    setDiscountForm({ ...discountForm, remarks: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsDiscountOpen(false)}
                  className="px-4 py-2 border border-border/60 rounded-xl text-sm font-bold text-foreground/80 hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDiscount}
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {isSavingDiscount ? "Saving..." : "Save Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Print Content */}
      {isPrinting && (
        <PrintWrapper id="student-ledger-print">
          <StudentStatementTemplate
            mode="print"
            data={{
              student: {
                name: student.name,
                grNo: student.grNo,
                class:
                  enrollments.find((e) => e.status === "ACTIVE")?.className ||
                  enrollments[0]?.className ||
                  "N/A",
              },
              period: {
                start:
                  enrollments[enrollments.length - 1]?.sessionName || "N/A",
                end: enrollments[0]?.sessionName || "N/A",
              },
              summary: {
                totalAssigned: enrollments.reduce(
                  (sum, e) => sum + e.totalFeesAssigned,
                  0,
                ),
                totalPaid: enrollments.reduce((sum, e) => sum + e.totalPaid, 0),
                outstanding: totalOutstanding,
              },
              enrollments: enrollments.map((e) => ({
                sessionName: e.sessionName,
                className: e.className,
                totalFees: e.totalFeesAssigned,
                discount: e.discount,
                paid: e.totalPaid,
                remaining: e.remaining,
                receipts: e.receipts.map((r) => ({
                  date: r.date,
                  receiptNumber: r.receiptNumber,
                  paymentMode: r.paymentMode,
                  amount: r.amount,
                  status: r.status,
                })),
              })),
              organizationName: "Wisdom Academy",
            }}
          />
        </PrintWrapper>
      )}
    </div>
  );
}
