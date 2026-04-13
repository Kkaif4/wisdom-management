"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { showToast } from "@/components/shared/Toast";

interface ClassItem {
  id: string;
  name: string;
  divisions: { id: string; name: string }[];
}

interface AddStudentDialogProps {
  onSuccess?: (student: any) => void;
  onClose: () => void;
}

export function AddStudentDialog({
  onSuccess,
  onClose,
}: AddStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [formData, setFormData] = useState({
    admissionNumber: "",
    name: "",
    classId: "",
    divisionId: "",
    totalFeesAssigned: "",
    fatherName: "",
    contactNumber: "",
  });

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch(console.error);
  }, []);

  const selectedClass = classes.find((c) => c.id === formData.classId);
  const divisions = selectedClass?.divisions || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionNumber: formData.admissionNumber,
          name: formData.name,
          classId: formData.classId,
          divisionId: formData.divisionId,
          totalFeesAssigned: formData.totalFeesAssigned
            ? Number(formData.totalFeesAssigned)
            : 0,
          fatherName: formData.fatherName || undefined,
          contactNumber: formData.contactNumber || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");

      showToast("Student registered & enrolled successfully", "success");
      onSuccess?.(data);
      onClose();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-3xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  Add New Student
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Register & Enroll
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

          <div className="p-4 sm:p-6 md:p-8 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {/* Admission Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Admission No.
              </label>
              <input
                required
                autoFocus
                placeholder="e.g. WS001"
                className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.admissionNumber}
                onChange={(e) =>
                  setFormData({ ...formData, admissionNumber: e.target.value })
                }
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Full Name
              </label>
              <input
                required
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Class & Division */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Class
                </label>
                <select
                  required
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.classId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      classId: e.target.value,
                      divisionId: "",
                    })
                  }
                >
                  <option value="">Select…</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Division
                </label>
                <select
                  required
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.divisionId}
                  onChange={(e) =>
                    setFormData({ ...formData, divisionId: e.target.value })
                  }
                  disabled={!formData.classId}
                >
                  <option value="">Select…</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fees */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Annual Fees
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-8 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.totalFeesAssigned}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalFeesAssigned: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Guardian */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Father&apos;s Name
                </label>
                <input
                  placeholder="Optional"
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.fatherName}
                  onChange={(e) =>
                    setFormData({ ...formData, fatherName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Contact
                </label>
                <input
                  placeholder="Optional"
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-muted/30 border-t flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3.5 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-[2] py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering…
                </>
              ) : (
                "Register & Enroll"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
