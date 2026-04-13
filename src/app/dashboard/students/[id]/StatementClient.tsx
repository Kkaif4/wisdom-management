"use client";

import React from "react";
import Link from "next/link";
import { Download, Printer, ChevronDown, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import { showToast } from "@/components/shared/Toast";

interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  paymentMode: string;
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

  const handleExportExcel = () => {
    try {
      const rows: any[][] = [
        ["Multi-Year Student Ledger"],
        ["Student", student.name],
        ["Admission No", student.admissionNumber],
        ["Generated", new Date().toLocaleString()],
        [],
      ];

      for (const e of enrollments) {
        rows.push([
          `${e.sessionName} — ${e.className} ${e.divisionName} (${e.status})`,
        ]);
        rows.push([
          "Assigned",
          e.totalFeesAssigned,
          "Paid",
          e.totalPaid,
          "Remaining",
          e.remaining,
        ]);
        rows.push(["Date", "Receipt #", "Mode", "Amount", "Status"]);
        for (const r of e.receipts) {
          rows.push([
            new Date(r.date).toLocaleDateString(),
            r.receiptNumber,
            r.paymentMode,
            r.amount,
            r.status,
          ]);
        }
        rows.push([]);
      }

      rows.push(["Total Outstanding", totalOutstanding]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ledger");
      XLSX.writeFile(wb, `ledger_${student.name.replace(/\s+/g, "_")}.xlsx`);
      showToast("Ledger exported to Excel", "success");
    } catch {
      showToast("Failed to export Excel", "error");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in mb-10">
      <Link
        href="/dashboard/students"
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to Students
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {student.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {student.admissionNumber} ·{" "}
            <span
              className={statusColor(student.status)
                .split(" ")
                .slice(1)
                .join(" ")}
            >
              {student.status}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="p-2.5 rounded-xl bg-muted border border-border/50 hover:bg-muted/80 transition-all active:scale-95 flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4"
          >
            <Download className="h-4 w-4" /> Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest transition-all hover:bg-muted/80 active:scale-95 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      {/* Outstanding Summary */}
      <div
        className={`rounded-2xl p-5 border ${totalOutstanding > 0 ? "border-rose-500/20 bg-rose-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
          Total Outstanding (All Years)
        </p>
        <p
          className={`text-2xl font-black tracking-tight ${totalOutstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}
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

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
            font-size: 10pt;
            color: black !important;
          }
          a,
          button,
          .tracking-widest {
            display: none !important;
          }
          .rounded-2xl,
          .glass {
            border-radius: 4px !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
