// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { EditActionItemDialog } from "../../electron-ui/ui/src/components/EditActionItemDialog.js";

afterEach(cleanup);

function makeItem() {
  return {
    description: "Write docs",
    owner: "Bob",
    requester: "Alice",
    due_date: "2026-04-01",
    priority: "normal" as const,
  };
}

describe("EditActionItemDialog", () => {
  it("renders form fields populated with item data when open", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={makeItem()}
      />,
    );
    expect(screen.getByLabelText("Description")).toHaveProperty("value", "Write docs");
    expect(screen.getByLabelText("Owner")).toHaveProperty("value", "Bob");
    expect(screen.getByLabelText("Requester")).toHaveProperty("value", "Alice");
    expect(screen.getByLabelText("Due Date")).toHaveProperty("value", "2026-04-01");
    expect(screen.getByLabelText("Priority")).toHaveProperty("value", "normal");
  });

  it("calls onSave with updated fields when Save is clicked", () => {
    const onSave = vi.fn();
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={onSave}
        item={makeItem()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Updated docs" } });
    fireEvent.change(screen.getByLabelText("Priority"), { target: { value: "critical" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({
      description: "Updated docs",
      owner: "Bob",
      requester: "Alice",
      due_date: "2026-04-01",
      priority: "critical",
    });
  });

  it("disables Save when description is empty", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={makeItem()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "" } });
    expect(screen.getByText("Save").hasAttribute("disabled")).toBe(true);
  });

  it("clears due_date when input is emptied", () => {
    const onSave = vi.fn();
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={onSave}
        item={makeItem()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Due Date"), { target: { value: "" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ due_date: null }),
    );
  });
});

const MEETINGS = [
  { id: "m1", title: "Weekly Sync" },
  { id: "m2", title: "Planning" },
];

describe("EditActionItemDialog — Add mode", () => {
  it("shows 'Add Action Item' title when mode is add", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={null}
        mode="add"
        meetings={MEETINGS}
      />,
    );
    expect(screen.getByText("Add Action Item")).toBeDefined();
  });

  it("shows meeting dropdown in add mode with provided meetings", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={null}
        mode="add"
        meetings={MEETINGS}
      />,
    );
    const select = screen.getByLabelText("Meeting") as HTMLSelectElement;
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toEqual(["Weekly Sync", "Planning"]);
  });

  it("calls onSave with selected meetingId in add mode", () => {
    const onSave = vi.fn();
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={onSave}
        item={null}
        mode="add"
        meetings={MEETINGS}
      />,
    );
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "New task" } });
    fireEvent.change(screen.getByLabelText("Meeting"), { target: { value: "m2" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith(
      { description: "New task", owner: "", requester: "", due_date: null, priority: "normal" },
      "m2",
    );
  });

  it("hides meeting dropdown in edit mode", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={makeItem()}
      />,
    );
    expect(screen.queryByLabelText("Meeting")).toBeNull();
  });
});

const OWNERS = ["Bob", "Carol"];
const REQUESTERS = ["Alice", "Dave"];

describe("EditActionItemDialog — Owner/Requester dropdowns", () => {
  it("renders owner as select dropdown when owners prop is provided", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={makeItem()}
        owners={OWNERS}
      />,
    );
    const select = screen.getByLabelText("Owner") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toEqual(["", "Bob", "Carol"]);
    expect(select.value).toBe("Bob");
  });

  it("renders requester as select dropdown when requesters prop is provided", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={makeItem()}
        requesters={REQUESTERS}
      />,
    );
    const select = screen.getByLabelText("Requester") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toEqual(["", "Alice", "Dave"]);
    expect(select.value).toBe("Alice");
  });

  it("saves selected owner and requester from dropdowns", () => {
    const onSave = vi.fn();
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={onSave}
        item={makeItem()}
        owners={OWNERS}
        requesters={REQUESTERS}
      />,
    );
    fireEvent.change(screen.getByLabelText("Owner"), { target: { value: "Carol" } });
    fireEvent.change(screen.getByLabelText("Requester"), { target: { value: "Dave" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({
      description: "Write docs",
      owner: "Carol",
      requester: "Dave",
      due_date: "2026-04-01",
      priority: "normal",
    });
  });

  it("renders owner as text input when owners prop is not provided", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={makeItem()}
      />,
    );
    const input = screen.getByLabelText("Owner") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
  });
});
