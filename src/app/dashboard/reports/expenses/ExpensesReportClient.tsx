"use client";

import React, { useState } from "react";
import { ReportLayout } from "@/components/dashboard/reports/ReportLayout";
import {
  ReportFilters,
  PredefinedRange,
} from "@/components/dashboard/reports/ReportFilters";
import { DataTable } from "@/components/dashboard/reports/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ExcelService } from "@/modules/document/services/excel.service";
import { formatCurrency } from "@/lib/reportExport";
import {
  TrendingDown,
  PieChart,
  Wallet,
  Building2,
  Printer,
} from "lucide-react";
import { PrintService } from "@/modules/document/services/print.service";
import { PrintWrapper } from "@/modules/document/components/PrintWrapper";
import { ExpenseVoucherTemplate } from "@/modules/document/templates/expense.template";

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  paymentMode: string;
  amount: number;
}

interface ExpenseCategorySummary {
  category: string;
  totalAmount: number;
  count: number;
}

interface ExpensesData {
  expenses: Expense[];
  summary: {
    totalExpenses: number;
    cashExpenses: number;
    bankExpenses: number;
  };
  categoryBreakdown: ExpenseCategorySummary[];
}

export function ExpensesReportClient() {
  const [data, setData] = useState<ExpensesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [printingExpense, setPrintingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    paymentMode: "ALL",
    category: "ALL",
  });

  const fetchReport = async (
    start: string,
    end: string,
    mode: string,
    cat: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/expenses?startDate=${start}&endDate=${end}&paymentMode=${mode}&category=${cat}`,
      );
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch expenses report:", err);
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

  const handleExport = async () => {
    if (!data) return;
    type ExpRow = {
      date: string;
      category: string;
      description: string;
      paymentMode: string;
      amount: number;
    };
    const rows: ExpRow[] = data.expenses.map((e) => ({
      date: e.date,
      category: e.category,
      description: e.description,
      paymentMode: e.paymentMode,
      amount: e.amount,
    }));
    await ExcelService.export({
      data: rows,
      columns: [
        { key: "date", label: "Date", format: "date" },
        { key: "category", label: "Category", format: "text" },
        { key: "description", label: "Description", format: "text", width: 40 },
        { key: "paymentMode", label: "Mode", format: "text" },
        { key: "amount", label: "Amount", format: "currency" },
      ],
      fileName: "Expenses_Report",
      options: {
        sheetName: "Expenses",
        headerStyle: { fillColor: "4F46E5", fontColor: "FFFFFF", bold: true },
      },
    });
  };

  const handlePrintVoucher = async (expense: Expense) => {
    setPrintingExpense(expense);
    // Add small delay for state update
    setTimeout(async () => {
      await PrintService.print({
        elementId: "expense-voucher-print",
        onAfterPrint: () => setPrintingExpense(null),
      });
    }, 100);
  };

  // Extract unique categories from breakdown for the filter
  const categories = data?.categoryBreakdown.map((c) => c.category) || [];

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Date(row.getValue("date")).toLocaleDateString()}
        </span>
      ),
    },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "paymentMode",
      header: "Paid Via",
      cell: ({ row }) => (
        <span
          className={`text-[10px] font-black px-2 py-1 rounded-full ${
            row.getValue("paymentMode") === "CASH"
              ? "bg-amber-500/10 text-amber-600"
              : "bg-blue-500/10 text-blue-600"
          }`}
        >
          {row.getValue("paymentMode")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-rose-600">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <button
          onClick={() => handlePrintVoucher(row.original)}
          className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors flex items-center gap-2 group"
          title="Print Voucher"
        >
          <Printer className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase">Voucher</span>
        </button>
      ),
    },
  ];

  return (
    <ReportLayout
      title="Expense Report"
      description="Detailed log of institutional spending and category-wise analysis."
      onExportExcel={handleExport}
      isLoading={loading}
      hasData={!!data}
    >
      <div className="space-y-8">
        <ReportFilters
          onRangeChange={handleRangeChange}
          onPaymentModeChange={handlePaymentModeChange}
          onCategoryChange={handleCategoryChange}
          showCategory={true}
          categories={categories}
          isLoading={loading}
        />

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Expenses
                  </h3>
                </div>
                <p className="text-2xl font-black text-rose-600">
                  {formatCurrency(data.summary.totalExpenses)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Cash Payments
                  </h3>
                </div>
                <p className="text-2xl font-black text-amber-600">
                  {formatCurrency(data.summary.cashExpenses)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Bank Payments
                  </h3>
                </div>
                <p className="text-2xl font-black text-blue-600">
                  {formatCurrency(data.summary.bankExpenses)}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 overflow-hidden">
                  <DataTable
                    columns={columns}
                    data={data.expenses}
                    searchKey="description"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                  <PieChart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black tracking-tight text-foreground">
                    Category Breakdown
                  </h3>
                </div>
                <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-4 space-y-3">
                  {data.categoryBreakdown.length > 0 ? (
                    data.categoryBreakdown.map((cat, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">
                            {cat.category}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            {cat.count} items
                          </span>
                        </div>
                        <span className="text-sm font-black text-rose-600">
                          {formatCurrency(cat.totalAmount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No data available for these filters.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <PrintPreview expense={printingExpense} />
      </div>
    </ReportLayout>
  );
}

export function ExpensesReportClientWrapper() {
  return <ExpensesReportClient />;
}

function PrintPreview({ expense }: { expense: Expense | null }) {
  if (!expense) return null;
  return (
    <div id="expense-voucher-print" className="hidden print:block">
      <ExpenseVoucherTemplate
        mode="print"
        data={{
          voucherNumber: expense.id.slice(-6).toUpperCase(),
          date: expense.date,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          paymentMode: expense.paymentMode,
          recordedBy: "System Admin",
          organizationName: "Wisdom Academy",
        }}
      />
    </div>
  );
}
