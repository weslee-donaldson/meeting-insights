export interface ColumnDef {
  key: string;
  header: string;
  width?: number;
}

function truncate(value: string, width: number): string {
  if (value.length <= width) {
    return value;
  }
  return value.slice(0, width - 1) + "\u2026";
}

function cellValue(
  row: Record<string, unknown>,
  col: ColumnDef
): string {
  const raw = row[col.key];
  const str = raw == null ? "" : String(raw);
  if (col.width !== undefined) {
    return truncate(str, col.width);
  }
  return str;
}

export function formatTable(
  rows: Record<string, unknown>[],
  columns: ColumnDef[]
): string {
  const widths = columns.map((col) => {
    let max = col.header.length;
    for (const row of rows) {
      const val = cellValue(row, col);
      if (val.length > max) {
        max = val.length;
      }
    }
    return max;
  });

  const headerLine = columns
    .map((col, i) => col.header.padEnd(widths[i]))
    .join("   ")
    .trimEnd();

  const separatorLine = columns
    .map((col, i) => "\u2500".repeat(col.header.length).padEnd(widths[i]))
    .join("   ")
    .trimEnd();

  const dataLines = rows.map((row) =>
    columns
      .map((col, i) => cellValue(row, col).padEnd(widths[i]))
      .join("   ")
      .trimEnd()
  );

  return [headerLine, separatorLine, ...dataLines].join("\n");
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function output(
  data: Record<string, unknown>[] | Record<string, unknown>,
  options: {
    json: boolean;
    columns?: ColumnDef[];
    mode?: "table" | "kv" | "sections";
  },
  stream: NodeJS.WritableStream = process.stdout
): void {
  if (options.json) {
    stream.write(formatJson(data) + "\n");
    return;
  }

  if (options.mode === "table" && options.columns && Array.isArray(data)) {
    stream.write(formatTable(data, options.columns) + "\n");
    return;
  }
}
