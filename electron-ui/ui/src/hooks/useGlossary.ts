import { useQuery } from "@tanstack/react-query";

export interface GlossaryEntry {
  term: string;
  variants: string[];
  description: string;
}

export function useGlossary(clientName: string | null | undefined) {
  return useQuery<GlossaryEntry[]>({
    queryKey: ["glossary", clientName],
    queryFn: () => window.api.getGlossary(clientName!),
    enabled: !!clientName,
  });
}
