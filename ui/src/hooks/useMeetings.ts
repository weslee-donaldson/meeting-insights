import { useQuery } from "@tanstack/react-query";
import type { MeetingRow, MeetingFilters } from "../../../electron/channels.js";

export function useMeetings(filters: MeetingFilters) {
  return useQuery<MeetingRow[]>({
    queryKey: ["meetings", filters],
    queryFn: () => window.api.getMeetings(filters),
  });
}
