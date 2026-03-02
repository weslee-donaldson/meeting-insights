import React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen } from "lucide-react";

interface Props {
  contextCollapsed: boolean;
  chatCollapsed: boolean;
  onCollapseContext: () => void;
  onCollapseChat: () => void;
  clientsPanel: React.ReactNode;
  meetingsPanel: React.ReactNode;
  contextPanel: React.ReactNode;
  chatPanel: React.ReactNode;
}

export function AppLayout({
  contextCollapsed,
  chatCollapsed,
  onCollapseContext,
  onCollapseChat,
  clientsPanel,
  meetingsPanel,
  contextPanel,
  chatPanel,
}: Props) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Group orientation="horizontal" className="flex-1 overflow-hidden" style={{ display: "flex" }}>
        <Panel
          data-testid="clients-panel"
          defaultSize={12}
          minSize={8}
          style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid var(--color-border)" }}
        >
          <div
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b"
            style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)", background: "var(--color-bg-panel)" }}
          >
            Clients
          </div>
          <div className="flex-1 overflow-y-auto" style={{ background: "var(--color-bg-panel)" }}>{clientsPanel}</div>
        </Panel>

        <Separator style={{ width: 1, background: "var(--color-border)", cursor: "col-resize" }} />

        <Panel
          data-testid="meetings-panel"
          defaultSize={18}
          minSize={12}
          style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid var(--color-border)" }}
        >
          <div
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b"
            style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)", background: "var(--color-bg-panel)" }}
          >
            Meetings
          </div>
          <div className="flex-1 overflow-y-auto" style={{ background: "var(--color-bg-panel)" }}>{meetingsPanel}</div>
        </Panel>

        <Separator style={{ width: 1, background: "var(--color-border)", cursor: "col-resize" }} />

        {!contextCollapsed ? (
          <>
            <Panel
              data-testid="context-panel"
              defaultSize={35}
              minSize={20}
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid var(--color-border)" }}
            >
              <div
                className="flex items-center px-3 py-2 border-b"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg-panel)" }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wider flex-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Context
                </span>
                <button
                  onClick={onCollapseContext}
                  style={{ color: "var(--color-text-muted)" }}
                  className="hover:opacity-80"
                  aria-label="Collapse context panel"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ background: "var(--color-bg-base)" }}>{contextPanel}</div>
            </Panel>
            <Separator style={{ width: 1, background: "var(--color-border)", cursor: "col-resize" }} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1px solid var(--color-border)", background: "var(--color-bg-panel)" }}>
            <button
              onClick={onCollapseContext}
              style={{ color: "var(--color-text-muted)" }}
              className="p-2 hover:opacity-80"
              aria-label="Expand context panel"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {!chatCollapsed ? (
          <Panel
            data-testid="chat-panel"
            defaultSize={35}
            minSize={20}
            style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div
              className="flex items-center px-3 py-2 border-b"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg-panel)" }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider flex-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Chat
              </span>
              <button
                onClick={onCollapseChat}
                style={{ color: "var(--color-text-muted)" }}
                className="hover:opacity-80"
                aria-label="Collapse chat panel"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden" style={{ background: "var(--color-bg-base)" }}>{chatPanel}</div>
          </Panel>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "var(--color-bg-panel)" }}>
            <button
              onClick={onCollapseChat}
              style={{ color: "var(--color-text-muted)" }}
              className="p-2 hover:opacity-80"
              aria-label="Expand chat panel"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </Group>
    </div>
  );
}
