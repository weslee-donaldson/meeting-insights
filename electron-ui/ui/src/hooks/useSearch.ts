import { useQuery } from "@tanstack/react-query";

export function useSearch(query: string, client?: string, dateAfter?: string, dateBefore?: string) {
  return useQuery({
    queryKey: ["search", query, client, dateAfter, dateBefore],
    queryFn: () => window.api.search({
      query,
      ...(client ? { client } : {}),
      ...(dateAfter ? { date_after: dateAfter } : {}),
      ...(dateBefore ? { date_before: dateBefore } : {}),
    }),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}
