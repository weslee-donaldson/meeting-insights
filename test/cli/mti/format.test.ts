import { describe, it, expect } from "vitest";
import {
  formatTable,
  formatJson,
  output,
} from "../../../cli/mti/src/format.ts";

describe("formatTable", () => {
  it("renders aligned columns with header and separator", () => {
    const rows = [
      { id: "a1b2", title: "Q1 Planning", client: "Acme" },
      { id: "c3d4", title: "Sprint Retro", client: "Initech" },
    ];
    const columns = [
      { key: "id", header: "ID", width: 6 },
      { key: "title", header: "Title", width: 14 },
      { key: "client", header: "Client" },
    ];

    const result = formatTable(rows, columns);

    expect(result).toBe(
      [
        "ID     Title          Client",
        "──     ─────          ──────",
        "a1b2   Q1 Planning    Acme",
        "c3d4   Sprint Retro   Initech",
      ].join("\n")
    );
  });

  it("truncates values that exceed the column width", () => {
    const rows = [{ name: "A Very Long Name Indeed" }];
    const columns = [{ key: "name", header: "Name", width: 10 }];

    const result = formatTable(rows, columns);

    expect(result).toBe(
      ["Name", "────", "A Very Lo…"].join("\n")
    );
  });

  it("renders an empty table with only headers when no rows exist", () => {
    const columns = [
      { key: "id", header: "ID" },
      { key: "name", header: "Name" },
    ];

    const result = formatTable([], columns);

    expect(result).toBe(["ID   Name", "──   ────"].join("\n"));
  });

  it("coerces non-string values to strings", () => {
    const rows = [{ count: 42, active: true }];
    const columns = [
      { key: "count", header: "Count" },
      { key: "active", header: "Active" },
    ];

    const result = formatTable(rows, columns);

    expect(result).toBe(
      ["Count   Active", "─────   ──────", "42      true"].join("\n")
    );
  });
});

describe("formatJson", () => {
  it("pretty-prints data as indented JSON", () => {
    const data = { id: "abc", count: 3 };

    const result = formatJson(data);

    expect(result).toBe('{\n  "id": "abc",\n  "count": 3\n}');
  });
});

describe("output", () => {
  it("writes JSON when json option is true", () => {
    let written = "";
    const stream = { write: (s: string) => { written += s; return true; } };
    const data = [{ id: "a1" }];

    output(data, { json: true }, stream as NodeJS.WritableStream);

    expect(written).toBe('[\n  {\n    "id": "a1"\n  }\n]\n');
  });

  it("writes a table when mode is table", () => {
    let written = "";
    const stream = { write: (s: string) => { written += s; return true; } };
    const data = [{ id: "a1", name: "Test" }];
    const columns = [
      { key: "id", header: "ID" },
      { key: "name", header: "Name" },
    ];

    output(data, { json: false, columns, mode: "table" }, stream as NodeJS.WritableStream);

    expect(written).toBe("ID   Name\n──   ────\na1   Test\n");
  });

  it("defaults to process.stdout when no stream is provided", () => {
    expect(() => output({}, { json: true })).not.toThrow();
  });
});
