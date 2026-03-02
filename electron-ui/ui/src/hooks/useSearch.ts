import { useQuery } from "@tanstack/react-query";

export function useSearch(query: string, client?: string) {
  return useQuery({
    queryKey: ["search", query, client],
    queryFn: () => window.api.search({ query, client }),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}
