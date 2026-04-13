"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
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

export default function PromotionsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  // Form state
  const [sourceSessionId, setSourceSessionId] = useState("");
  const [sourceClassId, setSourceClassId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [targetDivisionId, setTargetDivisionId] = useState("");
  const [targetSessionId, setTargetSessionId] = useState("");
  const [newFees, setNewFees] = useState("");
  const [results, setResults] = useState<
    { studentId: string; success: boolean; error?: string }[] | null
  >(null);

  // Load students from source
  const [sourceStudents, setSourceStudents] = useState<
    { id: string; name: string; admissionNumber: string }[]
  >([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [cRes, sRes] = await Promise.all([
      fetch("/api/classes"),
      fetch("/api/academic-sessions"),
    ]);
    setClasses(await cRes.json());
    setSessions(await sRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchSourceStudents = useCallback(async () => {
    if (!sourceSessionId || !sourceClassId) return;
    setLoadingStudents(true);
    const params = new URLSearchParams({
      sessionId: sourceSessionId,
      classId: sourceClassId,
      status: "ACTIVE",
      l: "200",
    });
    const res = await fetch(`/api/enrollments?${params}`);
    const data = await res.json();
    const students = (data.data || []).map((e: any) => ({
      id: e.student.id,
      name: e.student.name,
      admissionNumber: e.student.admissionNumber,
    }));
    setSourceStudents(students);
    setSelectedStudents(students.map((s: any) => s.id));
    setLoadingStudents(false);
  }, [sourceSessionId, sourceClassId]);

  useEffect(() => {
    fetchSourceStudents();
  }, [fetchSourceStudents]);

  const targetDivisions =
    classes.find((c) => c.id === targetClassId)?.divisions || [];

  const handleBulkPromote = async () => {
    if (
      !targetClassId ||
      !targetDivisionId ||
      !targetSessionId ||
      selectedStudents.length === 0
    )
      return;
    setPromoting(true);
    setResults(null);
    try {
      const res = await fetch("/api/promotions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudents,
          targetClassId,
          targetDivisionId,
          targetSessionId,
          newFeesAssigned: newFees ? Number(newFees) : 0,
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    }
    setPromoting(false);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const successCount = results?.filter((r) => r.success).length || 0;
  const failCount = results?.filter((r) => !r.success).length || 0;

  return (
    <div className="space-y-8 animate-fade-in mb-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Student Promotions
        </h1>
        <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
          <ArrowUpCircle className="h-4 w-4 text-primary" /> Bulk promote
          students to the next class/session
        </p>
      </div>

      {/* Source Selection */}
      <div className="glass rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          Step 1: Select Source
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={sourceSessionId}
            onChange={(e) => setSourceSessionId(e.target.value)}
            className="bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Current Session…</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>
          <select
            value={sourceClassId}
            onChange={(e) => setSourceClassId(e.target.value)}
            className="bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Current Class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Selection */}
      <div className="glass rounded-2xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Step 2: Select Students{" "}
            {sourceStudents.length > 0 &&
              `(${selectedStudents.length}/${sourceStudents.length})`}
          </h3>
          {sourceStudents.length > 0 && (
            <button
              onClick={() =>
                setSelectedStudents(
                  selectedStudents.length === sourceStudents.length
                    ? []
                    : sourceStudents.map((s) => s.id),
                )
              }
              className="text-xs font-bold text-primary hover:underline"
            >
              {selectedStudents.length === sourceStudents.length
                ? "Deselect All"
                : "Select All"}
            </button>
          )}
        </div>

        {loadingStudents ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Fetching students…
            </p>
          </div>
        ) : sourceStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {sourceStudents.map((s) => (
              <label
                key={s.id}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all border ${selectedStudents.includes(s.id) ? "bg-primary/5 border-primary/20" : "bg-background border-border/50 hover:bg-muted/50"}`}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(s.id)}
                  onChange={() => toggleStudent(s.id)}
                  className="rounded"
                />
                <div>
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {s.admissionNumber}
                  </p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-border/30 rounded-xl bg-muted/5">
            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-muted-foreground/50">
              {!sourceSessionId || !sourceClassId
                ? "First, select a session and class in Step 1"
                : "No active students found in this class"}
            </p>
          </div>
        )}
      </div>

      {/* Target Selection */}
      <div className="glass rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          Step 3: Promotion Target
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={targetSessionId}
            onChange={(e) => setTargetSessionId(e.target.value)}
            className="bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Target Session…</option>
            {sessions
              .filter((s) => s.status === "ACTIVE" || s.status === "UPCOMING")
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
          <select
            value={targetClassId}
            onChange={(e) => {
              setTargetClassId(e.target.value);
              setTargetDivisionId("");
            }}
            className="bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Target Class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={targetDivisionId}
            onChange={(e) => setTargetDivisionId(e.target.value)}
            className="bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Target Division…</option>
            {targetDivisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={newFees}
            onChange={(e) => setNewFees(e.target.value)}
            placeholder="New Fees Amount"
            className="bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          onClick={handleBulkPromote}
          disabled={
            promoting ||
            selectedStudents.length === 0 ||
            !targetClassId ||
            !targetDivisionId ||
            !targetSessionId
          }
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {promoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpCircle className="h-4 w-4" />
          )}
          Promote {selectedStudents.length} Student
          {selectedStudents.length !== 1 ? "s" : ""}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="glass rounded-2xl border border-border/50 p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Promotion Results
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" /> {successCount} promoted
            </div>
            {failCount > 0 && (
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertCircle className="h-4 w-4" /> {failCount} failed
              </div>
            )}
          </div>
          {failCount > 0 && (
            <div className="space-y-1">
              {results
                .filter((r) => !r.success)
                .map((r, i) => (
                  <p key={i} className="text-xs text-rose-600 font-medium">
                    Student {r.studentId}: {r.error}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
