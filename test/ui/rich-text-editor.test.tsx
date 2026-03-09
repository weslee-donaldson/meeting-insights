// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RichTextEditor } from "../../electron-ui/ui/src/components/ui/rich-text-editor.js";

afterEach(cleanup);

describe("RichTextEditor", () => {
  it("renders editor container with toolbar and content area", () => {
    render(<RichTextEditor initialHtml="" onChange={vi.fn()} />);
    expect(screen.getByTestId("rich-text-editor")).toBeDefined();
    expect(screen.getByTestId("rte-toolbar")).toBeDefined();
    expect(screen.getByTestId("rte-content")).toBeDefined();
  });

  it("renders all formatting toolbar buttons", () => {
    render(<RichTextEditor initialHtml="" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Bold" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Italic" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Underline" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Bullet list" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Ordered list" })).toBeDefined();
  });

  it("content area has contenteditable attribute", () => {
    render(<RichTextEditor initialHtml="" onChange={vi.fn()} />);
    const content = screen.getByTestId("rte-content");
    expect(content.getAttribute("contenteditable")).toBe("true");
  });
});
