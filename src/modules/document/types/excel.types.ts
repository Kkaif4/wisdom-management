export type ExcelFormatType = "text" | "number" | "date" | "currency";

export interface ColumnConfig<T> {
  key: keyof T | string; // string for nested keys like 'student.name'
  label: string;
  format?: ExcelFormatType;
  transform?: (value: any, row: T) => any;
  width?: number; // character width for excel columns
}

export interface ExcelExportConfig<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  fileName: string;
  options?: {
    sheetName?: string;
    freezeHeader?: boolean;
    headerStyle?: {
      fillColor?: string; // Hex color without #
      fontColor?: string;
      bold?: boolean;
    };
    onProgress?: (progress: number) => void;
    chunkSize?: number;
  };
}
