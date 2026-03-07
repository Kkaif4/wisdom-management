"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
  Users,
} from "lucide-react";
import { showToast } from "@/components/shared/Toast";

// --------------- Types ---------------
interface ParsedRow {
  name: string;
  class: string;
  totalFeesAssigned: number;
  totalPaid: number;
}

type Stage = "upload" | "loading" | "result";

interface SkippedItem {
  name: string;
  reason: string;
}

interface ImportResult {
  created: number;
  skipped: SkippedItem[];
}

// --------------- Constants ---------------
const REQUIRED_COLUMNS = [
  "Student name",
  "Class Name",
  "Total Fees Amount",
  "Paid Fees Amount",
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// --------------- Helpers ---------------
function generateTemplateCsv() {
  const header = REQUIRED_COLUMNS.join(",");
  const rows = [
    "Rahul Sharma,Class 5,30000,10000",
    "Aman Patel,Class 6,35000,5000",
    "Priya Singh,Class 7,40000,0",
  ].join("\n");
  return `${header}\n${rows}`;
}

function downloadTemplate() {
  const csv = generateTemplateCsv();
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// --------------- Component ---------------
interface BulkImportDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportDialog({
  onClose,
  onSuccess,
}: BulkImportDialogProps) {
  const [stage, setStage] = useState<Stage>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      showToast("File is too large. Maximum size is 5 MB.", "error");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xlsx"].includes(ext)) {
      showToast("Only .csv and .xlsx files are supported.", "error");
      return;
    }

    setFileName(file.name);
    setStage("loading"); // Immediately jump to loading state

    try {
      let raw: Record<string, string>[] = [];

      if (ext === "csv") {
        const { default: Papa } = await import("papaparse");
        const text = await file.text();
        const { data, errors } = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        });
        if (errors.length) {
          throw new Error("CSV parse error: " + errors[0].message);
        }
        raw = data;
      } else {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
        });
      }

      if (raw.length === 0) {
        throw new Error("The file appears to be empty.");
      }

      // Check required columns
      const headers = Object.keys(raw[0]);
      const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
      if (missing.length > 0) {
        throw new Error(`Missing required columns: ${missing.join(", ")}`);
      }

      // Validate rows & check duplicates on client side
      const validRows: ParsedRow[] = [];
      const skipped: SkippedItem[] = [];
      const seenNames = new Set<string>();

      raw.forEach((row, i) => {
        const name = row["Student name"]?.trim();
        const cls = row["Class Name"]?.trim();
        const rawFees = row["Total Fees Amount"]?.trim();
        const rawPaid = row["Paid Fees Amount"]?.trim() || "0";

        if (!name) {
          skipped.push({ name: `Row ${i + 1}`, reason: "Name is missing" });
          return;
        }

        const nameLower = name.toLowerCase();
        if (seenNames.has(nameLower)) {
          skipped.push({ name, reason: "Duplicate in file" });
          return;
        }

        if (!cls) {
          skipped.push({ name, reason: "Class is missing" });
          return;
        }

        const totalFeesAssigned = Number(rawFees);
        if (!rawFees || isNaN(totalFeesAssigned) || totalFeesAssigned < 0) {
          skipped.push({ name, reason: "Invalid total fees" });
          return;
        }

        const totalPaid = Number(rawPaid);
        if (isNaN(totalPaid) || totalPaid < 0) {
          skipped.push({ name, reason: "Invalid paid fees" });
          return;
        }

        if (totalPaid > totalFeesAssigned) {
          skipped.push({ name, reason: "Paid fees exceed total fees" });
          return;
        }

        seenNames.add(nameLower);
        validRows.push({
          name,
          class: cls,
          totalFeesAssigned,
          totalPaid,
        });
      });

      // Prepare API call
      let apiCreated = 0;
      let apiSkipped: SkippedItem[] = [];

      const artificialDelay = new Promise((resolve) =>
        setTimeout(resolve, 3000),
      );

      if (validRows.length > 0) {
        const apiPromise = fetch("/api/dashboard/students/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: validRows }),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Failed to import students");
          return data;
        });

        // Wait for both the artificial 3s delay AND the API response
        const [apiData] = await Promise.all([apiPromise, artificialDelay]);

        apiCreated = apiData.created || 0;
        apiSkipped = apiData.skipped || [];
      } else {
        // No valid rows, but still wait 3 seconds for UX consistency
        await artificialDelay;
      }

      setResult({
        created: apiCreated,
        skipped: [...skipped, ...apiSkipped],
      });
      setStage("result");
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred", "error");
      setStage("upload"); // Reset if catastrophic early error
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input value so same file can be selected again if needed
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFile],
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[50] animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-3xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Bulk Student Import
              </h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {stage === "upload" && "Upload CSV or Excel file"}
                {stage === "loading" && `Processing · ${fileName}`}
                {stage === "result" && "Import Complete"}
              </p>
            </div>
          </div>
          {stage !== "loading" && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Stage: Upload */}
        {stage === "upload" && (
          <div className="p-8 space-y-6 grow flex flex-col">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => inputRef.current?.click()}
              className={`flex-1 relative flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-3xl p-16 cursor-pointer transition-all ${
                dragOver
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border/50 bg-muted/10 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <div
                className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all ${dragOver ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"}`}
              >
                <Upload className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or{" "}
                  <span className="text-primary font-bold underline underline-offset-2">
                    click to select
                  </span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4 font-medium uppercase tracking-widest">
                  Supported: .CSV, .XLSX · up to 5 MB
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Required Headers
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  Student name, Class Name, Total Fees Amount, Paid Fees Amount
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTemplate();
                }}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
              >
                <Download className="h-4 w-4" />
                Template
              </button>
            </div>
          </div>
        )}

        {/* Stage: Loading */}
        {stage === "loading" && (
          <div className="p-16 grow flex flex-col items-center justify-center gap-6 text-center animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Loader2 className="h-16 w-16 text-primary animate-spin relative" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground mb-2">
                Analyzing File...
              </p>
              <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                Parsing records, validating fields, and securely saving students
                to the database.
              </p>
            </div>
          </div>
        )}

        {/* Stage: Result */}
        {stage === "result" && result && (
          <div className="flex flex-col h-full max-h-[70vh]">
            <div className="p-8 pb-6 flex flex-col items-center justify-center text-center shrink-0">
              {result.created > 0 ? (
                <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                  <AlertCircle className="h-10 w-10" />
                </div>
              )}
              <h3 className="text-2xl font-black text-foreground">
                {result.created} Student{result.created !== 1 ? "s" : ""}{" "}
                Imported
              </h3>
              {result.skipped.length > 0 && (
                <p className="text-sm font-medium text-rose-500 mt-2 bg-rose-500/10 px-3 py-1 rounded-full">
                  {result.skipped.length} record
                  {result.skipped.length !== 1 ? "s" : ""} skipped due to errors
                </p>
              )}
            </div>

            {/* Skipped Table (Scrollable inside flex) */}
            {result.skipped.length > 0 && (
              <div className="flex-1 overflow-y-auto px-8 pb-6 min-h-[150px]">
                <div className="bg-muted/30 rounded-2xl border border-border/50 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Record / Name
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Reason Skipped
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {result.skipped.map((s, i) => (
                        <tr
                          key={i}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {s.name}
                          </td>
                          <td className="px-4 py-3 text-rose-500">
                            {s.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 border-t bg-muted/30 flex gap-3 shrink-0">
              {result.skipped.length > 0 && (
                <button
                  onClick={() => setStage("upload")}
                  className="flex-1 py-3.5 bg-card text-foreground font-bold rounded-2xl border border-border/50 shadow-sm transition-all hover:bg-muted active:scale-95"
                >
                  Upload Another
                </button>
              )}
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                {result.created > 0 ? "Finish & View Students" : "Close"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
