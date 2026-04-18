import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ExcelExportConfig } from "../types/excel.types";
import { prepareRowData } from "../utils/dataTransform";

export class ExcelService {
  /**
   * Main export function for generating Excel files from data collections.
   */
  static async export<T>(config: ExcelExportConfig<T>): Promise<void> {
    const { data, columns, fileName, options = {} } = config;
    const {
      sheetName = "Sheet1",
      freezeHeader = true,
      headerStyle = { fillColor: "F2F2F2", bold: true },
      chunkSize = 500,
      onProgress,
    } = options;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // 1. Setup Columns
    worksheet.columns = columns.map((col) => ({
      header: col.label,
      key: col.key as string,
      width: col.width || 20,
    }));

    // 2. Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: headerStyle.bold };
    if (headerStyle.fillColor) {
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${headerStyle.fillColor.replace("#", "")}` },
      };
    }

    // 3. Freeze Header
    if (freezeHeader) {
      worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
    }

    // 4. Process Data in Chunks (Prevent UI Freeze)
    const total = data.length;
    for (let i = 0; i < total; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      chunk.forEach((row) => {
        const rowData = prepareRowData(row, columns);
        worksheet.addRow(rowData);
      });

      // Report progress
      if (onProgress) {
        onProgress(
          Math.min(100, Math.round(((i + chunk.length) / total) * 100)),
        );
      }

      // Allow UI thread to breathe
      if (total > chunkSize) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    // 5. Apply Column Formatting (Number/Date/Currency)
    columns.forEach((col, index) => {
      const colIndex = index + 1;
      const column = worksheet.getColumn(colIndex);

      if (col.format === "currency") {
        column.numFmt = "₹ #,##0.00";
      } else if (col.format === "number") {
        column.numFmt = "#,##0.00";
      } else if (col.format === "date") {
        column.numFmt = "yyyy-mm-dd";
      }
    });

    // 6. Generate and Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
  }
}
