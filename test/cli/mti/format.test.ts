import { describe, it, expect } from "vitest";
import {
  formatTable,
  formatJson,
  formatKeyValue,
  formatSections,
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

describe("formatKeyValue", () => {
  it("renders label-value pairs with labels right-padded to longest label", () => {
    const entries = [
      { label: "Title", value: "Q1 Planning Review" },
      { label: "Date", value: "2026-01-15" },
      { label: "Client", value: "Acme" },
    ];

    const result = formatKeyValue(entries);

    expect(result).toBe(
      [
        "Title:    Q1 Planning Review",
        "Date:     2026-01-15",
        "Client:   Acme",
      ].join("\n")
    );
  });

  it("handles a single entry without extra padding", () => {
    const entries = [{ label: "Name", value: "Alice" }];

    const result = formatKeyValue(entries);

    expect(result).toBe("Name:   Alice");
  });

  it("renders an empty string for no entries", () => {
    const result = formatKeyValue([]);

    expect(result).toBe("");
  });
});

describe("formatSections", () => {
  it("renders sectioned bullet lists with uppercase headings", () => {
    const sections = [
      {
        heading: "Summary",
        items: ["Full summary text..."],
      },
      {
        heading: "Decisions",
        items: [
          "Decision one (decided by Alice)",
          "Decision two",
        ],
      },
    ];

    const result = formatSections(sections);

    expect(result).toBe(
      [
        "SUMMARY",
        "  Full summary text...",
        "",
        "DECISIONS",
        "  \u2022 Decision one (decided by Alice)",
        "  \u2022 Decision two",
      ].join("\n")
    );
  });

  it("renders a single item without bullet prefix", () => {
    const sections = [
      { heading: "Overview", items: ["The only item"] },
    ];

    const result = formatSections(sections);

    expect(result).toBe("OVERVIEW\n  The only item");
  });

  it("renders an empty string for no sections", () => {
    const result = formatSections([]);

    expect(result).toBe("");
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

  it("writes key-value pairs when mode is kv", () => {
    let written = "";
    const stream = { write: (s: string) => { written += s; return true; } };
    const entries = [{ label: "ID", value: "abc" }];

    output(entries, { json: false, mode: "kv" }, stream as NodeJS.WritableStream);

    expect(written).toBe("ID:   abc\n");
  });

  it("writes sections when mode is sections", () => {
    let written = "";
    const stream = { write: (s: string) => { written += s; return true; } };
    const sections = [
      { heading: "Notes", items: ["Item A"] },
    ];

    output(sections, { json: false, mode: "sections" }, stream as NodeJS.WritableStream);

    expect(written).toBe("NOTES\n  Item A\n");
  });

  it("defaults to process.stdout when no stream is provided", () => {
    expect(() => output({}, { json: true })).not.toThrow();
  });
});
