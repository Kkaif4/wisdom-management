import React from "react";
import { DocumentLayout } from "../components/DocumentLayout";
import { formatDate } from "../utils/formatters";

// Number-to-word conversions for Date of Birth
const numToWords: Record<number, string> = {
  1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth', 6: 'Sixth', 7: 'Seventh', 8: 'Eighth', 9: 'Ninth', 10: 'Tenth',
  11: 'Eleventh', 12: 'Twelfth', 13: 'Thirteenth', 14: 'Fourteenth', 15: 'Fifteenth', 16: 'Sixteenth', 17: 'Seventeenth',
  18: 'Eighteenth', 19: 'Nineteenth', 20: 'Twentieth', 21: 'Twenty-First', 22: 'Twenty-Second', 23: 'Twenty-Third',
  24: 'Twenty-Fourth', 25: 'Twenty-Fifth', 26: 'Twenty-Sixth', 27: 'Twenty-Seventh', 28: 'Twenty-Eighth', 29: 'Twenty-Ninth',
  30: 'Thirtieth', 31: 'Thirty-First'
};

const monthToWords: Record<number, string> = {
  0: 'January', 1: 'February', 2: 'March', 3: 'April', 4: 'May', 5: 'June',
  6: 'July', 7: 'August', 8: 'September', 9: 'October', 10: 'November', 11: 'December'
};

const yearToWords = (year: number): string => {
  if (year === 2012) return "Two Thousand Twelve";
  const thousands = Math.floor(year / 1000);
  const remainder = year % 1000;
  if (thousands === 2) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (remainder < 20) {
      return `Two Thousand ${ones[remainder]}`.trim();
    } else {
      const tenDigit = Math.floor(remainder / 10);
      const unitDigit = remainder % 10;
      return `Two Thousand ${tens[tenDigit]} ${ones[unitDigit]}`.trim();
    }
  }
  return year.toString();
};

export function getDOBInWords(dateVal: Date | string | null | undefined): string {
  if (!dateVal) return "---";
  const dateObj = new Date(dateVal);
  if (isNaN(dateObj.getTime())) return "---";
  const dayWord = numToWords[dateObj.getDate()] || dateObj.getDate().toString();
  const monthWord = monthToWords[dateObj.getMonth()] || "";
  const yearWord = yearToWords(dateObj.getFullYear());
  return `${dayWord} of ${monthWord}, ${yearWord}`;
}

