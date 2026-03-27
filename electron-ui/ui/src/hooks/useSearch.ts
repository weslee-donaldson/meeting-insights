import { useQuery } from "@tanstack/react-query";

export function useSearch(
  query: string,
  client?: string,
  dateAfter?: string,
  dateBefore?: string,
  options?: { searchFields?: string[]; keyPrefix?: string },
) {
  const prefix = options?.keyPrefix ?? "search";
  return useQuery({
    queryKey: [prefix, query, client, dateAfter, dateBefore, options?.searchFields],
    queryFn: () => window.api.search({
      query,
      ...(client ? { client } : {}),
      ...(dateAfter ? { date_after: dateAfter } : {}),
      ...(dateBefore ? { date_before: dateBefore } : {}),
      ...(options?.searchFields ? { searchFields: options.searchFields } : {}),
    }),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}
