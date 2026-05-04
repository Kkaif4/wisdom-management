import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PrintWrapperProps {
  id?: string;
  width?: string;
  children: React.ReactNode;
}

/**
 * Renders children into a portal on document.body with the `print-area` class.
 * Hidden on screen, visible only when printing.
 *
 * Works with the global `@media print { body > *:not(.print-area) { display: none } }`
 * rule in globals.css to isolate print content from the dashboard.
 */
export const PrintWrapper: React.FC<PrintWrapperProps> = ({
  id,
  width = "210mm",
  children,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      id={id}
      className="print-area"
      style={{
        /* Hidden on screen — positioned off-screen to avoid layout interference */
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: width,
        overflow: "hidden",
        visibility: "hidden",
      }}
    >
      {/* Inline style tag to force visibility in print context */}
      <style>{`
        @media print {
          .print-area {
            position: static !important;
            top: auto !important;
            left: auto !important;
            width: 100% !important;
            overflow: visible !important;
            visibility: visible !important;
          }
        }
      `}</style>
      {children}
    </div>,
    document.body,
  );
};
