"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Printer,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  Loader2,
  FileText,
  ArrowRight,
} from "lucide-react";
import { ExcelService } from "@/modules/document/services/excel.service";
import { showToast } from "@/components/shared/Toast";
import { DatePicker } from "@/components/ui/date-picker";
import { ReportFilters } from "@/components/dashboard/reports/ReportFilters";

// --- Types ---
type ReportData = {
  summary: {
    totalFeesCollected: number;
    totalExpenses: number;
    netCashFlow: number;
    outstandingDues: number;
  };
  transactions: {
    id: string;
    date: string;
    type: "FEE_COLLECTION" | "EXPENSE";
    reference: string;
    studentName: string | null;
    description: string;
    debit: number | null;
    credit: number | null;
  }[];
  expenseBreakdown: {
    category: string;
    totalAmount: number;
    count: number;
  }[];
  studentSummary: {
    name: string;
    class: string;
    totalFeesAssigned: number;
    totalPaid: number;
    remaining: number;
  }[];
};

export function ReportsClient() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fmt = (num: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  // Helper to fetch data
  const fetchReport = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/reports/financial", window.location.origin);
      if (start) url.searchParams.set("startDate", start);
      if (end) url.searchParams.set("endDate", end);

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to load financial report");
      }
      const json = await res.json();
      setData(json);
      setStartDate(start);
      setEndDate(end);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateApply = () => {
    // This is now handled by ReportFilters but kept as a placeholder if needed
  };

  const handleExportExcel = async () => {
    if (!data) return;
    try {
      // Transactions Sheet (primary export)
      type TxRow = {
        date: string;
        type: string;
        reference: string;
        studentName: string;
        description: string;
        debit: number;
        credit: number;
      };
      const txRows: TxRow[] = data.transactions.map((t) => ({
        date: t.date,
        type: t.type.replace("_", " "),
        reference: t.reference,
        studentName: t.studentName ?? "",
        description: t.description,
        debit: t.debit ?? 0,
        credit: t.credit ?? 0,
      }));

      await ExcelService.export({
        data: txRows,
        columns: [
          { key: "date", label: "Date", format: "date" },
          { key: "type", label: "Type", format: "text" },
          { key: "reference", label: "Reference", format: "text" },
          { key: "studentName", label: "Student Name", format: "text" },
          {
            key: "description",
            label: "Description",
            format: "text",
            width: 40,
          },
          { key: "debit", label: "Debit (Out)", format: "currency" },
          { key: "credit", label: "Credit (In)", format: "currency" },
        ],
        fileName: `financial_report_${startDate}_to_${endDate}`,
        options: {
          sheetName: "Transactions",
          headerStyle: { fillColor: "4F46E5", fontColor: "FFFFFF", bold: true },
        },
      });

      showToast("Excel report generated successfully", "success");
    } catch (err) {
      showToast("Failed to export Excel report", "error");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            Financial Reports
          </h1>
          <p className="text-xs md:text-sm font-medium text-muted-foreground mt-1">
            View financial summaries and transaction details for a selected time
            period.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-print no-scrollbar border-b border-border/20 lg:border-none">
          <button
            onClick={handleExportExcel}
            disabled={!data || loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted/30 hover:bg-muted text-foreground border border-border/50 rounded-xl font-bold text-xs md:text-sm transition-all focus:ring-2 focus:ring-primary/20 flex-1 lg:flex-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>
      <ReportFilters
        onRangeChange={(s, e) => fetchReport(s, e)}
        isLoading={loading}
        showPaymentMode={false}
      />

      {/* Loading & Error States */}
      {loading && !data ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 border border-dashed border-border/50 rounded-3xl bg-muted/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted-foreground">
            Gathering financial data...
          </p>
        </div>
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 border border-rose-500/20 rounded-3xl bg-rose-500/5">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
        </div>
      ) : data ? (
        <div
          className={`space-y-8 animate-in fade-in duration-500 ${loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          {loading && (
            <div className="fixed top-24 right-8 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-bold">Refreshing...</span>
            </div>
          )}

          {/* 3. Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-3xl p-5 md:p-6 border border-border/50 shadow-sm flex flex-col group hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Total Collected
                </h3>
              </div>
              <p className="text-xl md:text-2xl font-black text-emerald-600 mt-auto tabular-nums">
                {fmt(data.summary.totalFeesCollected)}
              </p>
            </div>

            <div className="bg-card rounded-3xl p-5 md:p-6 border border-border/50 shadow-sm flex flex-col group hover:border-rose-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Total Expenses
                </h3>
              </div>
              <p className="text-xl md:text-2xl font-black text-rose-600 mt-auto tabular-nums">
                {fmt(data.summary.totalExpenses)}
              </p>
            </div>

            <div
              className={`bg-card rounded-3xl p-5 md:p-6 border border-border/50 shadow-sm flex flex-col relative overflow-hidden group transition-colors ${data.summary.netCashFlow >= 0 ? "hover:border-emerald-500/30" : "hover:border-rose-500/30"}`}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity ${data.summary.netCashFlow >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div
                  className={`h-10 w-10 rounded-xl ${data.summary.netCashFlow >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"} flex items-center justify-center shrink-0`}
                >
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Net Cash Flow
                </h3>
              </div>
              <p
                className={`text-xl md:text-2xl font-black mt-auto relative z-10 tabular-nums ${data.summary.netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {data.summary.netCashFlow >= 0 ? "+" : ""}
                {fmt(data.summary.netCashFlow)}
              </p>
            </div>

            <div className="bg-card rounded-3xl p-5 md:p-6 border border-border/50 shadow-sm flex flex-col group hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Outstanding Dues
                </h3>
              </div>
              <p className="text-xl md:text-2xl font-black text-amber-600 mt-auto tabular-nums">
                {fmt(data.summary.outstandingDues)}
              </p>
              <p className="text-[9px] uppercase text-muted-foreground mt-1 font-black">
                From active students
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Transaction Feed */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 px-1">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black tracking-tight text-foreground">
                  Transaction History
                </h3>
              </div>

              <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-muted/30 border-b border-border/50">
                      <tr>
                        <th className="px-4 md:px-5 py-4 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">
                          Date
                        </th>
                        <th className="px-4 md:px-5 py-4 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">
                          Type/Ref
                        </th>
                        <th className="px-4 md:px-5 py-4 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">
                          Description
                        </th>
                        <th className="px-4 md:px-5 py-4 text-[10px] md:text-xs font-black text-rose-600 uppercase tracking-widest text-right">
                          Debit
                        </th>
                        <th className="px-4 md:px-5 py-4 text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest text-right">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {data.transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-8 text-center text-muted-foreground text-sm font-medium"
                          >
                            No transactions found for this period.
                          </td>
                        </tr>
                      ) : (
                        data.transactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="hover:bg-muted/10 transition-colors group"
                          >
                            <td className="px-4 md:px-5 py-3.5">
                              <span className="font-bold text-foreground tabular-nums">
                                {new Date(tx.date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-4 md:px-5 py-3.5">
                              <div className="flex flex-col">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-widest ${tx.type === "FEE_COLLECTION" ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {tx.type.replace("_", " ")}
                                </span>
                                <span className="font-mono text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                                  {tx.reference}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 md:px-5 py-3.5">
                              <div className="flex flex-col max-w-[150px] md:max-w-xs">
                                <span
                                  className="font-bold text-foreground truncate"
                                  title={tx.description}
                                >
                                  {tx.description}
                                </span>
                                {tx.studentName && (
                                  <span className="text-[11px] font-medium text-muted-foreground">
                                    {tx.studentName}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 md:px-5 py-3.5 text-right font-black text-rose-600 tabular-nums">
                              {tx.debit ? fmt(tx.debit) : "—"}
                            </td>
                            <td className="px-4 md:px-5 py-3.5 text-right font-black text-emerald-600 tabular-nums">
                              {tx.credit ? fmt(tx.credit) : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Tables */}
            <div className="space-y-8 lg:mt-0">
              {/* Expense Breakdown */}
              <div className="space-y-6">
                <h3 className="text-lg font-black tracking-tight text-foreground px-1">
                  Expense Breakdown
                </h3>
                <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-2 flex flex-col gap-1">
                  {data.expenseBreakdown.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm font-medium">
                      No expenses.
                    </div>
                  ) : (
                    data.expenseBreakdown.map((cat, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">
                            {cat.category}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            {cat.count} transactions
                          </span>
                        </div>
                        <span className="text-sm font-black text-rose-600 tabular-nums">
                          {fmt(cat.totalAmount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
