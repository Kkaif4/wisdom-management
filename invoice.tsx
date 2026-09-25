import React from "react";

export default function Invoice() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-6 px-4 flex flex-col items-center selection:bg-slate-200">
      {/* Structural Styles to enforce strict, un-fragmented A4 Dimensions on Print */}
      <style dangerouslySetInnerHTML={{
        __html: ` @import
    url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap");
    .font-mono-tabular { font-family: "JetBrains Mono" , monospace; font-variant-numeric: tabular-nums; } /* Screen
    Presentation View Constraints */ @media screen { .invoice-sheet { width: 210mm; height: 297mm; box-shadow: 0 4px 6px
    -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.05); } } /* Strict Single-Page
    Printing Configuration */ @media print { @page { size: A4; margin: 0 !important; /* Managed by component layout
    padding */ } html, body { background-color: #ffffff !important; margin: 0 !important; padding: 0 !important; width:
    210mm !important; height: 297mm !important; overflow: hidden !important; -webkit-print-color-adjust: exact
    !important; print-color-adjust: exact !important; } .no-print { display: none !important; } .invoice-sheet { width:
    210mm !important; height: 297mm !important; max-width: 210mm !important; max-height: 297mm !important; border: none
    !important; box-shadow: none !important; padding: 16mm 16mm !important; /* Balanced architectural printable
    container margins */ margin: 0 !important; background-color: #ffffff !important; page-break-inside: avoid
    !important; break-inside: avoid !important; } } `}} />

      {/* Control Panel Bar */}
      <div className="w-full max-w-[210mm] mb-4 flex justify-between items-center no-print">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Document Preview (Strict A4 Layout)
        </p>
        <button onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2 px-5 rounded border border-slate-900 transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print / Save PDF
        </button>
      </div>

      {/* Invoice Container - Fixed Dimension Sheet Layout */}
      <div className="invoice-sheet bg-white border border-slate-200 p-12 flex flex-col justify-between box-border">

        {/* Core Top Content Structural Group */}
        <div className="w-full">
          {/* Top Identity Block */}
          <div className="flex justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Mohammad Kaif Shaikh
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Independent Contractor / Developer
              </p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Latur, Maharashtra - 413512<br />
                Email: <span className="text-slate-900 font-medium">kkaifshaikh.27@gmail.com</span>
              </p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-xl font-normal text-slate-900 tracking-tight uppercase">
                Invoice
              </h2>
              <div className="text-[11px] space-y-0.5 text-slate-500">
                <p><span className="inline-block w-20 text-right pr-2">Date:</span> <span className="text-slate-900 font-medium">June
                  07, 2026</span></p>
                <p><span className="inline-block w-20 text-right pr-2">Due Date:</span> <span
                  className="text-slate-900 font-medium">Upon Receipt</span></p>
              </div>
            </div>
          </div>

          {/* Reference/Entities Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-[11px]">
            <div>
              <h3 className="font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bill To</h3>
              <p className="text-xs font-bold text-slate-900">Wisdom English Nursery School</p>
              <p className="text-slate-600 mt-0.5">Attn: Shaikh Nikhat</p>
              <p className="text-slate-500 mt-0.5">Latur, Maharashtra - 413512</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Project Reference</h3>
              <p className="text-slate-900 font-medium">Wisdom Management System Development</p>
              <p className="text-slate-500 mt-0.5">Scope: Web Application Lifecycle Delivery</p>
            </div>
          </div>

          {/* Itemized Services Table */}
          <div className="py-6">
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold tracking-wider">
                  <th className="pb-2 w-3/5">Description</th>
                  <th className="pb-2 text-center w-12">Qty</th>
                  <th className="pb-2 text-right w-24">Unit Rate</th>
                  <th className="pb-2 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-900">Web Application Development Lifecycle</p>
                    <p className="text-slate-500 mt-0.5 font-normal leading-relaxed text-justify">
                      End-to-end design, database architecture setup, back-end development, responsive UI components
                      engineering, functional testing, and deployment preparation.
                    </p>
                  </td>
                  <td className="py-3 text-center font-mono-tabular text-slate-600">1</td>
                  <td className="py-3 text-right font-mono-tabular text-slate-600">₹8,000.00</td>
                  <td className="py-3 text-right font-mono-tabular font-medium text-slate-900">₹8,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Service Terms & Financial Accounting Breakdown */}
          <div className="grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 text-[11px]">
            {/* Left Hand: Scope Rules & Agreements */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Service Terms & Scope</h3>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li><span className="text-slate-900 font-medium">Support:</span> Free support provided for 1 year covering
                    current requirements.</li>
                  <li><span className="text-slate-900 font-medium">Maintenance:</span> Recurring Yearly Maintenance Charge of
                    <span className="font-medium text-slate-900">₹750.00</span> applies post-deployment.</li>
                  <li><span className="text-slate-900 font-medium">Modifications:</span> Any new features or changes requested
                    outside initial requirements will cost accordingly.</li>
                </ul>
              </div>
            </div>

            {/* Right Hand: Financial Transfer Instructions */}
            <div className="space-y-3 pl-6">
              <div>
                <h3 className="font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payment Instructions</h3>
                <div className="grid grid-cols-2 gap-y-0.5 text-slate-600 border-l-2 border-slate-200 pl-2.5">
                  <span className="font-medium text-slate-400">Beneficiary:</span>
                  <span className="text-slate-900">Mohammad Kaif Shaikh</span>

                  <span className="font-medium text-slate-400">Account No:</span>
                  <span className="font-mono text-slate-900">0646140283</span>

                  <span className="font-medium text-slate-400">UPI ID:</span>
                  <span className="font-mono text-slate-900">8552965115@kotakbank</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="uppercase font-semibold text-slate-500 tracking-wider text-[10px]">Total Due:</span>
                  <span className="text-base font-bold font-mono-tabular text-slate-900">₹8,000.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Legal Assertions & End-of-Page Anchored Signature */}
        <div
          className="w-full pt-6 border-t border-slate-100 flex justify-between items-end gap-6 text-[10px] text-slate-400 leading-relaxed">
          <div className="max-w-sm">
            <p className="font-semibold text-slate-700 uppercase tracking-wider mb-0.5">Statutory Declaration</p>
            <p className="text-justify">
              This is a Bill of Supply issued by an independent professional service provider. No Goods and Services Tax
              (GST) has been levied as total aggregate turnover remains well below the mandatory commercial registration
              guidelines under the rules of the Central Goods and Services Tax (CGST) Act.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="border-b border-slate-300 w-36 h-6 ml-auto mb-1"></div>
            <p className="uppercase font-semibold tracking-wider text-slate-600 text-[9px]">Authorized Signature</p>
          </div>
        </div>

      </div>
    </div>
  );
}