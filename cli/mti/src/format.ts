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

export function formatKeyValue(
  entries: Array<{ label: string; value: string }>
): string {
  if (entries.length === 0) {
    return "";
  }
  const maxLabel = Math.max(...entries.map((e) => e.label.length));
  const padTo = maxLabel + 4;
  return entries
    .map((e) => `${(e.label + ":").padEnd(padTo)}${e.value}`)
    .join("\n");
}

export function formatSections(
  sections: Array<{ heading: string; items: string[] }>
): string {
  if (sections.length === 0) {
    return "";
  }
  return sections
    .map((section) => {
      const heading = section.heading.toUpperCase();
      const items = section.items.map((item) =>
        section.items.length === 1
          ? `  ${item}`
          : `  \u2022 ${item}`
      );
      return [heading, ...items].join("\n");
    })
    .join("\n\n");
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function writeln(stream: NodeJS.WritableStream, text: string): void {
  stream.write(text + "\n");
}

export function outputJson(
  data: unknown,
  stream: NodeJS.WritableStream = process.stdout
): void {
  writeln(stream, formatJson(data));
}

export function outputTable(
  rows: Record<string, unknown>[],
  columns: ColumnDef[],
  stream: NodeJS.WritableStream = process.stdout
): void {
  writeln(stream, formatTable(rows, columns));
}

export function outputKv(
  entries: Array<{ label: string; value: string }>,
  stream: NodeJS.WritableStream = process.stdout
): void {
  writeln(stream, formatKeyValue(entries));
}

export function outputSections(
  sections: Array<{ heading: string; items: string[] }>,
  stream: NodeJS.WritableStream = process.stdout
): void {
  writeln(stream, formatSections(sections));
}

export function output(
  data: unknown,
  options: {
    json: boolean;
    columns?: ColumnDef[];
    mode?: "table" | "kv" | "sections";
  },
  stream: NodeJS.WritableStream = process.stdout
): void {
  if (options.json) {
    outputJson(data, stream);
    return;
  }

  if (options.mode === "table" && options.columns && Array.isArray(data)) {
    outputTable(data, options.columns, stream);
    return;
  }

  if (options.mode === "kv" && Array.isArray(data)) {
    outputKv(data, stream);
    return;
  }

  if (options.mode === "sections" && Array.isArray(data)) {
    outputSections(data, stream);
    return;
  }
}
