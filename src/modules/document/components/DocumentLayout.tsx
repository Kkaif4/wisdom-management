import React from "react";
import { DocumentLayoutProps } from "../types/document.types";

/**
 * Standard A4 Layout for documents (Receipts, Invoices, Reports).
 * Enforces width, alignment, and supports header/footer/watermark.
 */
export const DocumentLayout: React.FC<DocumentLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  pageSize = "A4",
  watermark,
  branding,
}) => {
  const sizeStyles = {
    A4: "min-h-[297mm] w-[210mm]",
    A5: "min-h-[210mm] w-[148mm]",
    roll: "w-[80mm] min-h-fit",
  };

  return (
    <div
      className={`relative mx-auto bg-white overflow-hidden shadow-2xl print:shadow-none ${sizeStyles[pageSize]}`}
    >
      {/* Watermark Overlay */}
      {watermark && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none z-0"
          style={{ transform: "rotate(-45deg)" }}
        >
          <span className="text-[120px] font-black uppercase tracking-widest leading-none border-[15px] border-current px-8">
            {watermark.text}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col h-full min-h-full">
        {/* Professional Header Section */}
        {showHeader && (
          <div className="px-8 pt-8 pb-4 border-b-2 border-gray-900 flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
                {branding?.name || "Wisdom Academy"}
              </h1>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                {branding?.address || "Global Education Excellence Center"}
              </div>
            </div>
            <div className="text-right text-[9px] font-black leading-tight text-gray-400">
              <div>{branding?.phone || "+91-XXXXXXXXXX"}</div>
              <div>{branding?.email || "info@wisdomacademy.com"}</div>
            </div>
          </div>
        )}

        {/* Dynamic Content */}
        <div
          className={`flex-1 ${pageSize === "roll" ? "px-4 py-4" : "px-10 py-10"}`}
        >
          {children}
        </div>

        {/* Footer Section */}
        {showFooter && (
          <div className="px-10 pt-6 pb-10 border-t border-gray-100/50 text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] text-center">
            Professional Document • Generated via Wisdom Management System
          </div>
        )}
      </div>
    </div>
  );
};
