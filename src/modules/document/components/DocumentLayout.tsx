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
    A4: "min-h-[297mm] w-[210mm] print:min-h-0",
    A5: "min-h-[210mm] w-[148mm] print:min-h-0",
    roll: "w-[80mm] min-h-fit print:min-h-0",
  };

  const paddingStyles = {
    A4: "px-10 py-10",
    A5: "px-4 py-4",
    roll: "px-4 py-4",
  };

  return (
    <div
      className={`relative mx-auto bg-white overflow-hidden shadow-2xl print:shadow-none print:w-full ${sizeStyles[pageSize]}`}
    >
      {/* Watermark Overlay */}
      {watermark && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none z-0"
          style={{ transform: "rotate(-45deg)" }}
        >
          <span className="text-[100px] font-black uppercase tracking-widest leading-none border-[10px] border-current px-8">
            {watermark.text}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col h-full min-h-full">
        {/* Institutional Centered Header Section */}
        {showHeader && (
          <div className="text-center mb-4 pb-4 border-b-2 border-black">
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-gray-900">
              {branding?.name || "Wisdom Academy of Excellence"}
            </h1>
            {branding?.address && (
              <div className="text-[9px] font-bold mt-1 uppercase tracking-wider text-gray-600">
                {branding.address}
              </div>
            )}
            {(branding?.phone || branding?.email) && (
              <div className="text-[8px] font-mono font-medium mt-0.5 text-gray-500">
                {branding.phone ? `Contact: ${branding.phone}` : ""}
                {branding.phone && branding.email ? " | " : ""}
                {branding.email ? `Email: ${branding.email}` : ""}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Content */}
        <div className={`flex-1 ${paddingStyles[pageSize]}`}>{children}</div>

        {/* Footer Section - Simplified for A5/Roll */}
        {showFooter && (
          <div
            className={`${pageSize === "roll" ? "px-4 pb-4" : "px-6 pb-6"} pt-4 border-t border-gray-100/50 text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] text-center`}
          >
            Generated via Wisdom Management System
          </div>
        )}
      </div>
    </div>
  );
};
