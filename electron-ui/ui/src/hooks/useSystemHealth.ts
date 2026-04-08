import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HealthStatus, ErrorGroup } from "../../../electron/channels.js";

export type { HealthStatus, ErrorGroup };

export function useSystemHealth() {
  const queryClient = useQueryClient();

  const query = useQuery<HealthStatus>({
    queryKey: ["system-health"],
    queryFn: () => window.api.getHealth(),
    refetchInterval: 30_000,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

  const acknowledgeAllMutation = useMutation({
    mutationFn: () => window.api.acknowledgeHealthErrors(undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["system-health"] }),
  });

  const acknowledgeErrorsMutation = useMutation({
    mutationFn: (ids: string[]) => window.api.acknowledgeHealthErrors(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["system-health"] }),
  });

  return {
    health: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    acknowledgeAll: () => acknowledgeAllMutation.mutateAsync(),
    acknowledgeErrors: (ids: string[]) => acknowledgeErrorsMutation.mutateAsync(ids),
  };
}
