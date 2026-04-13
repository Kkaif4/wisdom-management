"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  divisions: { id: string; name: string }[];
}

interface Session {
  id: string;
  name: string;
  status: string;
}

interface PromoteStudentDialogProps {
  onClose: () => void;
  onSuccess: () => void;
  selectedStudentIds: string[];
  currentClassId?: string;
  currentSessionId?: string;
}

export function PromoteStudentDialog({
  onClose,
  onSuccess,
  selectedStudentIds,
  currentClassId,
  currentSessionId,
}: PromoteStudentDialogProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  // Form state
  const [targetClassId, setTargetClassId] = useState("");
  const [targetDivisionId, setTargetDivisionId] = useState("");
  const [targetSessionId, setTargetSessionId] = useState("");
  const [newFees, setNewFees] = useState("");
  const [results, setResults] = useState<
    { studentId: string; success: boolean; error?: string }[] | null
  >(null);

  // Determine next class automatically
  useEffect(() => {
    if (classes.length > 0 && currentClassId) {
      const current = classes.find((c) => c.id === currentClassId);
      if (current) {
        // Find class with the next display order (or next name if no order)
        const sorted = [...classes].sort(
          (a, b) => (a as any).displayOrder - (b as any).displayOrder,
        );
        const currentIndex = sorted.findIndex((c) => c.id === currentClassId);
        const next = sorted[currentIndex + 1];
        if (next) {
          setTargetClassId(next.id);
        }
      }
    }
  }, [classes, currentClassId]);

  // Auto-select next session
  useEffect(() => {
    if (sessions.length > 0 && currentSessionId) {
      const activeOrUpcoming = sessions.filter(
        (s) => s.status === "ACTIVE" || s.status === "UPCOMING",
      );
      // Try to find a session that isn't the current one
      const nextSession = activeOrUpcoming.find(
        (s) => s.id !== currentSessionId,
      );
      if (nextSession) {
        setTargetSessionId(nextSession.id);
      }
    }
  }, [sessions, currentSessionId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/academic-sessions"),
      ]);
      setClasses(await cRes.json());
      setSessions(await sRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const targetDivisions =
    classes.find((c) => c.id === targetClassId)?.divisions || [];

  const handleBulkPromote = async () => {
    if (
      !targetClassId ||
      !targetDivisionId ||
      !targetSessionId ||
      selectedStudentIds.length === 0
    )
      return;
    setPromoting(true);
    setResults(null);
    try {
      const res = await fetch("/api/promotions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          targetClassId,
          targetDivisionId,
          targetSessionId,
          newFeesAssigned: newFees ? Number(newFees) : 0,
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
      if (!data.results?.some((r: any) => !r.success)) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
    setPromoting(false);
  };

  const successCount = results?.filter((r) => r.success).length || 0;
  const failCount = results?.filter((r) => !r.success).length || 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-3xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Bulk Promotion
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Transition Academic Cycle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-bold uppercase tracking-widest text-center">
                Initialising promotion toolkit…
              </p>
            </div>
          ) : results ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Promotion Outcome
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {successCount} Successes • {failCount} Failures
                  </p>
                </div>
                <div className="flex gap-2">
                  {failCount === 0 ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                  )}
                </div>
              </div>

              {failCount > 0 && (
                <div className="space-y-2">
                  {results
                    .filter((r) => !r.success)
                    .map((r, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20"
                      >
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-rose-600">
                          {r.error}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs font-bold text-amber-600 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Promoting {selectedStudentIds.length} student
                  {selectedStudentIds.length !== 1 ? "s" : ""} to a new academic
                  year.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Target Session
                  </label>
                  <select
                    value={targetSessionId}
                    onChange={(e) => setTargetSessionId(e.target.value)}
                    disabled={!!currentSessionId && !!targetSessionId}
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Session…</option>
                    {sessions
                      .filter(
                        (s) => s.status === "ACTIVE" || s.status === "UPCOMING",
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Target Class
                  </label>
                  <select
                    value={targetClassId}
                    onChange={(e) => {
                      setTargetClassId(e.target.value);
                      setTargetDivisionId("");
                    }}
                    disabled={!!currentClassId && !!targetClassId}
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Class…</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {currentClassId && targetClassId && (
                    <p className="text-[9px] font-bold text-primary uppercase tracking-tighter ml-1">
                      Locked to next class in sequence
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Target Division
                  </label>
                  <select
                    value={targetDivisionId}
                    onChange={(e) => setTargetDivisionId(e.target.value)}
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select Division…</option>
                    {targetDivisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    New Fees Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={newFees}
                      onChange={(e) => setNewFees(e.target.value)}
                      placeholder="Auto-assign fees…"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-8 pr-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-muted/30 border-t flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3.5 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
          >
            {results ? "Close" : "Cancel"}
          </button>
          {!results && (
            <button
              onClick={handleBulkPromote}
              disabled={
                promoting ||
                selectedStudentIds.length === 0 ||
                !targetClassId ||
                !targetDivisionId ||
                !targetSessionId
              }
              className="w-full sm:flex-[2] py-3.5 bg-primary text-primary-foreground font-black rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {promoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpCircle className="h-4 w-4" />
              )}
              Confirm Promotion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
