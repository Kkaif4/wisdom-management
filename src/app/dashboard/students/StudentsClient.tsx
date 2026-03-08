"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  GraduationCap,
  ChevronRight,
  UserPlus,
  Upload,
  Loader2,
} from "lucide-react";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { BulkImportDialog } from "@/components/forms/BulkImportDialog";
import { Pagination } from "@/components/shared/Pagination";

interface Student {
  id: string;
  name: string;
  class: string;
  totalFeesAssigned: number;
  totalPaid: number;
}

interface StudentsClientProps {
  students: Student[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export function StudentsClient({
  students,
  totalCount,
  currentPage,
  totalPages,
}: StudentsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [isPending, setIsPending] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Debounced URL search update
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (search === currentQ) return;

      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      params.set("p", "1"); // Reset to page 1 on search
      setIsPending(true);
      router.push(`?${params.toString()}`);
      setTimeout(() => setIsPending(false), 500);
    }, 500);

    return () => clearTimeout(handler);
  }, [search, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("p", page.toString());
    setIsPending(true);
    router.push(`?${params.toString()}`);
    setTimeout(() => setIsPending(false), 500);
  };

  return (
    <div className="space-y-8 animate-fade-in mb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Students
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <GraduationCap className="h-4 w-4 text-primary" />
            Showing {students.length} of {totalCount} records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 text-foreground font-bold shadow-sm transition-all hover:bg-muted/80 active:scale-95"
          >
            <Upload className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="h-5 w-5" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          {isPending ? (
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <input
            type="text"
            placeholder="Search by student name..."
            className="w-full bg-card/50 border border-border/50 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="glass rounded-3xl overflow-hidden border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/20 border-b border-border/50">
                <th className="px-8 py-5">Student / Class</th>
                <th className="px-8 py-5 text-right">Assigned</th>
                <th className="px-8 py-5 text-right">Paid</th>
                <th className="px-8 py-5 text-right">Remaining</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <GraduationCap className="h-10 w-10 mb-4" />
                      <p className="text-sm font-black tracking-tight">
                        No student records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const remaining = s.totalFeesAssigned - s.totalPaid;
                  return (
                    <tr
                      key={s.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                          {s.name}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-1">
                          {s.class}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-right font-mono font-bold text-sm text-muted-foreground/60">
                        {fmt(s.totalFeesAssigned)}
                      </td>
                      <td className="px-8 py-5 text-right font-mono font-bold text-sm text-emerald-600/80">
                        {fmt(s.totalPaid)}
                      </td>
                      <td
                        className={`px-8 py-5 text-right font-mono font-black text-sm ${remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {fmt(remaining)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link
                          href={`/dashboard/students/${s.id}`}
                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
                        >
                          View Ledger
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
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

      {showAdd && (
        <AddStudentDialog
          onClose={() => setShowAdd(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {showImport && (
        <BulkImportDialog
          onClose={() => setShowImport(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
