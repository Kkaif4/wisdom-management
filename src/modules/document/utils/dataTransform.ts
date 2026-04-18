/**
 * Retrieves a value from an object using a dot-notated path (e.g., 'student.name').
 */
export function getValueByPath(obj: any, path: string): any {
  if (!path || !obj) return undefined;

  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }

  return current;
}

/**
 * Normalizes values for Excel export (nulls, decimals, dates).
 */
export function normalizeValue(value: any): any {
  if (value === null || value === undefined) return "";

  // Handle Prisma Decimal/Number-like objects (strings or have d property)
  if (typeof value === "object" && value.d && Array.isArray(value.d)) {
    return Number(value);
  }

  if (value instanceof Date) {
    return value; // ExcelJS handles Dates
  }

  // Handle ISO string dates that aren't Date objects
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
  ) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }

  return value;
}

/**
 * flattens a nested data structure into a flat array based on column configuration.
 */
export function prepareRowData<T>(
  row: T,
  columns: { key: any; transform?: (v: any, r: T) => any }[],
): any[] {
  return columns.map((col) => {
    let val = getValueByPath(row, col.key);

    // Apply custom transform if provided
    if (col.transform) {
      val = col.transform(val, row);
    }

    return normalizeValue(val);
  });
}
