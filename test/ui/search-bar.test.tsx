// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SearchBar } from "../../electron-ui/ui/src/components/SearchBar.js";

afterEach(cleanup);

describe("SearchBar", () => {
  it("renders search input", () => {
    render(<SearchBar query="" onQueryChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: /search meetings/i })).toBeDefined();
  });

  it("typing calls onQueryChange but not onSubmit", () => {
    const onQueryChange = vi.fn();
    const onSubmit = vi.fn();
    render(<SearchBar query="" onQueryChange={onQueryChange} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "blue" } });
    expect(onQueryChange).toHaveBeenCalledWith("blue");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("pressing Enter calls onSubmit with trimmed query value", () => {
    const onSubmit = vi.fn();
    render(<SearchBar query="  blue green  " onQueryChange={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("blue green");
  });

  it("clear button calls onQueryChange('') and onSubmit('')", () => {
    const onQueryChange = vi.fn();
    const onSubmit = vi.fn();
    render(<SearchBar query="blue" onQueryChange={onQueryChange} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
    expect(onQueryChange).toHaveBeenCalledWith("");
    expect(onSubmit).toHaveBeenCalledWith("");
  });

  it("clear button is not shown when query is empty", () => {
    render(<SearchBar query="" onQueryChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /clear search/i })).toBeNull();
  });

  it("renders Deep Search checkbox when onDeepSearchToggle is provided", () => {
    render(
      <SearchBar query="" onQueryChange={vi.fn()} onSubmit={vi.fn()} deepSearchEnabled={true} onDeepSearchToggle={vi.fn()} />,
    );
    const checkbox = screen.getByRole("checkbox", { name: /deep search/i });
    expect(checkbox).toBeDefined();
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("toggling Deep Search checkbox fires onDeepSearchToggle", () => {
    const onToggle = vi.fn();
    render(
      <SearchBar query="" onQueryChange={vi.fn()} onSubmit={vi.fn()} deepSearchEnabled={true} onDeepSearchToggle={onToggle} />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: /deep search/i }));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("hides Deep Search checkbox when onDeepSearchToggle is not provided", () => {
    render(<SearchBar query="" onQueryChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByRole("checkbox", { name: /deep search/i })).toBeNull();
  });
});
