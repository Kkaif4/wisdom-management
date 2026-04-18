"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  GraduationCap,
  ChevronRight,
  UserPlus,
  Upload,
  Loader2,
  AlertCircle,
  ArrowUpCircle,
  Pencil,
  UserMinus,
} from "lucide-react";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { BulkImportDialog } from "@/components/forms/BulkImportDialog";
import { PromoteStudentDialog } from "@/components/forms/PromoteStudentDialog";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { showToast } from "@/components/shared/Toast";

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  status: string;
  className: string;
  divisionName: string;
  sessionName: string;
  totalFeesAssigned: number;
  totalPaid: number;
  enrollmentId: string | null;
}

interface ClassItem {
  id: string;
  name: string;
  divisions: { id: string; name: string }[];
}

interface Session {
  id: string;
  name: string;
}

interface StudentsClientProps {
  students: Student[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  initialSearch: string;
  classes: ClassItem[];
  sessions: Session[];
  error?: string;
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export function StudentsClient({
  students,
  totalCount,
  currentPage,
  totalPages,
  initialSearch,
  classes,
  sessions,
  error,
}: StudentsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<Student | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter state from URL
  const currentSessionId = searchParams.get("sessionId") || "";
  const currentClassId = searchParams.get("classId") || "";
  const currentDivisionId = searchParams.get("divisionId") || "";

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search === initialSearch) return;
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      params.set("p", "1");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [search, router, searchParams, initialSearch, pathname]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset division if class changes
    if (key === "classId") params.delete("divisionId");
    params.set("p", "1");
    // Clear selection when filters change
    setSelectedIds([]);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("p", page.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === students.length ? [] : students.map((s) => s.id),
    );
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-600";
      case "WITHDRAWN":
        return "text-rose-600";
      case "ALUMNI":
        return "text-blue-600";
      default:
        return "text-gray-500";
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget?.enrollmentId) return;
    try {
      const res = await fetch(
        `/api/enrollments/${withdrawTarget.enrollmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "WITHDRAWN" }),
        },
      );
      if (!res.ok) throw new Error("Failed to withdraw student");
      showToast(`${withdrawTarget.name} has been withdrawn`, "success");
      setWithdrawTarget(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const selectedClass = classes.find((c) => c.id === currentClassId);

  return (
    <div className="space-y-8 animate-fade-in mb-10">
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
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowPromote(true)}
              className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white font-black shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 animate-in slide-in-from-right-4"
            >
              <ArrowUpCircle className="h-5 w-5" /> Promote (
              {selectedIds.length})
            </button>
          )}
          <button
            onClick={() => setShowImport(true)}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 text-foreground font-bold shadow-sm transition-all hover:bg-muted/80 active:scale-95"
          >
            <Upload className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />{" "}
            Import CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="h-5 w-5" /> Add Student
          </button>
        </div>
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          {isPending ? (
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <input
            type="text"
            placeholder="Search student…"
            className="w-full bg-card/50 border border-border/50 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={currentSessionId}
          onChange={(e) => updateFilter("sessionId", e.target.value)}
          className="bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        >
          <option value="">All Sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={currentClassId}
          onChange={(e) => updateFilter("classId", e.target.value)}
          className="bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={currentDivisionId}
          onChange={(e) => updateFilter("divisionId", e.target.value)}
          disabled={!currentClassId}
          className="bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <option value="">All Divisions</option>
          {selectedClass?.divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

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
                <th className="px-6 py-5 w-10">
                  <input
                    type="checkbox"
                    checked={
                      students.length > 0 &&
                      selectedIds.length === students.length
                    }
                    onChange={toggleAll}
                    className="rounded border-border/50 text-primary focus:ring-primary/20"
                  />
                </th>
                <th className="px-6 py-5">Student</th>
                <th className="px-6 py-5">Class</th>
                <th className="px-6 py-5">Session</th>
                <th className="px-6 py-5 text-right">Assigned</th>
                <th className="px-6 py-5 text-right">Paid</th>
                <th className="px-6 py-5 text-right">Remaining</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <GraduationCap className="h-10 w-10 mb-4" />
                      <p className="text-sm font-bold tracking-tight">
                        No student records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const remaining = s.totalFeesAssigned - s.totalPaid;
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`group transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/30"}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(s.id)}
                          className="rounded border-border/50 text-primary focus:ring-primary/20"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                          {s.name}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                          {s.admissionNumber}
                          <span className={statusColor(s.status)}>
                            • {s.status}
                          </span>
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {s.className}
                        {s.divisionName ? ` - ${s.divisionName}` : ""}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {s.sessionName || "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm text-muted-foreground/60">
                        {fmt(s.totalFeesAssigned)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm text-emerald-600/80">
                        {fmt(s.totalPaid)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-mono font-black text-sm ${remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {fmt(remaining)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/students/${s.id}`}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Pencil className="h-3 w-3" /> Ledger
                          </Link>
                          {s.status === "ACTIVE" && s.enrollmentId && (
                            <button
                              onClick={() => setWithdrawTarget(s)}
                              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
                            >
                              <UserMinus className="h-3 w-3" /> Withdraw
                            </button>
                          )}
                        </div>
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
      {showPromote && (
        <PromoteStudentDialog
          onClose={() => setShowPromote(false)}
          onSuccess={() => {
            setSelectedIds([]);
            router.refresh();
          }}
          selectedStudentIds={selectedIds}
          currentClassId={currentClassId}
          currentSessionId={currentSessionId}
        />
      )}

      {withdrawTarget && (
        <ConfirmDialog
          open={true}
          title="Withdraw Student"
          message={`Are you sure you want to withdraw ${withdrawTarget.name}? This will mark them as withdrawn from their current enrollment. This action cannot be easily undone.`}
          variant="danger"
          confirmText="Withdraw Student"
          onConfirm={handleWithdraw}
          onCancel={() => setWithdrawTarget(null)}
        />
      )}
    </div>
  );
}
