"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, UserPlus, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { AddStudentDialog } from "./AddStudentDialog";

interface Student {
  id: string;
  name: string;
  class: string;
}

interface StudentSearchSelectProps {
  students: Student[];
  value: string;
  onChange: (value: string) => void;
  onStudentCreated?: (student: Student) => void;
}

export function StudentSearchSelect({
  students,
  value,
  onChange,
  onStudentCreated,
}: StudentSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.class.toLowerCase().includes(q),
    );
  }, [students, search]);

  const selectedStudent = students.find((s) => s.id === value);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-muted/20 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-left"
        >
          <span
            className={
              selectedStudent ? "text-foreground" : "text-muted-foreground"
            }
          >
            {selectedStudent
              ? `${selectedStudent.name} (${selectedStudent.class})`
              : "Search or select student..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border shadow-2xl rounded-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 border-b bg-muted/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="Type to search..."
                  className="w-full bg-background border border-border/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // prevent form submission
                      if (filteredStudents.length > 0) {
                        onChange(filteredStudents[0].id);
                        setOpen(false);
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto p-1.5 scrollbar-hide">
              {filteredStudents.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    No student found
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        onChange(s.id);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                        value === s.id
                          ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                          : "text-foreground hover:bg-muted font-medium"
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span>{s.name}</span>
                        <span
                          className={`text-[10px] uppercase tracking-wider ${value === s.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          {s.class}
                        </span>
                      </div>
                      {value === s.id && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
