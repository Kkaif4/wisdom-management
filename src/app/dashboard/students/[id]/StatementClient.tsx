"use client";

import React from "react";
import Link from "next/link";
import { Download, Printer, ChevronDown, ChevronRight } from "lucide-react";
import { ExcelService } from "@/modules/document/services/excel.service";
import { PrintService } from "@/modules/document/services/print.service";
import { PrintWrapper } from "@/modules/document/components/PrintWrapper";
import { StudentStatementTemplate } from "@/modules/document/templates/student-statement.template";
import { showToast } from "@/components/shared/Toast";

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
  totalPaid: number;
  remaining: number;
  receipts: Receipt[];
}

interface StatementData {
  student: {
    id: string;
    admissionNumber: string;
    name: string;
    status: string;
  };
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
  const { student, enrollments, totalOutstanding } = data;
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(
    enrollments.find((e) => e.status === "ACTIVE")?.id ||
      enrollments[0]?.id ||
      null,
  );

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
        fileName: `Ledger_${student.admissionNumber}`,
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
    // PrintService handles internal delay for DOM update
    await PrintService.print({
      elementId: "student-ledger-print",
      onAfterPrint: () => setIsPrinting(false),
      onError: () => setIsPrinting(false),
    });
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in mb-10">
      <Link
        href="/dashboard/students"
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground inline-flex items-center gap-1"
      >
        ← Back to Students
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            Student Ledger
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(student.status)}`}
            >
              {student.status}
            </span>
          </h1>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-2 mt-1">
            {student.name}
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="font-mono text-xs uppercase tracking-widest text-primary/60">
              {student.admissionNumber}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border/50 rounded-xl text-sm font-bold text-foreground/70 hover:bg-muted/50 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" />
            Spreadsheet
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Outstanding Summary */}
      <div
        className={`rounded-2xl p-6 border ${totalOutstanding > 0 ? "border-rose-500/20 bg-rose-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
          Total Outstanding (All Years)
        </p>
        <p
          className={`text-3xl font-black tracking-tight ${totalOutstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}
        >
          {fmt(totalOutstanding)}
        </p>
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
              className="glass rounded-2xl border border-border/50 overflow-hidden"
            >
              {/* Enrollment Header */}
              <button
                onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expanded === e.id ? (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-black">
                      {e.sessionName} — {e.className} {e.divisionName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColor(e.status)}`}
                  >
                    {e.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">
                      Assigned
                    </p>
                    <p className="text-sm font-mono font-bold text-muted-foreground/60">
                      {fmt(e.totalFeesAssigned)}
                    </p>
                  </div>
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

              {/* Receipts Table */}
              {expanded === e.id && (
                <div className="border-t border-border/30">
                  {e.receipts.length === 0 ? (
                    <div className="px-6 py-8 text-center text-muted-foreground/50 text-sm font-medium">
                      No payments in this enrollment period
                    </div>
                  ) : (
                    <table className="w-full text-left">
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
                              {new Date(r.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-3 text-sm font-mono font-medium">
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
              )}
            </div>
          ))
        )}
      </div>

      {/* Hidden Print Content */}
      {isPrinting && (
        <PrintWrapper id="student-ledger-print">
          <StudentStatementTemplate
            mode="print"
            data={{
              student: {
                name: student.name,
                admissionNumber: student.admissionNumber,
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
