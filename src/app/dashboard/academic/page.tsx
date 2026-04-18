"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  Archive,
  Zap,
  Lock,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(val);

type SessionStatus = "UPCOMING" | "ACTIVE" | "CLOSED" | "ARCHIVED";

interface Division {
  id: string;
  name: string;
  capacity: number | null;
}
interface ClassItem {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  divisions: Division[];
}
interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SessionStatus;
}

export default function AcademicPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  // Form states
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassOrder, setNewClassOrder] = useState(1);
  const [showAddDivision, setShowAddDivision] = useState<string | null>(null);
  const [newDivName, setNewDivName] = useState("");
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    message: string;
    variant: "danger" | "warning" | "default";
    confirmText: string;
    action: () => void;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [classRes, sessionRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/academic-sessions"),
      ]);
      setClasses(await classRes.json());
      setSessions(await sessionRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    setActionLoading(true);
    await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName, displayOrder: newClassOrder }),
    });
    setNewClassName("");
    setShowAddClass(false);
    setActionLoading(false);
    fetchData();
  };

  const handleDeleteClass = async (id: string) => {
    setPendingConfirm({
      title: "Delete Class",
      message:
        "Are you sure you want to delete this class? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete",
      action: async () => {
        await fetch(`/api/classes/${id}`, { method: "DELETE" });
        setPendingConfirm(null);
        fetchData();
      },
    });
  };

  const handleAddDivision = async (classId: string) => {
    if (!newDivName.trim()) return;
    setActionLoading(true);
    await fetch("/api/divisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDivName, classId }),
    });
    setNewDivName("");
    setShowAddDivision(null);
    setActionLoading(false);
    fetchData();
  };

  const handleDeleteDivision = async (id: string) => {
    setPendingConfirm({
      title: "Delete Division",
      message:
        "Are you sure you want to delete this division? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete",
      action: async () => {
        await fetch(`/api/divisions/${id}`, { method: "DELETE" });
        setPendingConfirm(null);
        fetchData();
      },
    });
  };

  const handleAddSession = async () => {
    if (!newSession.name || !newSession.startDate || !newSession.endDate)
      return;
    setActionLoading(true);
    await fetch("/api/academic-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSession),
    });
    setNewSession({ name: "", startDate: "", endDate: "" });
    setShowAddSession(false);
    setActionLoading(false);
    fetchData();
  };

  const handleActivateSession = async (id: string) => {
    setPendingConfirm({
      title: "Activate Session",
      message:
        "Activate this session? The currently active session will be closed automatically.",
      variant: "warning",
      confirmText: "Activate",
      action: async () => {
        await fetch(`/api/academic-sessions/${id}/activate`, {
          method: "POST",
        });
        setPendingConfirm(null);
        fetchData();
      },
    });
  };

  const handleCloseSession = async (id: string) => {
    setPendingConfirm({
      title: "Close Session",
      message:
        "Close this session? Financial records will become read-only. This action cannot be undone.",
      variant: "danger",
      confirmText: "Close Session",
      action: async () => {
        await fetch(`/api/academic-sessions/${id}/close`, { method: "POST" });
        setPendingConfirm(null);
        fetchData();
      },
    });
  };

  const statusBadge = (status: SessionStatus) => {
    const styles: Record<SessionStatus, string> = {
      UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      CLOSED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      ARCHIVED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
    const icons: Record<SessionStatus, React.ReactNode> = {
      UPCOMING: <Clock className="h-3 w-3" />,
      ACTIVE: <CheckCircle2 className="h-3 w-3" />,
      CLOSED: <Lock className="h-3 w-3" />,
      ARCHIVED: <Archive className="h-3 w-3" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}
      >
        {icons[status]} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in mb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Academic Management
        </h1>
        <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
          <School className="h-4 w-4 text-primary" /> Classes, Divisions &
          Sessions
        </p>
      </div>

      {/* ─── Sessions ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black tracking-tight">
            Academic Sessions
          </h2>
          <button
            onClick={() => setShowAddSession(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Session
          </button>
        </div>

        {showAddSession && (
          <div className="glass rounded-2xl p-6 border border-border/50 mb-4 space-y-3">
            <input
              value={newSession.name}
              onChange={(e) =>
                setNewSession({ ...newSession, name: e.target.value })
              }
              placeholder="e.g. 2025-26"
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={newSession.startDate}
                onChange={(e) =>
                  setNewSession({ ...newSession, startDate: e.target.value })
                }
                className="bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="date"
                value={newSession.endDate}
                onChange={(e) =>
                  setNewSession({ ...newSession, endDate: e.target.value })
                }
                className="bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddSession}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </button>
              <button
                onClick={() => setShowAddSession(false)}
                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-bold hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="glass rounded-3xl overflow-hidden border-border/50 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/20 border-b border-border/50">
                <th className="px-6 py-4">Session</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-muted-foreground/50 text-sm font-bold"
                  >
                    No sessions created yet
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-black text-sm">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                      {new Date(s.startDate).toLocaleDateString("en-IN")} —{" "}
                      {new Date(s.endDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">{statusBadge(s.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {s.status === "UPCOMING" && (
                        <button
                          onClick={() => handleActivateSession(s.id)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Zap className="h-3 w-3" /> Activate
                        </button>
                      )}
                      {s.status === "ACTIVE" && (
                        <button
                          onClick={() => handleCloseSession(s.id)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Lock className="h-3 w-3" /> Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Classes & Divisions ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black tracking-tight">
            Classes & Divisions
          </h2>
          <button
            onClick={() => setShowAddClass(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Class
          </button>
        </div>

        {showAddClass && (
          <div className="glass rounded-2xl p-6 border border-border/50 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. Class 1"
                className="bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                value={newClassOrder}
                onChange={(e) => setNewClassOrder(Number(e.target.value))}
                placeholder="Order"
                className="bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddClass}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </button>
              <button
                onClick={() => setShowAddClass(false)}
                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-bold hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {classes.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center text-muted-foreground/50 text-sm font-bold border-border/50">
              No classes created yet
            </div>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.id}
                className="glass rounded-2xl border border-border/50 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedClass(expandedClass === cls.id ? null : cls.id)
                  }
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedClass === cls.id ? (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-black text-sm">{cls.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                      {cls.divisions.length} division
                      {cls.divisions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>

                {expandedClass === cls.id && (
                  <div className="px-6 pb-4 border-t border-border/30">
                    <div className="flex flex-wrap gap-2 pt-4">
                      {cls.divisions.map((div) => (
                        <span
                          key={div.id}
                          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-sm font-bold"
                        >
                          {div.name}
                          <button
                            onClick={() => handleDeleteDivision(div.id)}
                            className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {showAddDivision === cls.id ? (
                        <div className="inline-flex items-center gap-2">
                          <input
                            value={newDivName}
                            onChange={(e) => setNewDivName(e.target.value)}
                            placeholder="e.g. A"
                            className="w-20 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            autoFocus
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddDivision(cls.id)
                            }
                          />
                          <button
                            onClick={() => handleAddDivision(cls.id)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddDivision(null);
                              setNewDivName("");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddDivision(cls.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 transition-colors"
                        >
                          <Plus className="h-3 w-3" /> Division
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {pendingConfirm && (
        <ConfirmDialog
          open={true}
          title={pendingConfirm.title}
          message={pendingConfirm.message}
          variant={pendingConfirm.variant}
          confirmText={pendingConfirm.confirmText}
          onConfirm={pendingConfirm.action}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
