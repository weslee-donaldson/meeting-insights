import { useQuery } from "@tanstack/react-query";

export function useClients() {
  return useQuery<string[]>({
    queryKey: ["clients"],
    queryFn: () => window.api.getClients(),
  });
}
