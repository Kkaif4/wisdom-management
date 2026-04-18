import React from "react";
import { TemplateProps } from "../types/document.types";
import { DocumentLayout } from "../components/DocumentLayout";
import { formatDate, formatCurrency } from "../utils/formatters";

interface StudentStatementData {
  student: {
    name: string;
    admissionNumber: string;
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
      <div className="flex flex-col h-full font-serif text-gray-900">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black uppercase tracking-widest border-b-2 border-gray-900 pb-2 inline-block">
            Student Ledger Statement
          </h2>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">
            Period: {data.period.start} — {data.period.end}
          </p>
        </div>

        {/* Student Profile Info */}
        <div className="grid grid-cols-2 gap-8 mb-10 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Student Name
              </p>
              <p className="text-lg font-bold">{data.student.name}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Admission No.
              </p>
              <p className="font-mono font-bold leading-none">
                {data.student.admissionNumber}
              </p>
            </div>
          </div>
          <div className="text-right space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Current Class
              </p>
              <p className="font-bold">{data.student.class}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                Statement Date
              </p>
              <p className="font-bold">{formatDate(new Date())}</p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="border-2 border-gray-900 p-4 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">
              Total Assigned
            </p>
            <p className="text-xl font-black">
              {formatCurrency(data.summary.totalAssigned)}
            </p>
          </div>
          <div className="border-2 border-emerald-600 p-4 rounded-2xl bg-emerald-50/20">
            <p className="text-[9px] font-black uppercase text-emerald-600 mb-1">
              Total Paid
            </p>
            <p className="text-xl font-black text-emerald-600">
              {formatCurrency(data.summary.totalPaid)}
            </p>
          </div>
          <div className="border-2 border-rose-600 p-4 rounded-2xl bg-rose-50/20">
            <p className="text-[9px] font-black uppercase text-rose-600 mb-1">
              Outstanding
            </p>
            <p className="text-xl font-black text-rose-600">
              {formatCurrency(data.summary.outstanding)}
            </p>
          </div>
        </div>

        {/* Enrollment Breakdowns */}
        <div className="space-y-12">
          {data.enrollments.map((en, i) => (
            <div key={i} className="space-y-4">
              <div className="flex justify-between items-end border-b pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Session: {en.sessionName} — {en.className}
                </h3>
                <span className="text-[10px] font-bold text-gray-400 italic">
                  Remaining dues: {formatCurrency(en.remaining)}
                </span>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 text-[10px] font-black uppercase tracking-widest px-2">
                      Date
                    </th>
                    <th className="py-2 text-[10px] font-black uppercase tracking-widest px-2">
                      Receipt #
                    </th>
                    <th className="py-2 text-[10px] font-black uppercase tracking-widest px-2">
                      Mode
                    </th>
                    <th className="py-2 text-right text-[10px] font-black uppercase tracking-widest px-2">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {en.receipts.map((r, j) => (
                    <tr key={j}>
                      <td className="py-2 text-xs font-medium px-2">
                        {formatDate(r.date)}
                      </td>
                      <td className="py-2 text-xs font-mono px-2">
                        #{r.receiptNumber}
                      </td>
                      <td className="py-2 text-xs font-bold italic uppercase px-2">
                        {r.paymentMode}
                      </td>
                      <td className="py-2 text-xs font-black text-right px-2">
                        {formatCurrency(r.amount)}
                      </td>
                    </tr>
                  ))}
                  {en.receipts.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-[10px] text-gray-400 italic"
                      >
                        No payments recorded for this session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-20 border-t flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>End of Statement</span>
          <span>Computer Generated</span>
        </div>

        {!isPrint && (
          <div className="mt-12 flex gap-4 no-print border-t pt-6">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-primary text-white rounded-lg font-black text-xs uppercase tracking-widest"
            >
              Print Full Statement
            </button>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
};
