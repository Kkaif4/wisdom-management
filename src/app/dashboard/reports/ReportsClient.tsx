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
import * as XLSX from "xlsx";
import { showToast } from "@/components/shared/Toast";

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

type PredefinedRange =
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "LAST_MONTH"
  | "LAST_3_MONTHS"
  | "THIS_YEAR"
  | "CUSTOM";

export function ReportsClient() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date State
  const [activeRange, setActiveRange] =
    useState<PredefinedRange>("LAST_30_DAYS");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fmt = (num: number) => `₹${num.toLocaleString("en-IN")}`;

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
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to set dates based on preset
  const applyPreset = (preset: PredefinedRange) => {
    setActiveRange(preset);
    if (preset === "CUSTOM") return;

    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "TODAY":
        start = new Date();
        break;
      case "LAST_7_DAYS":
        start.setDate(today.getDate() - 7);
        break;
      case "LAST_30_DAYS":
        start.setDate(today.getDate() - 30);
        break;
      case "LAST_MONTH":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "LAST_3_MONTHS":
        start = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          today.getDate(),
        );
        break;
      case "THIS_YEAR":
        start = new Date(today.getFullYear(), 0, 1);
        break;
    }

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    setStartDate(startStr);
    setEndDate(endStr);
    fetchReport(startStr, endStr);
  };

  // Initial load
  useEffect(() => {
    // Check if there are query params pre-filling
    const params = new URLSearchParams(window.location.search);
    const rangeParam = params.get("range");
    if (
      rangeParam &&
      rangeParam.toUpperCase() in
        [
          "TODAY",
          "LAST_7_DAYS",
          "LAST_30_DAYS",
          "LAST_MONTH",
          "LAST_3_MONTHS",
          "THIS_YEAR",
        ]
    ) {
      applyPreset(rangeParam.toUpperCase() as PredefinedRange);
    } else {
      applyPreset("LAST_30_DAYS");
    }
  }, []);

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      setActiveRange("CUSTOM");
      fetchReport(startDate, endDate);
    }
  };

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    if (!data) return;

    try {
      // 1. Prepare Summary Sheet
      const summaryData = [
        ["Financial Report Summary"],
        ["Period", `${startDate} to ${endDate}`],
        ["Generated At", new Date().toLocaleString()],
        [],
        ["Metric", "Amount"],
        ["Total Fees Collected", data.summary.totalFeesCollected],
        ["Total Expenses", data.summary.totalExpenses],
        ["Net Cash Flow", data.summary.netCashFlow],
        ["Outstanding Dues", data.summary.outstandingDues],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      // 2. Prepare Transactions Sheet
      const transactionHeaders = [
        "Date",
        "Type",
        "Reference",
        "Student Name",
        "Description",
        "Debit (Out)",
        "Credit (In)",
      ];
      const transactionRows = data.transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.reference,
        t.studentName || "",
        t.description,
        t.debit || 0,
        t.credit || 0,
      ]);
      const transactionSheet = XLSX.utils.aoa_to_sheet([
        transactionHeaders,
        ...transactionRows,
      ]);

      // 3. Prepare Expense Breakdown Sheet
      const expenseHeaders = ["Category", "Total Amount", "Transaction Count"];
      const expenseRows = data.expenseBreakdown.map((cat) => [
        cat.category,
        cat.totalAmount,
        cat.count,
      ]);
      const expenseSheet = XLSX.utils.aoa_to_sheet([
        expenseHeaders,
        ...expenseRows,
      ]);

      // 4. Create Workbook and Append Sheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
      XLSX.utils.book_append_sheet(wb, transactionSheet, "Transactions");
      XLSX.utils.book_append_sheet(wb, expenseSheet, "Expense Breakdown");

      // 5. Save File
      XLSX.writeFile(wb, `financial_report_${startDate}_to_${endDate}.xlsx`);
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
          <button
            onClick={handlePrint}
            disabled={!data || loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-bold text-xs md:text-sm transition-all focus:ring-2 focus:ring-primary/20 shadow-lg shadow-primary/20 flex-1 lg:flex-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* 2. Date Range Filters */}
      <div className="bg-card border border-border/50 rounded-3xl p-5 md:p-6 shadow-sm hide-print overflow-hidden relative group/filters transition-all hover:border-primary/20">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end gap-6 md:gap-8">
          {/* Quick Selection Section */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Time Period Presets
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
              {[
                { id: "TODAY", label: "Today" },
                { id: "LAST_7_DAYS", label: "Last 7 Days" },
                { id: "LAST_30_DAYS", label: "Last 30 Days" },
                { id: "LAST_MONTH", label: "Monthly" },
                { id: "LAST_3_MONTHS", label: "Quarterly" },
                { id: "THIS_YEAR", label: "Yearly" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id as PredefinedRange)}
                  className={`px-3 py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all border border-transparent shadow-sm ${
                    activeRange === preset.id
                      ? "bg-primary text-primary-foreground shadow-primary/20 scale-[1.02]"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:border-border/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider on desktop */}
          <div className="hidden xl:block w-[1px] h-12 bg-border/50 mb-1" />

          {/* Custom Date Range Section */}
          <div className="flex-none space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Custom Range Definition
              </label>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative group/input flex-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-muted/40 border border-border/50 rounded-xl pl-4 pr-3 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none hover:bg-muted/60"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-40">
                    <div className="h-1 w-1 rounded-full bg-foreground" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-muted-foreground shrink-0 px-1 opacity-50">
                  to
                </span>
                <div className="relative group/input flex-1">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-muted/40 border border-border/50 rounded-xl pl-4 pr-3 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none hover:bg-muted/60"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-40">
                    <div className="h-1 w-1 rounded-full bg-foreground" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleCustomDateApply}
                disabled={loading}
                className="group/apply flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20 sm:min-w-[100px]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Apply</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/apply:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt;
          }
          .hide-print,
          .no-scrollbar {
            display: none !important;
          }
          .bg-card,
          .bg-muted,
          .bg-muted/10,
          .bg-primary/10 {
            background: transparent !important;
            border-color: #eee !important;
            box-shadow: none !important;
          }
          .rounded-3xl,
          .rounded-xl,
          .rounded-2xl {
            border-radius: 4px !important;
            border-width: 1px !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th,
          td {
            border-bottom: 1px solid #eee !important;
            padding: 8px 4px !important;
          }
          th {
            background: #f9f9f9 !important;
            font-weight: bold !important;
            -webkit-print-color-adjust: exact;
          }
          .text-emerald-600 {
            color: #059669 !important;
          }
          .text-rose-600 {
            color: #e11d48 !important;
          }
          .text-amber-600 {
            color: #d97706 !important;
          }
          .fixed,
          .animate-bounce,
          .animate-spin {
            display: none !important;
          }
        }
      `}</style>

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
          {/* Printable Report Title Overlay (Only visible in Print mode) */}
          <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              Wisdom Management
            </h1>
            <div className="flex justify-between items-end mt-4">
              <div>
                <h2 className="text-xl font-bold">Financial Report</h2>
                <p className="text-sm text-muted-foreground">
                  Range: {new Date(startDate).toLocaleDateString("en-IN")} to{" "}
                  {new Date(endDate).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Generated On
                </p>
                <p className="text-sm font-mono">
                  {new Date().toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

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
