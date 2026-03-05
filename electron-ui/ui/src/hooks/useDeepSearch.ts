import { useQuery } from "@tanstack/react-query";

export function useDeepSearch(meetingIds: string[], query: string, enabled: boolean) {
  const sortedIds = meetingIds.slice().sort();
  return useQuery({
    queryKey: ["deepSearch", query, ...sortedIds],
    queryFn: () => window.api.deepSearch({ meetingIds, query }),
    enabled: enabled && meetingIds.length > 0 && query.length >= 2,
    staleTime: 120_000,
  });
}
