import React from "react";

interface ReceiptPDFProps {
  receipt: {
    receiptNumber: string;
    date: Date;
    amount: number;
    paymentMode: string;
    remarks?: string;
    student: {
      name: string;
      class: string;
    };
    organization: {
      name: string;
    };
  };
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ receipt }) => {
  return (
    <div className="p-8 max-w-2xl mx-auto bg-white border border-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-widest">
          {receipt.organization.name}
        </h1>
        <p className="text-sm text-gray-500">Official Fee Receipt</p>
      </div>

      <div className="flex justify-between mb-8 border-b pb-4">
        <div>
          <p className="text-sm font-semibold text-gray-600">Receipt No:</p>
          <p className="font-mono">{receipt.receiptNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-600">Date:</p>
          <p>{new Date(receipt.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Student Details
            </p>
            <p className="text-lg font-bold">{receipt.student.name}</p>
            <p className="text-gray-600">Class: {receipt.student.class}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-600 uppercase">
              Payment Mode
            </p>
            <p className="text-lg">{receipt.paymentMode}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-50 border-y-2 border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold uppercase">Total Received</span>
          <span className="text-3xl font-black italic tracking-tighter">
            ₹
            {Number(receipt.amount).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {receipt.remarks && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
            Remarks
          </p>
          <p className="text-sm italic text-gray-600">"{receipt.remarks}"</p>
        </div>
      )}

      <div className="mt-16 flex justify-between items-end pt-8 border-t border-dashed border-gray-300">
        <div className="text-center">
          <div className="w-32 border-b border-gray-400 mb-2"></div>
          <p className="text-xs text-gray-400 uppercase">Student/Parent Sign</p>
        </div>
        <div className="text-center text-xs text-gray-400 italic">
          <p>This is a computer-generated receipt.</p>
        </div>
        <div className="text-center">
          <div className="w-32 border-b border-gray-400 mb-2"></div>
          <p className="text-xs text-gray-400 uppercase">
            Authorized Signatory
          </p>
        </div>
      </div>
    </div>
  );
};
