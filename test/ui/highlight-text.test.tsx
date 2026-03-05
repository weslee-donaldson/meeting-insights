// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { HighlightText } from "../../electron-ui/ui/src/components/HighlightText.js";

afterEach(cleanup);

describe("HighlightText", () => {
  it("renders plain text when terms array is empty", () => {
    render(<HighlightText text="Hello world" terms={[]} />);
    expect(screen.getByText("Hello world")).toBeDefined();
    expect(screen.queryByRole("mark")).toBeNull();
  });

  it("wraps matching term in mark element", () => {
    const { container } = render(<HighlightText text="The roadmap is ready" terms={["roadmap"]} />);
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe("roadmap");
  });

  it("highlights multiple occurrences of same term", () => {
    const { container } = render(<HighlightText text="sprint planning and sprint review" terms={["sprint"]} />);
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(2);
    expect(marks[0].textContent).toBe("sprint");
    expect(marks[1].textContent).toBe("sprint");
  });

  it("highlights multiple different terms", () => {
    const { container } = render(<HighlightText text="sprint planning and roadmap review" terms={["sprint", "roadmap"]} />);
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(2);
    expect(marks[0].textContent).toBe("sprint");
    expect(marks[1].textContent).toBe("roadmap");
  });

  it("matches case-insensitively", () => {
    const { container } = render(<HighlightText text="The Roadmap is ready" terms={["road"]} />);
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe("Road");
  });

  it("handles regex special characters in terms safely", () => {
    const { container } = render(<HighlightText text="Using C++ for performance" terms={["c++"]} />);
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe("C++");
  });
});
