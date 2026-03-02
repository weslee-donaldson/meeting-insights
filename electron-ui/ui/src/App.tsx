import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinearShell } from "./components/LinearShell.js";
import { Sidebar } from "./components/Sidebar.js";
import { TopBar } from "./components/TopBar.js";
import { MeetingList } from "./components/MeetingList.js";
import { MeetingDetail } from "./components/MeetingDetail.js";
import { useTheme } from "./ThemeContext.js";
import type { MeetingRow, ChatResponse, Artifact, SearchResultRow } from "../../electron/channels.js";

interface DateRange {
  after: string;
  before: string;
}

export function App() {
  const { theme, setTheme, themes } = useTheme();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ after: "", before: "" });
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [checkedMeetingIds, setCheckedMeetingIds] = useState<Set<string>>(new Set());

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
    checkedMeetingIds.size > 0
      ? [...checkedMeetingIds]
      : selectedMeetingId
      ? [selectedMeetingId]
      : [];

  const selectedMeeting = selectedMeetingId
    ? (scopeMeetings.find((m) => m.id === selectedMeetingId) ?? null)
    : null;

  const selectedArtifactQuery = useQuery<Artifact | null>({
    queryKey: ["artifact", selectedMeetingId],
    queryFn: () => window.api.getArtifact(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  });

  const charCount = selectedArtifactQuery.data
    ? JSON.stringify(selectedArtifactQuery.data).length
    : 0;

  const handleClientChange = useCallback((name: string | null) => {
    setSelectedClient(name);
    setCheckedMeetingIds(new Set());
  }, []);

  const handleDateChange = useCallback((field: "after" | "before", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setCheckedMeetingIds((prev) => {
      const scopeIds = new Set(scopeMeetings.map((m) => m.id));
      return new Set([...prev].filter((id) => scopeIds.has(id)));
    });
  }, [scopeMeetings]);

  const handleSelectSearchResults = useCallback((results: SearchResultRow[]) => {
    setCheckedMeetingIds(new Set(results.map((r) => r.meeting_id)));
    if (results.length > 0) setSelectedMeetingId(results[0].meeting_id);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedClient(null);
    setDateRange({ after: "", before: "" });
    setSelectedMeetingId(null);
    setCheckedMeetingIds(new Set());
  }, []);

  const handleCheck = useCallback((id: string) => {
    setCheckedMeetingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCheckGroup = useCallback((ids: string[]) => {
    setCheckedMeetingIds((prev) => {
      const allChecked = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allChecked) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
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
    <LinearShell
      detailOpen={!!selectedMeetingId}
      topBar={
        <TopBar
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
      }
      sidebar={
        <Sidebar
          clients={clientsQuery.data ?? []}
          selected={selectedClient}
          onSelect={handleClientChange}
        />
      }
      main={
        <MeetingList
          meetings={scopeMeetings}
          selectedId={selectedMeetingId}
          checked={checkedMeetingIds}
          onSelect={setSelectedMeetingId}
          onCheck={handleCheck}
          onCheckGroup={handleCheckGroup}
        />
      }
      detail={
        <MeetingDetail
          meeting={selectedMeeting}
          artifact={selectedArtifactQuery.data ?? null}
          chatContext={{ meetingIds: activeMeetingIds, charCount }}
          onChat={handleChat}
        />
      }
    />
  );
}
