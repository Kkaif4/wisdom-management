import React from "react";
import { TemplateProps } from "../types/document.types";
import { DocumentLayout } from "../components/DocumentLayout";
import { formatDate, formatCurrency } from "../utils/formatters";
import { amountToWords } from "../utils/amountToWords";

interface ReceiptData {
  receiptNumber: string;
  date: Date | string;
  amount: number | string;
  paymentMode: string;
  category: string;
  remarks?: string | null;
  // Student fields
  studentName: string;
  grNo?: string;
  fatherName?: string;
  rollNumber?: string;
  studentClass?: string;
  // Organization fields
  organizationName: string;
  organizationAddress?: string;
  organizationContact?: string;
  // Session
  sessionName?: string;
}

export const ReceiptTemplate: React.FC<TemplateProps<ReceiptData>> = ({
  data,
  mode = "screen",
}) => {
  const isPrint = mode === "print";
  const numAmount =
    typeof data.amount === "string" ? parseFloat(data.amount) : data.amount;
  const isVoid = data.remarks?.includes("CANCELLED");

  return (
    <DocumentLayout
      pageSize="A5"
      branding={{ name: data.organizationName }}
      watermark={isVoid ? { text: "VOID" } : undefined}
    >
      <div className="flex flex-col h-auto min-h-full font-sans text-black print:min-h-0">
        {/* ── Document Type Header ───────────────────── */}
        <div className="flex justify-between items-center border border-black p-2 bg-gray-50 mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">
            Collection Receipt
          </span>
          <span className="text-[11px] font-black font-mono">
            #{data.receiptNumber}
          </span>
        </div>

        {/* ── Student Information Grid ───────────────── */}
        <table className="w-full border-collapse border-[1.2pt] border-black text-[11px]">
          <tbody>
            <tr>
              <td className="w-1/3 bg-gray-50 border border-black p-1.5 font-bold uppercase text-[9px] text-gray-500">
                Student Name
              </td>
              <td className="border border-black p-1.5 font-black text-sm uppercase">
                {data.studentName}
              </td>
              <td className="w-1/4 bg-gray-50 border border-black p-1.5 font-bold uppercase text-[9px] text-gray-500">
                Date
              </td>
              <td className="border border-black p-1.5 font-bold font-mono">
                {formatDate(data.date)}
              </td>
            </tr>
            <tr>
              <td className="bg-gray-50 border border-black p-1.5 font-bold uppercase text-[9px] text-gray-500">
                G.R. No.
              </td>
              <td className="border border-black p-1.5 font-mono">
                {data.grNo || "---"}
              </td>
              <td className="bg-gray-50 border border-black p-1.5 font-bold uppercase text-[9px] text-gray-500">
                Session
              </td>
              <td className="border border-black p-1.5">
                {data.sessionName || "---"}
              </td>
            </tr>
            <tr>
              <td className="bg-gray-50 border border-black p-1.5 font-bold uppercase text-[9px] text-gray-500">
                Father&apos;s Name
              </td>
              <td className="border border-black p-1.5 uppercase">
                {data.fatherName || "---"}
              </td>
              <td className="bg-gray-50 border border-black p-1.5 font-bold uppercase text-[9px] text-gray-500">
                Class & Sec
              </td>
              <td className="border border-black p-1.5 uppercase">
                {data.studentClass || "---"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Fee Particulars Table ────────────────────── */}
        <div className="mt-4 flex-1 min-h-0">
          <table className="w-full border-collapse border-[1.2pt] border-black text-[11px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-1.5 text-left text-[9px] font-black uppercase">
                  Particulars / Purpose of Payment
                </th>
                <th className="border border-black p-1.5 text-right w-40 text-[9px] font-black uppercase">
                  Amount Paid
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-24">
                <td className="border border-black p-2 align-top italic font-bold">
                  {data.category}
                </td>
                <td className="border border-black p-2 text-right align-bottom font-black font-mono text-lg pr-4 text-gray-900">
                  {formatCurrency(numAmount)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="bg-gray-50 border border-black p-2">
                  <span className="text-[8px] font-black uppercase text-gray-400 block mb-0.5">
                    Amount in Words:
                  </span>
                  <span className="font-bold italic text-[11px] capitalize text-gray-800">
                    {amountToWords(numAmount)} Only
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Footer / Payment Details ─────────────────── */}
        <div className="mt-4 grid grid-cols-2 gap-4 items-end">
          <div className="border border-black p-2 text-[10px] space-y-1">
            <p className="font-black underline uppercase text-gray-900">
              Payment Details:
            </p>
            <p className="font-bold text-gray-700">
              Mode: <span className="font-black uppercase text-gray-900">{data.paymentMode}</span>
            </p>
            {data.remarks && (
              <p className="text-gray-700">
                Remarks: <span className="italic">{data.remarks}</span>
              </p>
            )}
          </div>

          <div className="text-right">
            <div className="inline-block text-center min-w-[140px]">
              <div className="h-8 mb-1"></div>
              <p className="text-[9px] font-black uppercase tracking-widest border-t border-black pt-1">
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>

        {!isPrint && (
          <div className="mt-4 flex gap-4 no-print border-t pt-3 justify-end">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-800 text-white rounded font-black text-xs uppercase tracking-widest shadow-lg"
            >
              Print Receipt
            </button>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
};
