"use client";

import { ReceiptEntryModal } from "@/components/forms/ReceiptEntryModal";
import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  Plus,
  Search,
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  CheckCircle2,
  XCircle,
  ArrowDownRight,
  GraduationCap,
  Loader2,
  AlertCircle,
  Download,
  Printer,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pagination } from "@/components/shared/Pagination";
import { ExcelService } from "@/modules/document/services/excel.service";
import { ColumnConfig } from "@/modules/document/types/excel.types";
import { PrintService } from "@/modules/document/services/print.service";
import { PrintWrapper } from "@/modules/document/components/PrintWrapper";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ReceiptTemplate } from "@/modules/document/templates/receipt.template";
import { logDocumentAction } from "@/modules/document/actions/audit.actions";
import { DocumentErrorBoundary } from "@/modules/document/components/ErrorBoundary";

interface Receipt {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMode: string;
  category: string;
  date: string;
  status: string;
  remarks: string | null;
  studentName: string;
  admissionNumber: string;
  fatherName: string;
  rollNumber: string;
  studentClass: string;
  divisionName: string;
  sessionName: string;
  recordedBy: string;
}

interface ReceiptsClientProps {
  receipts: Receipt[];
  currentPage: number;
  totalPages: number;
  filters: {
    query: string;
  };
  error?: string;
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

export function ReceiptsClient({
  receipts,
  currentPage,
  totalPages,
  filters,
  error,
}: ReceiptsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showEntry, setShowEntry] = useState(false);
  const [searchVal, setSearchVal] = useState(filters.query);
  const [printingReceipt, setPrintingReceipt] = useState<Receipt | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setSearchVal(filters.query);
  }, [filters.query]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      pageTotal: receipts
        .filter((r) => r.status === "ACTIVE")
        .reduce((sum, r) => sum + r.amount, 0),
      activeCount: receipts.filter((r) => r.status === "ACTIVE").length,
      cancelledCount: receipts.filter((r) => r.status === "CANCELLED").length,
    };
  }, [receipts]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("p", page.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal) {
      params.set("q", searchVal);
    } else {
      params.delete("q");
    }
    params.set("p", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleExport = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const columns: ColumnConfig<Receipt>[] = [
        { key: "date", label: "Date", format: "date" },
        { key: "receiptNumber", label: "Receipt #", format: "text" },
        { key: "studentName", label: "Student Name", format: "text" },
        { key: "studentClass", label: "Class", format: "text" },
        { key: "category", label: "Category", format: "text" },
        { key: "paymentMode", label: "Mode", format: "text" },
        { key: "amount", label: "Amount", format: "currency" },
        { key: "status", label: "Status", format: "text" },
      ];

      // Add totals row
      const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
      const exportData = [
        ...receipts,
        {
          receiptNumber: "TOTAL",
          amount: totalAmount,
          studentName: "",
          studentClass: "",
          category: "",
          paymentMode: "",
          status: "",
          date: "",
        },
      ];

      await ExcelService.export({
        data: exportData as any[],
        columns,
        fileName: "Receipts_Report",
        options: {
          sheetName: "Receipts",
          headerStyle: { fillColor: "4F46E5", fontColor: "FFFFFF", bold: true },
        },
      });

      // Audit the action
      await logDocumentAction({
        type: "receipt_list",
        action: "EXPORT_EXCEL",
        entityId: "dashboard",
        userId: "system", // TODO: Replace with real user ID from session
        organizationId: "system", // TODO: Replace with real org ID from session
        metadata: { count: receipts.length, filters },
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async (receipt: Receipt) => {
    setPrintingReceipt(receipt);

    // Audit the action
    await logDocumentAction({
      type: "receipt",
      action: "PRINT",
      entityId: receipt.id,
      userId: "currentUser",
      organizationId: "default",
      metadata: { receiptNumber: receipt.receiptNumber },
    });

    // PrintService handles internal delay for DOM update
    await PrintService.print({
      elementId: "receipt-print-area",
      onAfterPrint: () => setPrintingReceipt(null),
      onError: () => setPrintingReceipt(null),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Income / Receipts
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <Receipt className="h-4 w-4 text-primary" />
            Daily income and receipt management
          </p>
        </div>
        <PermissionGate permission="CREATE_RECEIPT">
          <button
            onClick={() => setShowEntry(true)}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            New Collection
          </button>
        </PermissionGate>
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border-emerald-500/10 bg-emerald-500/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/80 mb-2">
            Page Total
          </p>
          <p className="text-2xl font-black text-foreground">
            {fmt(stats.pageTotal)}
          </p>
          <div className="mt-2 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
            <ArrowDownRight className="h-3 w-3" />
            Current View
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border-primary/10 bg-primary/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-2">
            Active Records
          </p>
          <p className="text-2xl font-black text-foreground">
            {stats.activeCount}
          </p>
          <div className="mt-2 text-[10px] font-bold text-primary/70 uppercase tracking-tighter flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            In View
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border-destructive/10 bg-destructive/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive/70 mb-2">
            Void Entries
          </p>
          <p className="text-2xl font-black text-foreground">
            {stats.cancelledCount}
          </p>
          <div className="mt-2 text-[10px] font-bold text-destructive/70 uppercase tracking-tighter flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Filtered
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          {isPending ? (
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <input
            type="text"
            placeholder="Search student or receipt #..."
            className="w-full bg-card/50 border border-border/50 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>

        <PermissionGate permission="VIEW_FINANCIAL_REPORTS">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border/50 text-foreground/70 font-bold hover:bg-muted/50 transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export Excel"}
          </button>
        </PermissionGate>
      </div>

      {/* Table Section */}
      <div className="glass rounded-3xl overflow-hidden border-border/50 shadow-sm relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/20 border-b border-border/50">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Student / Class</th>
                <th className="px-8 py-5">Receipt Ref</th>
                <th className="px-8 py-5">Purpose</th>
                <th className="px-8 py-5">Mode</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-right">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <Receipt className="h-10 w-10 mb-4" />
                      <p className="text-sm font-bold tracking-tight">
                        No collection records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr
                    key={r.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                        <Calendar className="h-3 w-3 text-primary/60" />
                        {new Date(r.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                        {r.studentName}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <GraduationCap className="h-2.5 w-2.5" />
                        {r.studentClass}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono font-bold text-foreground/60 bg-muted/50 px-2 py-1 rounded-lg">
                        #{r.receiptNumber}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {r.paymentMode === "CASH" ? (
                          <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <span
                          className={`text-[10px] font-black tracking-[0.1em] uppercase ${r.paymentMode === "CASH" ? "text-emerald-600" : "text-blue-600"}`}
                        >
                          {r.paymentMode}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-mono font-black text-foreground">
                      {fmt(r.amount)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === "ACTIVE" ? (
                          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              Active
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-600 px-3 py-1 rounded-full border border-rose-500/20">
                            <XCircle className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              Void
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <PermissionGate permission="PRINT_RECEIPT">
                        <button
                          onClick={() => handlePrint(r)}
                          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                          title="Print Receipt"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isPending}
      />

      {showEntry && (
        <ReceiptEntryModal
          onClose={() => setShowEntry(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Hidden Print Area */}
      {printingReceipt && (
        <PrintWrapper id="receipt-print-area" width="148mm">
          <DocumentErrorBoundary onReset={() => setPrintingReceipt(null)}>
            <ReceiptTemplate
              mode="print"
              data={{
                receiptNumber: printingReceipt.receiptNumber,
                date: printingReceipt.date,
                amount: printingReceipt.amount,
                paymentMode: printingReceipt.paymentMode,
                category: printingReceipt.category,
                remarks: printingReceipt.remarks,
                studentName: printingReceipt.studentName,
                admissionNumber: printingReceipt.admissionNumber,
                fatherName: printingReceipt.fatherName,
                rollNumber: printingReceipt.rollNumber,
                studentClass: `${printingReceipt.studentClass}${printingReceipt.divisionName ? " - " + printingReceipt.divisionName : ""}`,
                sessionName: printingReceipt.sessionName,
                organizationName: "Wisdom Management",
              }}
            />
          </DocumentErrorBoundary>
        </PrintWrapper>
      )}
    </div>
  );
}
