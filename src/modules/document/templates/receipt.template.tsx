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
  admissionNumber?: string;
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
      pageSize="A4"
      branding={{ name: data.organizationName }}
      watermark={isVoid ? { text: "VOID" } : undefined}
    >
      <div className="flex flex-col h-full font-sans text-gray-900">
        {/* ── Header Section ──────────────────────────── */}
        <div className="flex flex-col items-center text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-tight mb-1">
            {data.organizationName}
          </h1>
          {data.organizationAddress && (
            <p className="text-xs text-gray-600">{data.organizationAddress}</p>
          )}
          {data.organizationContact && (
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              {data.organizationContact}
            </p>
          )}
        </div>

        {/* ── Title and Metadata ──────────────────────── */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-lg font-bold border-b-2 border-gray-800 inline-block uppercase">
              Fee Receipt
            </h2>
          </div>
          <div className="text-right text-sm space-y-0.5">
            <p>
              <span className="font-bold">Receipt No:</span>{" "}
              {data.receiptNumber}
            </p>
            <p>
              <span className="font-bold">Date:</span> {formatDate(data.date)}
            </p>
            {data.sessionName && (
              <p>
                <span className="font-bold">Session:</span> {data.sessionName}
              </p>
            )}
          </div>
        </div>

        {/* ── Student Information Grid ────────────────── */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm border p-4 bg-gray-50 rounded">
          <div className="flex">
            <span className="w-36 font-bold text-gray-700 shrink-0">
              Student Name:
            </span>
            <span className="border-b border-gray-300 flex-1">
              {data.studentName}
            </span>
          </div>
          {data.fatherName && (
            <div className="flex">
              <span className="w-36 font-bold text-gray-700 shrink-0">
                Father&apos;s Name:
              </span>
              <span className="border-b border-gray-300 flex-1">
                {data.fatherName}
              </span>
            </div>
          )}
          {data.admissionNumber && (
            <div className="flex">
              <span className="w-36 font-bold text-gray-700 shrink-0">
                Admission No:
              </span>
              <span className="border-b border-gray-300 flex-1">
                {data.admissionNumber}
              </span>
            </div>
          )}
          {data.studentClass && (
            <div className="flex">
              <span className="w-36 font-bold text-gray-700 shrink-0">
                Class &amp; Section:
              </span>
              <span className="border-b border-gray-300 flex-1">
                {data.studentClass}
              </span>
            </div>
          )}
          {data.rollNumber && (
            <div className="flex">
              <span className="w-36 font-bold text-gray-700 shrink-0">
                Roll Number:
              </span>
              <span className="border-b border-gray-300 flex-1">
                {data.rollNumber}
              </span>
            </div>
          )}
        </div>

        {/* ── Fee Breakdown Table ─────────────────────── */}
        <table className="w-full border-collapse border border-gray-800 mb-6 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 p-2 text-left w-14">
                S.No
              </th>
              <th className="border border-gray-800 p-2 text-left">
                Description of Fees
              </th>
              <th className="border border-gray-800 p-2 text-right w-36">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 p-2 text-center">1</td>
              <td className="border border-gray-800 p-2 uppercase">
                {data.category}
              </td>
              <td className="border border-gray-800 p-2 text-right font-mono font-bold">
                {formatCurrency(numAmount)}
              </td>
            </tr>
            {/* Payment Mode Row */}
            <tr>
              <td className="border border-gray-800 p-2"></td>
              <td className="border border-gray-800 p-2 text-right italic text-gray-500">
                Payment Mode:{" "}
                <span className="uppercase font-bold not-italic text-gray-700">
                  {data.paymentMode}
                </span>
              </td>
              <td className="border border-gray-800 p-2"></td>
            </tr>
            {/* Total Row */}
            <tr className="bg-gray-50">
              <td className="border border-gray-800 p-2"></td>
              <td className="border border-gray-800 p-2 font-bold text-right">
                Total Amount Received
              </td>
              <td className="border border-gray-800 p-2 text-right font-bold font-mono text-lg">
                {formatCurrency(numAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Amount in Words ─────────────────────────── */}
        <div className="mb-10 text-sm">
          <p>
            <span className="font-bold underline">Amount in Words:</span>{" "}
            <span className="italic">{amountToWords(numAmount)}</span>
          </p>
        </div>

        {/* ── Remarks ─────────────────────────────────── */}
        {data.remarks && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
              Notes / Remarks
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {data.remarks}
            </p>
          </div>
        )}

        {/* ── Footer Signatures ──────────────────────── */}
        <div className="mt-auto grid grid-cols-2 gap-16 text-sm pt-8">
          <div className="text-center border-t border-gray-800 pt-2">
            <p className="font-bold">Parent / Guardian Signature</p>
          </div>
          <div className="text-center border-t border-gray-800 pt-2 flex flex-col items-center">
            <div className="h-10 flex items-center justify-center italic text-gray-400 opacity-50 mb-1 text-xs">
              [Authorized Seal]
            </div>
            <p className="font-bold uppercase">Authorized Signatory</p>
            <p className="text-[10px] text-gray-500 italic">
              Computer Generated Receipt
            </p>
          </div>
        </div>

        {/* ── Terms / Note ────────────────────────────── */}
        <div className="mt-6 text-[10px] text-gray-500 border-t pt-3 leading-tight">
          <p>
            Note: 1. Fees once paid are non-refundable. 2. Please preserve this
            receipt for future reference. 3. This is a computer generated
            document and does not require a physical signature if stamped by the
            institution.
          </p>
        </div>

        {!isPrint && (
          <div className="mt-8 flex gap-4 no-print border-t pt-6 justify-end">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              Print Receipt
            </button>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
};
