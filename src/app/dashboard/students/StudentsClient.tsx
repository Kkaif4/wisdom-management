"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  GraduationCap,
  ChevronRight,
  UserPlus,
  Upload,
} from "lucide-react";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { BulkImportDialog } from "@/components/forms/BulkImportDialog";

interface Student {
  id: string;
  name: string;
  class: string;
  totalFeesAssigned: number;
  totalPaid: number;
}

interface StudentsClientProps {
  students: Student[];
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export function StudentsClient({ students }: StudentsClientProps) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.class.toLowerCase().includes(q),
    );
  }, [students, search]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Students
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <GraduationCap className="h-4 w-4 text-primary" />
            Manage student records and fee assignments
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name or class..."
            className="w-full bg-card/50 border border-border/50 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="glass rounded-3xl overflow-hidden border-border/50">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <GraduationCap className="h-10 w-10 mb-4" />
                      <p className="text-sm font-bold tracking-tight">
                        No student records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
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
                      <td className="px-8 py-5 text-right font-mono font-bold text-sm text-muted-foreground">
                        {fmt(s.totalFeesAssigned)}
                      </td>
                      <td className="px-8 py-5 text-right font-mono font-bold text-sm text-emerald-600">
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

      {showAdd && (
        <AddStudentDialog
          onClose={() => setShowAdd(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {showImport && (
        <BulkImportDialog
          onClose={() => setShowImport(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
