"use client";

import React, { useState } from "react";
import { ReportLayout } from "@/components/dashboard/reports/ReportLayout";
import {
  ReportFilters,
  PredefinedRange,
} from "@/components/dashboard/reports/ReportFilters";
import { DataTable } from "@/components/dashboard/reports/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { exportToExcel, formatCurrency } from "@/lib/reportExport";
import { Receipt, Wallet, Building2, TrendingUp } from "lucide-react";

interface FeeReceipt {
  id: string;
  date: string;
  receiptNumber: string;
  studentName: string;
  class: string;
  paymentMode: string;
  category: string;
  amount: number;
  remarks: string | null;
}

interface FeeReportData {
  receipts: FeeReceipt[];
  summary: {
    totalFeesCollected: number;
    cashCollections: number;
    bankCollections: number;
  };
}

export function FeesClient() {
  const [data, setData] = useState<FeeReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    paymentMode: "ALL",
    category: "ALL",
  });

  const INCOME_CATEGORIES = [
    "Tuition Fee",
    "Form Fee",
    "Book Sale",
    "Bonafide Fee",
    "Student Dues",
    "Other",
  ];

  const fetchReport = async (
    start: string,
    end: string,
    mode: string,
    cat: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/fees?startDate=${start}&endDate=${end}&paymentMode=${mode}&category=${cat}`,
      );
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch fee report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (
    start: string,
    end: string,
    range: PredefinedRange,
  ) => {
    setFilters((prev) => ({ ...prev, start, end }));
    fetchReport(start, end, filters.paymentMode, filters.category);
  };

  const handlePaymentModeChange = (mode: string) => {
    setFilters((prev) => ({ ...prev, paymentMode: mode }));
    fetchReport(filters.start, filters.end, mode, filters.category);
  };

  const handleCategoryChange = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
    fetchReport(filters.start, filters.end, filters.paymentMode, cat);
  };

  const handleExport = () => {
    if (!data) return;
    const exportData = data.receipts.map((r) => ({
      Date: new Date(r.date).toLocaleDateString(),
      "Receipt Number": r.receiptNumber,
      Student: r.studentName,
      Class: r.class,
      Purpose: r.category,
      Mode: r.paymentMode,
      Amount: r.amount,
      Remarks: r.remarks || "",
    }));

    exportToExcel("Fee_Collection_Report", [
      { name: "Payments", data: exportData },
      {
        name: "Summary",
        data: [
          ["Metric", "Value"],
          ["Total Collected", data.summary.totalFeesCollected],
          ["Cash Collections", data.summary.cashCollections],
          ["Bank Collections", data.summary.bankCollections],
        ],
      },
    ]);
  };

  const columns: ColumnDef<FeeReceipt>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Date(row.getValue("date")).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "receiptNumber",
      header: "Receipt #",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.getValue("receiptNumber")}
        </span>
      ),
    },
    { accessorKey: "studentName", header: "Student Name" },
    { accessorKey: "class", header: "Class" },
    {
      accessorKey: "category",
      header: "Purpose",
      cell: ({ row }) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {row.getValue("category")}
        </span>
      ),
    },
    {
      accessorKey: "paymentMode",
      header: "Mode",
      cell: ({ row }) => (
        <span
          className={`text-[10px] font-black px-2 py-1 rounded-full ${
            row.getValue("paymentMode") === "CASH"
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-blue-500/10 text-blue-600"
          }`}
        >
          {row.getValue("paymentMode")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-black text-emerald-600">
          {formatCurrency(row.getValue("amount"))}
        </span>
      ),
    },
    { accessorKey: "remarks", header: "Remarks" },
  ];

  return (
    <ReportLayout
      title="Income / Receipts Report"
      description="View student payments collected during a selected period."
      onExportExcel={handleExport}
      onPrint={() => window.print()}
      isLoading={loading}
      hasData={!!data}
    >
      <div className="space-y-8">
        <ReportFilters
          onRangeChange={handleRangeChange}
          onPaymentModeChange={handlePaymentModeChange}
          onCategoryChange={handleCategoryChange}
          showCategory={true}
          categories={INCOME_CATEGORIES}
          isLoading={loading}
        />

        {data && (
          <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Collected
                  </h3>
                </div>
                <p className="text-2xl font-black text-primary">
                  {formatCurrency(data.summary.totalFeesCollected)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Cash Collections
                  </h3>
                </div>
                <p className="text-2xl font-black text-emerald-600">
                  {formatCurrency(data.summary.cashCollections)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Bank Collections
                  </h3>
                </div>
                <p className="text-2xl font-black text-blue-600">
                  {formatCurrency(data.summary.bankCollections)}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6">
              <DataTable
                columns={columns}
                data={data.receipts}
                searchKey="studentName"
              />
            </div>
          </>
        )}
      </div>
    </ReportLayout>
  );
}
