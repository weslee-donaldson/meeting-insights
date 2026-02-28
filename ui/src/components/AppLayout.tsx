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
          style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid #27272a" }}
        >
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
            Clients
          </div>
          <div className="flex-1 overflow-y-auto">{clientsPanel}</div>
        </Panel>

        <Separator style={{ width: 1, background: "#27272a", cursor: "col-resize" }} />

        <Panel
          data-testid="meetings-panel"
          defaultSize={18}
          minSize={12}
          style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid #27272a" }}
        >
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
            Meetings
          </div>
          <div className="flex-1 overflow-y-auto">{meetingsPanel}</div>
        </Panel>

        <Separator style={{ width: 1, background: "#27272a", cursor: "col-resize" }} />

        {!contextCollapsed ? (
          <>
            <Panel
              data-testid="context-panel"
              defaultSize={35}
              minSize={20}
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid #27272a" }}
            >
              <div className="flex items-center px-3 py-2 border-b border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex-1">
                  Context
                </span>
                <button
                  onClick={onCollapseContext}
                  className="text-zinc-500 hover:text-zinc-300"
                  aria-label="Collapse context panel"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{contextPanel}</div>
            </Panel>
            <Separator style={{ width: 1, background: "#27272a", cursor: "col-resize" }} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1px solid #27272a", background: "#18181b" }}>
            <button
              onClick={onCollapseContext}
              className="p-2 text-zinc-500 hover:text-zinc-300"
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
            <div className="flex items-center px-3 py-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex-1">
                Chat
              </span>
              <button
                onClick={onCollapseChat}
                className="text-zinc-500 hover:text-zinc-300"
                aria-label="Collapse chat panel"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{chatPanel}</div>
          </Panel>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#18181b" }}>
            <button
              onClick={onCollapseChat}
              className="p-2 text-zinc-500 hover:text-zinc-300"
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
