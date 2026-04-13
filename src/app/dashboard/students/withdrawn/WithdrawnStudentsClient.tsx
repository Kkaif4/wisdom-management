"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { GraduationCap, ChevronRight, UserMinus } from "lucide-react";

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  status: string;
  enrollments?: {
    class: { name: string };
    division: { name: string };
    academicSession: { name: string };
    totalFeesAssigned: any;
    totalPaid: any;
  }[];
}

interface WithdrawnStudentsClientProps {
  initialStudents: any[];
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export function WithdrawnStudentsClient({
  initialStudents,
}: WithdrawnStudentsClientProps) {
  const [isPending] = useTransition();

  return (
    <div className="space-y-8 animate-fade-in mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Withdrawn Students
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <UserMinus className="h-4 w-4 text-rose-500" />
            Archive of students who have left or graduated
          </p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border-border/50 shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/20 border-b border-border/50">
                <th className="px-6 py-5">Student</th>
                <th className="px-6 py-5">Last Class</th>
                <th className="px-6 py-5">Last Session</th>
                <th className="px-6 py-5 text-right">Archival Due</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {initialStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <GraduationCap className="h-10 w-10 mb-4" />
                      <p className="text-sm font-bold tracking-tight">
                        No withdrawn student records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialStudents.map((s) => {
                  const lastEnrollment = s.enrollments?.[0];
                  const assigned = Number(
                    lastEnrollment?.totalFeesAssigned || 0,
                  );
                  const paid = Number(lastEnrollment?.totalPaid || 0);
                  const remaining = assigned - paid;

                  return (
                    <tr
                      key={s.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                          {s.name}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                          {s.admissionNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {lastEnrollment?.class?.name || "—"}
                        {lastEnrollment?.division?.name
                          ? ` - ${lastEnrollment.division.name}`
                          : ""}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {lastEnrollment?.academicSession?.name || "—"}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-mono font-black text-sm ${remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {fmt(remaining)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/students/${s.id}`}
                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
                        >
                          View Ledger <ChevronRight className="h-3 w-3" />
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
    </div>
  );
}
