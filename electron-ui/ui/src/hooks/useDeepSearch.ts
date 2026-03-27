import { useQuery } from "@tanstack/react-query";

export function useDeepSearch(
  meetingIds: string[],
  query: string,
  enabled: boolean,
  options?: { keyPrefix?: string },
) {
  const prefix = options?.keyPrefix ?? "deepSearch";
  const sortedIds = meetingIds.slice().sort();
  return useQuery({
    queryKey: [prefix, query, ...sortedIds],
    queryFn: () => window.api.deepSearch({ meetingIds, query }),
    enabled: enabled && meetingIds.length > 0 && query.length >= 2,
    staleTime: 120_000,
  });
}
