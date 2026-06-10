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
// --------------- Types ---------------
interface ParsedRow {
  name: string;
  grNo: string;
  rollNumber?: string;
  className: string;
  divisionName: string;
  totalFeesAssigned: number;
  discount: number;
  totalPaid: number;

  // Demographics
  dateOfBirth?: string;
  gender?: string;
  placeOfBirth?: string;
  aadharNo?: string;
  lastSchoolAttended?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  nationality?: string;

  // Parents
  fatherName?: string;
  fatherQualification?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherQualification?: string;
  motherOccupation?: string;
  receivedApplicationOf?: string;

  // Contacts
  contactNumber?: string;
  telNo?: string;
  email?: string;
  address?: string;
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
  "G.R. No",
  "Student Name",
  "Class Name",
  "Division",
  "Total Fees",
  "Paid Fees",
] as const;

const OPTIONAL_COLUMNS = [
  "Fee Discount",
  "Roll Number",
  "Gender",
  "Date of Birth",
  "Place of Birth",
  "Aadhar No",
  "Religion",
  "Caste",
  "Sub Caste",
  "Nationality",
  "Father Name",
  "Father Qualification",
  "Father Occupation",
  "Mother Name",
  "Mother Qualification",
  "Mother Occupation",
  "Mobile No",
  "Tel No",
  "Email",
  "Address",
  "Received Application Of",
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// --------------- Helpers ---------------
function generateTemplateCsv() {
  const header = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(",");
  const rows = [
    "GR-2026-001,Rahul Sharma,Class 5,A,30000,10000,2000,15,Male,2015-05-15,Mumbai,123456789012,Hindu,General,None,Indian,Vijay Sharma,Graduate,Business,Rita Sharma,Graduate,Homemaker,9876543210,022-123456,rahul@mail.com,123 Main St Mumbai,Online",
    "GR-2026-002,Aman Patel,Class 6,B,35000,5000,0,10,Male,2014-08-20,Surat,987654321098,Hindu,OBC,None,Indian,Kiran Patel,Graduate,Service,Sonal Patel,Undergraduate,Homemaker,8765432109,,aman@mail.com,456 Park St Surat,Referral",
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
        const ExcelJS = await import("exceljs");
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
          throw new Error("The Excel file appears to be empty or corrupted.");
        }

        const rows: Record<string, string>[] = [];
        const headerRow = worksheet.getRow(1);
        const headers: string[] = [];

        headerRow.eachCell((cell) => {
          headers.push(cell.text.trim());
        });

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip headers
          const rowData: Record<string, string> = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.text.trim();
            }
          });
          if (Object.keys(rowData).length > 0) {
            rows.push(rowData);
          }
        });
        raw = rows;
      }

      if (raw.length === 0) {
        throw new Error("The file appears to be empty.");
      }

      // Check required columns (supporting legacy Admission No as fallback)
      const headers = Object.keys(raw[0]);
      const hasGrNo =
        headers.includes("G.R. No") || headers.includes("Admission No");
      const requiredChecks = REQUIRED_COLUMNS.filter((c) => c !== "G.R. No");
      const missing: string[] = requiredChecks.filter(
        (col) => !headers.includes(col),
      );
      if (!hasGrNo) {
        missing.push("G.R. No");
      }
      if (missing.length > 0) {
        throw new Error(`Missing required columns: ${missing.join(", ")}`);
      }

      // Validate rows & check duplicates on client side
      const validRows: ParsedRow[] = [];
      const skipped: SkippedItem[] = [];
      const seenNames = new Set<string>();

      raw.forEach((row, i) => {
        const admNo = (row["G.R. No"] || row["Admission No"])?.trim();
        const name = row["Student Name"]?.trim();
        const cls = row["Class Name"]?.trim();
        const div = row["Division"]?.trim() || "A";
        const rawFees = row["Total Fees"]?.trim();
        const rawPaid = row["Paid Fees"]?.trim() || "0";
        const discount = Number(row["Fee Discount"] || row["Discount"] || "0");

        // Optional/Demographics
        const rollNumber = row["Roll Number"]?.trim();
        const gender = row["Gender"]?.trim();
        const dateOfBirth = row["Date of Birth"]?.trim();
        const placeOfBirth = row["Place of Birth"]?.trim();
        const aadharNo = row["Aadhar No"]?.trim();
        const lastSchoolAttended = row["Last School Attended"]?.trim();
        const religion = row["Religion"]?.trim();
        const caste = row["Caste"]?.trim();
        const subCaste = row["Sub Caste"]?.trim() || row["Sub-Caste"]?.trim();
        const nationality = row["Nationality"]?.trim();
        const fatherName = row["Father Name"]?.trim();
        const fatherQualification = row["Father Qualification"]?.trim();
        const fatherOccupation = row["Father Occupation"]?.trim();
        const motherName = row["Mother Name"]?.trim();
        const motherQualification = row["Mother Qualification"]?.trim();
        const motherOccupation = row["Mother Occupation"]?.trim();
        const contactNumber =
          row["Mobile No"]?.trim() || row["Contact Number"]?.trim();
        const telNo = row["Tel No"]?.trim() || row["Tel. No."]?.trim();
        const email = row["Email"]?.trim();
        const address =
          row["Address"]?.trim() || row["Residential Address"]?.trim();
        const receivedApplicationOf = row["Received Application Of"]?.trim();

        if (!name) {
          skipped.push({ name: `Row ${i + 1}`, reason: "Name is missing" });
          return;
        }
        if (!admNo) {
          skipped.push({ name, reason: "G.R. No is missing" });
          return;
        }

        const admLower = admNo.toLowerCase();
        if (seenNames.has(admLower)) {
          skipped.push({ name, reason: "Duplicate G.R. No in file" });
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

        if (totalPaid > totalFeesAssigned - discount) {
          skipped.push({
            name,
            reason: "Paid fees exceed net fees (Total - Discount)",
          });
          return;
        }

        if (aadharNo) {
          if (!/^\d{12}$/.test(aadharNo)) {
            skipped.push({
              name,
              reason: "Aadhar number must be a 12-digit number",
            });
            return;
          }
        }

        seenNames.add(admLower);
        validRows.push({
          name,
          grNo: admNo,
          rollNumber,
          className: cls,
          divisionName: div,
          totalFeesAssigned,
          discount,
          totalPaid,
          dateOfBirth,
          gender,
          placeOfBirth,
          aadharNo,
          lastSchoolAttended,
          religion,
          caste,
          subCaste,
          nationality,
          fatherName,
          fatherQualification,
          fatherOccupation,
          motherName,
          motherQualification,
          motherOccupation,
          contactNumber,
          telNo,
          email,
          address,
          receivedApplicationOf,
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
        <div className="p-4 sm:p-6 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Bulk Student Import
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
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
          <div className="p-4 sm:p-6 md:p-8 space-y-6 grow flex flex-col">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => inputRef.current?.click()}
              className={`flex-1 relative flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-3xl p-8 sm:p-12 md:p-16 cursor-pointer transition-all min-h-[200px] sm:min-h-[250px] ${
                dragOver
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border/50 bg-muted/10 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <div
                className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center transition-all ${dragOver ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"}`}
              >
                <Upload className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              </div>
              <div className="text-center px-4">
                <p className="text-base sm:text-lg font-bold text-foreground">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or{" "}
                  <span className="text-primary font-bold underline underline-offset-2">
                    click to select
                  </span>
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-4 font-medium uppercase tracking-widest">
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 pt-2">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Required Headers
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                  Admission No, Student Name, Class Name, Division, Total Fees,
                  Paid Fees
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTemplate();
                }}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:underline hover:text-primary/80 transition-colors shrink-0"
              >
                <Download className="h-4 w-4" />
                Template
              </button>
            </div>
          </div>
        )}

        {/* Stage: Loading */}
        {stage === "loading" && (
          <div className="p-8 sm:p-12 md:p-16 grow flex flex-col items-center justify-center gap-6 text-center animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Loader2 className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary animate-spin relative" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-foreground mb-2">
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
            <div className="p-6 sm:p-8 pb-4 sm:pb-6 flex flex-col items-center justify-center text-center shrink-0">
              {result.created > 0 ? (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 sm:mb-6">
                  <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 sm:mb-6">
                  <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {result.created} Student{result.created !== 1 ? "s" : ""}{" "}
                Imported
              </h3>
              {result.skipped.length > 0 && (
                <p className="text-xs sm:text-sm font-medium text-rose-500 mt-2 bg-rose-500/10 px-3 py-1 rounded-full">
                  {result.skipped.length} record
                  {result.skipped.length !== 1 ? "s" : ""} skipped due to errors
                </p>
              )}
            </div>

            {/* Skipped Table (Scrollable inside flex) */}
            {result.skipped.length > 0 && (
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 min-h-[150px]">
                <div className="bg-muted/30 rounded-2xl border border-border/50 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 border-b border-border/50">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Record / Name
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                          <td className="px-3 sm:px-4 py-3 font-medium text-foreground">
                            {s.name}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-rose-500">
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
            <div className="p-4 sm:p-6 border-t bg-muted/30 flex flex-col sm:flex-row gap-3 shrink-0">
              {result.skipped.length > 0 && (
                <button
                  onClick={() => setStage("upload")}
                  className="w-full sm:flex-1 py-3.5 bg-card text-foreground font-bold rounded-2xl border border-border/50 shadow-sm transition-all hover:bg-muted active:scale-95"
                >
                  Upload Another
                </button>
              )}
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full sm:flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
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
