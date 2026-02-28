import { useQuery } from "@tanstack/react-query";
import type { Artifact } from "../../../electron/channels.js";

export function useArtifact(meetingId: string | undefined) {
  return useQuery<Artifact | null>({
    queryKey: ["artifact", meetingId],
    queryFn: () => window.api.getArtifact(meetingId!),
    enabled: !!meetingId,
  });
}
