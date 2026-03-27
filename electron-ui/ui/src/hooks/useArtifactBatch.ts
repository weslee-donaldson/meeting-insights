import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useArtifactBatch(meetingIds: string[]) {
  const sortedIds = useMemo(() => meetingIds.slice().sort(), [meetingIds]);
  const key = useMemo(() => sortedIds.join(","), [sortedIds]);

  return useQuery({
    queryKey: ["artifactBatch", key],
    queryFn: () => window.api.artifactBatch(sortedIds),
    enabled: sortedIds.length > 0,
    staleTime: 120_000,
  });
}