export function formatDobNumerical(dateVal: Date | string | null | undefined): string {
  if (!dateVal) return "---";
  const dateObj = new Date(dateVal);
  if (isNaN(dateObj.getTime())) return "---";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(dateObj.getDate()).padStart(2, '0')}-${months[dateObj.getMonth()]}-${dateObj.getFullYear()}`;
}

interface TCTemplateProps {
  student: {
    grNo: string;
    name: string;
    rollNumber: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    placeOfBirth: string | null;
    aadharNo: string | null;
    lastSchoolAttended: string | null;
    religion: string | null;
    caste: string | null;
    subCaste: string | null;
    nationality: string | null;
    fatherName: string | null;
    fatherQualification: string | null;
    fatherOccupation: string | null;
    motherName: string | null;
    motherQualification: string | null;
    motherOccupation: string | null;
    receivedApplicationOf: string | null;
    contactNumber: string | null;
    telNo: string | null;
    email: string | null;
    address: string | null;
    status: string;
  };
  organizationName: string;
  className?: string;
  divisionName?: string;
  enrollmentDate?: string;
}

export const TransferCertificateTemplate: React.FC<{
  data: TCTemplateProps;
  mode?: "screen" | "print";
}> = ({ data }) => {
  const { student, organizationName } = data;

  const fatherInfo = [student.fatherQualification, student.fatherOccupation].filter(Boolean).join(", ");
  const motherInfo = [student.motherQualification, student.motherOccupation].filter(Boolean).join(", ");
  const currentClassDisplay = data.className ? `Class ${data.className}${data.divisionName ? ` - ${data.divisionName}` : ""}` : "---";

  const dobNumerical = formatDobNumerical(student.dateOfBirth);
  const dobWords = getDOBInWords(student.dateOfBirth);

  const admissionInfoDisplay = data.enrollmentDate
    ? `${formatDobNumerical(data.enrollmentDate)} in ${data.className ? `Grade ${data.className}` : ""}`
    : "---";

  const tcNumber = `TC/${new Date().getFullYear()}/${student.grNo}`;

  return (
    <DocumentLayout pageSize="A4" showHeader={false} showFooter={false}>
      <div className="w-full h-full flex flex-col justify-between text-slate-900 bg-white select-none">

        {/* Certificate Style Setup */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:wght@300;400;500;700&display=swap');
          .cert-font-title { font-family: 'Cinzel', serif; }
          .cert-font-serif { font-family: 'Playfair Display', serif; }
          .cert-font-handwritten { font-family: 'Great Vibes', cursive; }
          .cert-border-double { border: 4px double #1e3a8a; padding: 12px; height: 100%; position: relative; }
          .cert-border-outer { border: 2px solid #1e3a8a; padding: 6px; height: 100%; }
          .cert-watermark {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            opacity: 0.05; font-size: 5rem; font-weight: 900;
            letter-spacing: 0.5rem; pointer-events: none; z-index: 0; white-space: nowrap;
          }
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            #student-tc-print, #student-tc-print > div {
              width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-height: 297mm !important;
              padding: 10mm !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              background: white !important;
            }
          }
        ` }} />

        <div className="cert-border-outer flex-1 flex flex-col justify-between h-full">
          <div className="cert-border-double flex flex-col justify-between flex-1">

            {/* Watermark */}
            <div className="cert-watermark">WISDOM SCHOOL</div>

            {/* Header Block */}
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b-2 pb-4 border-blue-900">
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center border rounded-full bg-slate-50 border-slate-350 shadow-sm">
                  <svg className="w-11 h-11 text-blue-900" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>

                <div className="text-center flex-1 px-4">
                  <h2 className="cert-font-title text-xl font-extrabold tracking-wide text-blue-900 uppercase">
                    {organizationName}
                  </h2>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                    Official Student Academic Record System
                  </p>
                </div>

                <div className="w-16 h-16 text-right flex flex-col justify-center text-xs">
                  <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mb-1">
                    Status
                  </div>
                  <div className="font-black text-emerald-700 bg-emerald-50 rounded border border-emerald-250 px-1 py-0.5 text-center uppercase tracking-wide text-[9px]">
                    {student.status}
                  </div>
                </div>
              </div>

              {/* Document Header Identifier */}
              <div className="text-center my-4 relative">
                <span className="absolute left-0 right-0 top-1/2 border-t-2 border-amber-600 opacity-20 -z-10"></span>
                <h3 className="cert-font-title text-base font-bold tracking-widest text-amber-800 bg-white px-6 inline-block uppercase">
                  School Leaving Certificate
                </h3>
              </div>

              {/* Registration Block */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold mb-4 pb-2.5 border-b border-dashed border-slate-300">
                <div className="text-left flex items-center gap-1">
                  <span className="text-slate-500">Certificate No:</span>
                  <span className="font-mono text-slate-800 tracking-wider">{tcNumber}</span>
                </div>
                <div className="text-center flex justify-center items-center gap-1">
                  <span className="text-slate-500">G.R. No:</span>
                  <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                    {student.grNo}
                  </span>
                </div>
                <div className="text-right flex justify-end items-center gap-1">
                  <span className="text-slate-500">Issue Date:</span>
                  <span className="font-mono text-slate-800">{formatDate(new Date())}</span>
                </div>
              </div>

              {/* Certificate Core Body */}
              <div className="text-[11px] text-slate-855 space-y-2.5 leading-relaxed relative z-10">

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">1. Name of Pupil:</span>
                  <div className="col-span-8 font-bold text-slate-900 text-xs cert-font-serif tracking-wide border-b-2 border-slate-900 px-1 flex justify-between uppercase">
                    <span>{student.name}</span>
                    {student.rollNumber && (
                      <span className="text-[10px] font-normal text-slate-400 italic">Roll No: {student.rollNumber}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">2. Father's / Guardian's Name:</span>
                  <div className="col-span-8 font-semibold text-slate-900 border-b-2 border-slate-900 px-1 uppercase">
                    {student.fatherName || "---"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">3. Father's Qualification / Occ.:</span>
                  <div className="col-span-8 text-slate-700 border-b-2 border-slate-900 px-1 italic">
                    {fatherInfo || "---"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">4. Mother's Name:</span>
                  <div className="col-span-8 font-semibold text-slate-900 border-b-2 border-slate-900 px-1 uppercase">
                    {student.motherName || "---"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">5. Mother's Qualification / Occ.:</span>
                  <div className="col-span-8 text-slate-700 border-b-2 border-slate-900 px-1 italic">
                    {motherInfo || "---"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 pb-0.5 border-b border-dotted border-slate-300">
                  <div className="col-span-4 flex items-end">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">6. Nationality:</span>
                    <div className="flex-1 font-semibold text-slate-955 border-b-2 border-slate-900 px-1 text-center">
                      {student.nationality || "Indian"}
                    </div>
                  </div>
                  <div className="col-span-4 flex items-end">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">7. Religion:</span>
                    <div className="flex-1 font-semibold text-slate-955 border-b-2 border-slate-900 px-1 text-center">
                      {student.religion || "---"}
                    </div>
                  </div>
                  <div className="col-span-4 flex items-end">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">8. Aadhar No:</span>
                    <div className="flex-1 font-mono font-semibold text-slate-955 border-b-2 border-slate-900 px-1 text-center">
                      {student.aadharNo || "---"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 pb-0.5 border-b border-dotted border-slate-300">
                  <div className="col-span-6 flex items-end">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">9. Caste:</span>
                    <div className="flex-1 font-semibold text-slate-955 border-b-2 border-slate-900 px-1 text-center">
                      {student.caste || "---"}
                    </div>
                  </div>
                  <div className="col-span-6 flex items-end">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">10. Sub-Caste:</span>
                    <div className="flex-1 font-semibold text-slate-955 border-b-2 border-slate-900 px-1 text-center">
                      {student.subCaste || "---"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">11. Place of Birth:</span>
                  <div className="col-span-8 font-semibold text-slate-900 border-b-2 border-slate-900 px-1">
                    {student.placeOfBirth || "---"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">12. Date of Birth (Figures):</span>
                  <div className="col-span-8 font-mono font-bold text-slate-955 border-b-2 border-slate-900 px-1 flex justify-between">
                    <span>{dobNumerical}</span>
                    <span className="text-[10px] text-slate-500 font-normal">Gender: <span className="font-semibold text-slate-800">{student.gender || "---"}</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">13. Date of Birth (Words):</span>
                  <div className="col-span-8 font-semibold text-slate-900 border-b-2 border-slate-900 px-1 italic text-[10px]">
                    {dobWords}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">14. Last School Attended:</span>
                  <div className="col-span-8 text-slate-900 border-b-2 border-slate-900 px-1">
                    {student.lastSchoolAttended || "---"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">15. Date of Admission & Class:</span>
                  <div className="col-span-8 text-slate-900 border-b-2 border-slate-900 px-1 font-medium">
                    {admissionInfoDisplay}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">16. Class Last Studied:</span>
                  <div className="col-span-8 text-slate-955 font-bold border-b-2 border-slate-900 px-1 uppercase">
                    {currentClassDisplay}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">17. Promotion Qualified:</span>
                  <div className="col-span-8 text-slate-955 font-semibold border-b-2 border-slate-900 px-1">
                    {student.status === "WITHDRAWN" ? "Yes, Promoted" : "Study in Progress"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">18. General Conduct:</span>
                  <div className="col-span-8 text-slate-900 border-b-2 border-slate-900 px-1">
                    Satisfactory
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">19. Reason for Leaving:</span>
                  <div className="col-span-8 text-slate-900 border-b-2 border-slate-900 px-1">
                    {student.status === "WITHDRAWN" ? "Withdrawal Application Issued" : "Course Continuation"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">20. Application Received On:</span>
                  <div className="col-span-8 text-slate-900 border-b-2 border-slate-900 px-1 font-mono">
                    {student.receivedApplicationOf ? formatDobNumerical(student.receivedApplicationOf) : "---"}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 items-end pb-0.5 border-b border-dotted border-slate-300">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider text-[9px] font-bold">21. Permanent Address:</span>
                  <div className="col-span-8 text-slate-700 border-b-2 border-slate-900 px-1 italic text-[10px]">
                    {student.address || "---"}
                  </div>
                </div>

              </div>
            </div>

            {/* Certification and Signatures */}
            <div className="relative z-10 pt-3 mt-3">
              <p className="text-[9px] text-slate-500 leading-snug italic text-center mb-6">
                Certified that the above declarations and statistics have been verified with official school records and found true.
              </p>

              <div className="grid grid-cols-3 gap-4 text-center mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-[120px] border-b border-slate-800 h-6 flex items-end justify-center">
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                    Class Teacher
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center -mt-2">
                  <div className="w-12 h-12 border border-dashed rounded-full flex flex-col items-center justify-center border-slate-400 select-none opacity-30">
                    <span className="text-[6px] font-extrabold uppercase tracking-widest text-slate-500 text-center leading-none">
                      Office Seal
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full max-w-[120px] border-b border-slate-800 h-6 flex items-end justify-center">
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                    Principal
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DocumentLayout>
  );
};
