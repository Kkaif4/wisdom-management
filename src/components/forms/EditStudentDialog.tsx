"use client";

import React, { useState } from "react";
import { X, User, Loader2, Save } from "lucide-react";
import { showToast } from "@/components/shared/Toast";

interface EditStudentDialogProps {
  student: {
    id: string;
    grNo: string;
    name: string;
    rollNumber?: string | null;
    dateOfBirth?: string | Date | null;
    gender?: string | null;
    placeOfBirth?: string | null;
    aadharNo?: string | null;
    lastSchoolAttended?: string | null;
    religion?: string | null;
    caste?: string | null;
    subCaste?: string | null;
    nationality?: string | null;
    fatherName?: string | null;
    fatherQualification?: string | null;
    fatherOccupation?: string | null;
    motherName?: string | null;
    motherQualification?: string | null;
    motherOccupation?: string | null;
    contactNumber?: string | null;
    telNo?: string | null;
    email?: string | null;
    address?: string | null;
    receivedApplicationOf?: string | null;
  };
  onSuccess?: () => void;
  onClose: () => void;
}

type TabType = "academic" | "personal" | "family";

const formatDate = (dateInput: any) => {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export function EditStudentDialog({
  student,
  onSuccess,
  onClose,
}: EditStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("academic");
  const [formData, setFormData] = useState({
    grNo: student.grNo || "",
    name: student.name || "",
    rollNumber: student.rollNumber || "",
    gender: student.gender || "",
    dateOfBirth: formatDate(student.dateOfBirth),
    placeOfBirth: student.placeOfBirth || "",
    aadharNo: student.aadharNo || "",
    lastSchoolAttended: student.lastSchoolAttended || "",
    religion: student.religion || "",
    caste: student.caste || "",
    subCaste: student.subCaste || "",
    nationality: student.nationality || "Indian",
    fatherName: student.fatherName || "",
    fatherQualification: student.fatherQualification || "",
    fatherOccupation: student.fatherOccupation || "",
    motherName: student.motherName || "",
    motherQualification: student.motherQualification || "",
    motherOccupation: student.motherOccupation || "",
    contactNumber: student.contactNumber || "",
    telNo: student.telNo || "",
    email: student.email || "",
    address: student.address || "",
    receivedApplicationOf: student.receivedApplicationOf || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side Aadhar validation (optional, but if filled, must be 12 digits)
    if (formData.aadharNo) {
      const aadhar = formData.aadharNo.trim();
      if (aadhar && !/^\d{12}$/.test(aadhar)) {
        showToast("Aadhar Number must be exactly 12 digits", "error");
        setActiveTab("personal");
        return;
      }
    }

    if (!formData.grNo || !formData.name) {
      showToast("G.R. No and Name are required", "error");
      setActiveTab("academic");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update student");
      }

      showToast("Student profile updated successfully", "success");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-3xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  Edit Student Profile
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Update demographic &amp; parent details
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

          {/* Navigation Tabs */}
          <div className="flex border-b bg-muted/10 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("academic")}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === "academic"
                  ? "border-primary text-primary bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/5"
              }`}
            >
              Academic
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === "personal"
                  ? "border-primary text-primary bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/5"
              }`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("family")}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === "family"
                  ? "border-primary text-primary bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/5"
              }`}
            >
              Family &amp; Contact
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 md:p-8 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {activeTab === "academic" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* G.R. No & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      G.R. No. <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      placeholder="e.g. GR-2026-001"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.grNo}
                      onChange={(e) =>
                        setFormData({ ...formData, grNo: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      placeholder="e.g. Sharma Rahul Vijay"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div className="space-y-1.5 max-w-xs">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Roll Number
                  </label>
                  <input
                    placeholder="e.g. 15"
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={formData.rollNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, rollNumber: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {activeTab === "personal" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Gender, DOB, Place of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Gender
                    </label>
                    <select
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    >
                      <option value="">Select…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfBirth: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Place of Birth
                    </label>
                    <input
                      placeholder="City/Town"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.placeOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, placeOfBirth: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Aadhar No & Nationality & Religion */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Aadhar No.
                    </label>
                    <input
                      placeholder="12-digit number"
                      maxLength={12}
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.aadharNo}
                      onChange={(e) =>
                        setFormData({ ...formData, aadharNo: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Nationality
                    </label>
                    <input
                      placeholder="e.g. Indian"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.nationality}
                      onChange={(e) =>
                        setFormData({ ...formData, nationality: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Religion
                    </label>
                    <input
                      placeholder="e.g. Hindu/Muslim"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.religion}
                      onChange={(e) =>
                        setFormData({ ...formData, religion: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Caste & Sub-Caste & Last School */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Caste
                    </label>
                    <input
                      placeholder="Caste category"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.caste}
                      onChange={(e) =>
                        setFormData({ ...formData, caste: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Sub-Caste
                    </label>
                    <input
                      placeholder="Sub-caste"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.subCaste}
                      onChange={(e) =>
                        setFormData({ ...formData, subCaste: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Last School Attended
                    </label>
                    <input
                      placeholder="Previous School Name"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.lastSchoolAttended}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastSchoolAttended: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "family" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Father details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-4 border-border/30">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Father / Guardian Name
                    </label>
                    <input
                      placeholder="Full Name"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.fatherName}
                      onChange={(e) =>
                        setFormData({ ...formData, fatherName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Father Qualification
                    </label>
                    <input
                      placeholder="e.g. Graduate"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.fatherQualification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fatherQualification: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Father Occupation
                    </label>
                    <input
                      placeholder="e.g. Business"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.fatherOccupation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fatherOccupation: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Mother details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-4 border-border/30">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Mother Name
                    </label>
                    <input
                      placeholder="Full Name"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.motherName}
                      onChange={(e) =>
                        setFormData({ ...formData, motherName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Mother Qualification
                    </label>
                    <input
                      placeholder="e.g. Postgraduate"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.motherQualification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          motherQualification: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Mother Occupation
                    </label>
                    <input
                      placeholder="e.g. Homemaker"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.motherOccupation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          motherOccupation: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Contact numbers, Email, Received Application */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Mobile No.
                    </label>
                    <input
                      placeholder="10-digit number"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.contactNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Tel. No.
                    </label>
                    <input
                      placeholder="Landline"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.telNo}
                      onChange={(e) =>
                        setFormData({ ...formData, telNo: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. name@domain.com"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Application Source
                    </label>
                    <input
                      placeholder="Received App. Of"
                      className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.receivedApplicationOf}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          receivedApplicationOf: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Residential Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Full residential address details..."
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 bg-muted/30 border-t flex flex-col sm:flex-row gap-3 shrink-0 justify-between items-center">
            {/* Tab navigation indicators */}
            <div className="flex gap-1.5 mb-2 sm:mb-0">
              <span
                className={`h-2 w-2 rounded-full transition-all ${
                  activeTab === "academic" ? "w-4 bg-primary" : "bg-muted-foreground/35"
                }`}
              />
              <span
                className={`h-2 w-2 rounded-full transition-all ${
                  activeTab === "personal" ? "w-4 bg-primary" : "bg-muted-foreground/35"
                }`}
              />
              <span
                className={`h-2 w-2 rounded-full transition-all ${
                  activeTab === "family" ? "w-4 bg-primary" : "bg-muted-foreground/35"
                }`}
              />
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
              >
                Cancel
              </button>
              {activeTab !== "family" ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(activeTab === "academic" ? "personal" : "family")
                  }
                  className="flex-1 sm:flex-none px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-2xl transition-all hover:bg-secondary/80"
                >
                  Next Section
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
