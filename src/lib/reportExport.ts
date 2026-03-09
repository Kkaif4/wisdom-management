import * as XLSX from "xlsx";
import { showToast } from "@/components/shared/Toast";

/**
 * Exports data to an Excel file with multiple sheets or a single sheet.
 * @param filename Name of the file to download
 * @param sheets Array of objects { name: string, data: any[][] | any[] }
 */
export function exportToExcel(
  filename: string,
  sheets: { name: string; data: any[] }[],
) {
  try {
    const wb = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      // If data is array of arrays, use aoa_to_sheet, else json_to_sheet
      let ws;
      if (Array.isArray(sheet.data[0])) {
        ws = XLSX.utils.aoa_to_sheet(sheet.data);
      } else {
        ws = XLSX.utils.json_to_sheet(sheet.data);
      }
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    XLSX.writeFile(
      wb,
      `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showToast("Report exported successfully", "success");
  } catch (err) {
    console.error("Export failed:", err);
    showToast("Failed to export report", "error");
  }
}

/**
 * Standard formatter for currency (INR)
 */
export const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
