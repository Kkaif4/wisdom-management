import React from "react";
import { TemplateProps } from "../types/document.types";
import { DocumentLayout } from "../components/DocumentLayout";
import { formatDate, formatCurrency } from "../utils/formatters";

interface ExpenseData {
  voucherNumber: string;
  date: Date | string;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  paidTo?: string;
  recordedBy: string;
  organizationName: string;
}

/**
 * Professional Expense Voucher Template.
 * Designed for formal internal accounting.
 */
export const ExpenseVoucherTemplate: React.FC<TemplateProps<ExpenseData>> = ({
  data,
  mode = "screen",
}) => {
  const isPrint = mode === "print";

  return (
    <DocumentLayout
      pageSize="A5"
      showHeader={true}
      branding={{ name: data.organizationName }}
    >
      <div className="flex flex-col h-full font-serif text-gray-900">
        {/* Voucher Title */}
        <div className="flex justify-between items-center mb-10 pb-4 border-b">
          <h2 className="text-xl font-black uppercase tracking-widest italic">
            Expense Voucher
          </h2>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-gray-400 block">
              Voucher No.
            </span>
            <span className="font-mono text-lg font-bold">
              #{data.voucherNumber}
            </span>
          </div>
        </div>

        {/* Date & Mode */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
              Date
            </p>
            <p className="font-bold">{formatDate(data.date)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
              Payment Mode
            </p>
            <p className="font-bold uppercase italic">{data.paymentMode}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-10 space-y-6">
          <div className="grid grid-cols-4 gap-4 pb-2 border-b-2 border-gray-900">
            <div className="col-span-3 text-[10px] font-black uppercase tracking-widest">
              Description / Purpose
            </div>
            <div className="text-right text-[10px] font-black uppercase tracking-widest">
              Amount
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 items-start">
            <div className="col-span-3">
              <p className="text-xs font-black uppercase text-gray-400 mb-1">
                {data.category}
              </p>
              <p className="text-sm font-medium leading-relaxed">
                {data.description}
              </p>
              {data.paidTo && (
                <p className="text-[10px] mt-2 font-bold italic text-gray-500">
                  Paid To: {data.paidTo}
                </p>
              )}
            </div>
            <div className="text-right font-black text-lg">
              {formatCurrency(data.amount)}
            </div>
          </div>
        </div>

        {/* Summary Box */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest">
            Total Paid
          </span>
          <span className="text-2xl font-black italic">
            {formatCurrency(data.amount)}
          </span>
        </div>

        {/* Signatures */}
        <div className="mt-auto grid grid-cols-2 gap-20">
          <div className="text-center">
            <div className="border-b border-gray-400 h-12 mb-2"></div>
            <p className="text-[9px] font-bold uppercase text-gray-400">
              Receiver's Signature
            </p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 h-12 mb-2"></div>
            <p className="text-[9px] font-bold uppercase text-gray-400">
              Authorized By
            </p>
            <p className="text-[8px] text-gray-300 italic">
              ({data.recordedBy})
            </p>
          </div>
        </div>

        {!isPrint && (
          <div className="mt-10 no-print flex justify-end pt-6 border-t">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
            >
              Print Voucher
            </button>
          </div>
        )}
      </div>
    </DocumentLayout>
  );
};
