import React from "react";
import { TemplateProps } from "../types/document.types";
import { DocumentLayout } from "../components/DocumentLayout";
import { formatDate, formatCurrency } from "../utils/formatters";

interface StudentStatementData {
  student: {
    name: string;
    grNo: string;
    class: string;
  };
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalAssigned: number;
    totalPaid: number;
    outstanding: number;
  };
  enrollments: Array<{
    sessionName: string;
    className: string;
    totalFees: number;
    discount?: number;
    paid: number;
    remaining: number;
    receipts: Array<{
      date: string;
      receiptNumber: string;
      paymentMode: string;
      amount: number;
      status: string;
    }>;
  }>;
  organizationName: string;
}

/**
 * Professional Student Academic & Financial Statement Template.
 * Designed for full-page A4 printing.
 */
export const StudentStatementTemplate: React.FC<
  TemplateProps<StudentStatementData>
> = ({ data, mode = "screen" }) => {
  const isPrint = mode === "print";

  return (
    <DocumentLayout pageSize="A4" branding={{ name: data.organizationName }}>
      <div className="flex flex-col h-full font-sans text-black">
        {/* ── Document Type Header ───────────────────── */}
        <div className="flex justify-between items-center border border-black p-2 bg-gray-100 mb-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">
            Student Ledger Statement
          </span>
          <span className="text-[10px] font-bold font-mono">
            Period: {data.period.start} — {data.period.end}
          </span>
        </div>

        {/* ── Student Profile Info ───────────────────── */}
        <table className="w-full border-collapse border-[1.2pt] border-black text-[11px] mb-6">
          <tbody>
            <tr>
              <td className="w-1/4 bg-gray-50 border border-black p-2 font-bold uppercase text-[9px] text-gray-500">
                Student Name
              </td>
              <td className="border border-black p-2 font-black text-sm uppercase">
                {data.student.name}
              </td>
              <td className="w-1/4 bg-gray-50 border border-black p-2 font-bold uppercase text-[9px] text-gray-500">
                G.R. No.
              </td>
              <td className="border border-black p-2 font-black font-mono">
                {data.student.grNo}
              </td>
            </tr>
            <tr>
              <td className="bg-gray-50 border border-black p-2 font-bold uppercase text-[9px] text-gray-500">
                Current Class
              </td>
              <td className="border border-black p-2 uppercase">
                {data.student.class}
              </td>
              <td className="bg-gray-50 border border-black p-2 font-bold uppercase text-[9px] text-gray-500">
                Statement Date
              </td>
              <td className="border border-black p-2 font-bold">
                {formatDate(new Date())}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Ledger Summary Blocks ──────────────────── */}
        <div className="grid grid-cols-3 border-[1.5pt] border-black divide-x divide-black mb-8 shadow-sm">
          <div className="p-4 text-center">
            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">
              Total Fees Assigned
            </p>
            <p className="text-xl font-black font-mono">
              {formatCurrency(data.summary.totalAssigned)}
            </p>
          </div>
          <div className="p-4 text-center bg-gray-50">
            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">
              Total Amount Paid
            </p>
            <p className="text-xl font-black font-mono text-blue-800">
              {formatCurrency(data.summary.totalPaid)}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">
              Outstanding Balance
            </p>
            <p className="text-xl font-black font-mono text-red-600">
              {formatCurrency(data.summary.outstanding)}
            </p>
          </div>
        </div>

        {/* ── Session Breakdown ───────────────────────── */}
        <div className="mb-8">
          <h3 className="text-[10px] font-black uppercase underline mb-3 tracking-widest text-gray-900">
            1. Session Breakdown (Academic History)
          </h3>
          <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-2 text-left text-[9px] font-black uppercase">
                  Academic Session
                </th>
                <th className="border border-black p-2 text-right text-[9px] font-black uppercase">
                  Total Fees
                </th>
                <th className="border border-black p-2 text-right text-[9px] font-black uppercase">
                  Discount
                </th>
                <th className="border border-black p-2 text-right text-[9px] font-black uppercase">
                  Paid Amount
                </th>
                <th className="border border-black p-2 text-right text-[9px] font-black uppercase">
                  Remaining Dues
                </th>
              </tr>
            </thead>
            <tbody>
              {data.enrollments.map((en, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 font-bold uppercase">
                    {en.sessionName} — {en.className}
                  </td>
                  <td className="border border-black p-2 text-right font-mono">
                    {formatCurrency(en.totalFees)}
                  </td>
                  <td className="border border-black p-2 text-right font-mono text-amber-700">
                    {formatCurrency(en.discount || 0)}
                  </td>
                  <td className="border border-black p-2 text-right font-mono text-blue-700">
                    {formatCurrency(en.paid)}
                  </td>
                  <td className="border border-black p-2 text-right font-black font-mono text-gray-900">
                    {formatCurrency(en.remaining)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Transaction Logs ────────────────────────── */}
        <div>
          <h3 className="text-[10px] font-black uppercase underline mb-3 tracking-widest text-gray-900">
            2. Recent Transaction Logs
          </h3>
          <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-2 text-left w-28 text-[9px] font-black uppercase">
                  Date
                </th>
                <th className="border border-black p-2 text-left w-40 text-[9px] font-black uppercase">
                  Receipt #
                </th>
                <th className="border border-black p-2 text-left text-[9px] font-black uppercase">
                  Payment Mode
                </th>
                <th className="border border-black p-2 text-right w-40 text-[9px] font-black uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.enrollments.flatMap((en) =>
                en.receipts.map((r, j) => (
                  <tr key={`${en.sessionName}-${j}`}>
                    <td className="border border-black p-2 font-mono">
                      {formatDate(r.date)}
                    </td>
                    <td className="border border-black p-2 font-black font-mono">
                      #{r.receiptNumber}
                    </td>
                    <td className="border border-black p-2 uppercase italic font-bold">
                      {r.paymentMode}
                    </td>
                    <td className="border border-black p-2 text-right font-black font-mono">
                      {formatCurrency(r.amount)}
                    </td>
                  </tr>
                ))
              )}
              {data.enrollments.every((en) => en.receipts.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-black py-8 text-center text-[10px] text-gray-400 italic"
                  >
                    No payment history recorded for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="mt-auto border-t border-black pt-4 flex justify-between items-end">
          <div className="text-[8px] text-gray-400 font-bold uppercase">
            * This document is a valid financial record of the Wisdom Management System.
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-tighter text-gray-900">
              Computer Generated System Document
            </p>
            <p className="text-[8px] text-gray-400 italic">
              Printed on: {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {!isPrint && (
          <div className="mt-12 flex gap-4 no-print border-t pt-6 justify-end">
            <button
              onClick={() => window.print()}
              className="px-8 py-2.5 bg-blue-800 text-white rounded font-black text-xs uppercase tracking-widest shadow-xl"
            >
              Print Full Statement
            </button>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
};
