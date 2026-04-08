import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
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

  const acknowledgeAll = useCallback(async () => {
    await window.api.acknowledgeHealthErrors(undefined);
    await queryClient.invalidateQueries({ queryKey: ["system-health"] });
  }, [queryClient]);

  const acknowledgeErrors = useCallback(async (ids: string[]) => {
    await window.api.acknowledgeHealthErrors(ids);
    await queryClient.invalidateQueries({ queryKey: ["system-health"] });
  }, [queryClient]);

  return {
    health: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    acknowledgeAll,
    acknowledgeErrors,
  };
}
