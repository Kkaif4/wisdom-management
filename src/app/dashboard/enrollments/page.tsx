"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Plus,
  Loader2,
  ChevronRight,
  AlertCircle,
  UserX,
} from "lucide-react";

interface Enrollment {
  id: string;
  status: string;
  totalFeesAssigned: number;
  totalPaid: number;
  student: { id: string; name: string; grNo: string };
  class: { name: string };
  division: { name: string };
  academicSession: { name: string };
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(val);

export default function EnrollmentsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      params.set("p", page.toString());
      params.set("l", "20");
      const res = await fetch(`/api/enrollments?${params}`);
      const data = await res.json();
      setEnrollments(data.data || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleWithdraw = async (id: string) => {
    if (
      !confirm(
        "Withdraw this student? Their enrollment will be marked as WITHDRAWN.",
      )
    )
      return;
    setWithdrawingId(id);
    try {
      await fetch(`/api/enrollments/${id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      fetchEnrollments();
    } catch (e) {
      console.error(e);
    }
    setWithdrawingId(null);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "PROMOTED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "WITHDRAWN":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Enrollments
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <BookOpen className="h-4 w-4 text-primary" /> {total} total
            enrollments
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name..."
            className="w-full bg-card/50 border border-border/50 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border-border/50 shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/20 border-b border-border/50">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Class / Division</th>
                <th className="px-6 py-4">Session</th>
                <th className="px-6 py-4 text-right">Assigned</th>
                <th className="px-6 py-4 text-right">Paid</th>
                <th className="px-6 py-4 text-right">Remaining</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {enrollments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-20 text-center text-muted-foreground/50 text-sm font-bold"
                  >
                    No enrollments found
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => {
                  const remaining =
                    Number(e.totalFeesAssigned) - Number(e.totalPaid);
                  return (
                    <tr
                      key={e.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-black">{e.student.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          {e.student.grNo}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {e.class.name} - {e.division.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {e.academicSession.name}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm text-muted-foreground/60">
                        {fmt(Number(e.totalFeesAssigned))}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm text-emerald-600/80">
                        {fmt(Number(e.totalPaid))}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-mono font-black text-sm ${remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {fmt(remaining)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColor(e.status)}`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/students/${e.student.id}`)
                          }
                          className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-all"
                        >
                          Ledger
                        </button>
                        {e.status === "ACTIVE" && (
                          <button
                            onClick={() => handleWithdraw(e.id)}
                            disabled={withdrawingId === e.id}
                            className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-all disabled:opacity-50"
                          >
                            {withdrawingId === e.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <UserX className="h-3 w-3 inline" /> Withdraw
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
