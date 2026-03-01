import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScopeBar } from "./components/ScopeBar.js";
import { AppLayout } from "./components/AppLayout.js";
import { ClientsColumn } from "./components/ClientsColumn.js";
import { MeetingsColumn } from "./components/MeetingsColumn.js";
import { ContextViewColumn } from "./components/ContextViewColumn.js";
import { ChatColumn } from "./components/ChatColumn.js";
import { useTheme } from "./ThemeContext.js";
import type { MeetingRow, ChatResponse, Artifact, SearchResultRow } from "../../electron/channels.js";

interface DateRange {
  after: string;
  before: string;
}

interface MeetingWithArtifact {
  meeting: MeetingRow;
  artifact: Artifact | null;
}

export function App() {
  const { theme, setTheme, themes } = useTheme();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ after: "", before: "" });
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<Set<string>>(new Set());
  const [pinnedSearchResults, setPinnedSearchResults] = useState<SearchResultRow[]>([]);
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  const clientsQuery = useQuery<string[]>({
    queryKey: ["clients"],
    queryFn: () => window.api.getClients(),
  });

  const meetingsQuery = useQuery<MeetingRow[]>({
    queryKey: ["meetings", selectedClient, dateRange],
    queryFn: () =>
      window.api.getMeetings({
        client: selectedClient ?? undefined,
        after: dateRange.after || undefined,
        before: dateRange.before || undefined,
      }),
  });

  const scopeMeetings = meetingsQuery.data ?? [];
  const activeMeetingIds =
    selectedMeetingIds.size > 0
      ? [...selectedMeetingIds]
      : scopeMeetings.map((m) => m.id);

  const artifactsQuery = useQuery<{ [id: string]: Artifact | null }>({
    queryKey: ["artifacts", activeMeetingIds],
    queryFn: async () => {
      const entries = await Promise.all(
        activeMeetingIds.map(async (id) => [id, await window.api.getArtifact(id)] as const),
      );
      return Object.fromEntries(entries);
    },
    enabled: activeMeetingIds.length > 0,
  });

  const activeMeetingsWithArtifacts: MeetingWithArtifact[] = activeMeetingIds
    .map((id) => {
      const meeting = scopeMeetings.find((m) => m.id === id);
      if (meeting) return { meeting, artifact: artifactsQuery.data?.[id] ?? null };
      const pinned = pinnedSearchResults.find((r) => r.meeting_id === id);
      if (pinned) return {
        meeting: { id: pinned.meeting_id, title: pinned.meeting_type, date: pinned.date, client: pinned.client, series: pinned.meeting_type },
        artifact: artifactsQuery.data?.[id] ?? null,
      };
      return null;
    })
    .filter((m): m is MeetingWithArtifact => m !== null);

  const charCount = activeMeetingsWithArtifacts.reduce((acc, { artifact }) => {
    if (!artifact) return acc;
    return acc + JSON.stringify(artifact).length;
  }, 0);

  const handleClientChange = useCallback((name: string) => {
    setSelectedClient(name);
    setSelectedMeetingIds(new Set());
  }, []);

  const handleDateChange = useCallback((range: DateRange) => {
    setDateRange(range);
    setSelectedMeetingIds((prev) => {
      const scopeIds = new Set(scopeMeetings.map((m) => m.id));
      const pruned = new Set([...prev].filter((id) => scopeIds.has(id)));
      return pruned;
    });
  }, [scopeMeetings]);

  const handleSelectSearchResults = useCallback((results: SearchResultRow[]) => {
    setPinnedSearchResults(results);
    setSelectedMeetingIds(new Set(results.map((r) => r.meeting_id)));
  }, []);

  const handleReset = useCallback(() => {
    setSelectedClient(null);
    setDateRange({ after: "", before: "" });
    setSelectedMeetingIds(new Set());
    setPinnedSearchResults([]);
  }, []);

  const handleToggle = useCallback((id: string) => {
    setSelectedMeetingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleGroup = useCallback((ids: string[]) => {
    setSelectedMeetingIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const handleChat = useCallback(
    async (question: string): Promise<ChatResponse> => {
      return window.api.chat({ meetingIds: activeMeetingIds, question });
    },
    [activeMeetingIds],
  );

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
      <ScopeBar
        clients={clientsQuery.data ?? []}
        selectedClient={selectedClient}
        dateRange={dateRange}
        onClientChange={handleClientChange}
        onDateChange={handleDateChange}
        onReset={handleReset}
        onSelectSearchResults={handleSelectSearchResults}
        theme={theme}
        setTheme={setTheme}
        themes={themes}
      />
      <AppLayout
        contextCollapsed={contextCollapsed}
        chatCollapsed={chatCollapsed}
        onCollapseContext={() => setContextCollapsed((v) => !v)}
        onCollapseChat={() => setChatCollapsed((v) => !v)}
        clientsPanel={
          <ClientsColumn
            clients={clientsQuery.data ?? []}
            selected={selectedClient}
            onSelect={handleClientChange}
          />
        }
        meetingsPanel={
          <MeetingsColumn
            meetings={scopeMeetings}
            selected={selectedMeetingIds}
            onToggle={handleToggle}
            onToggleGroup={handleToggleGroup}
          />
        }
        contextPanel={
          <ContextViewColumn meetings={activeMeetingsWithArtifacts} />
        }
        chatPanel={
          <ChatColumn
            contextInfo={{ meetingCount: activeMeetingIds.length, charCount }}
            onChat={handleChat}
          />
        }
      />
    </div>
  );
}
