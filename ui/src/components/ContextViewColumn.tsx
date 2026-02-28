import React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { Artifact } from "../../../electron/channels.js";
import type { MeetingRow } from "../../../electron/channels.js";

interface MeetingWithArtifact {
  meeting: MeetingRow;
  artifact: Artifact | null;
}

interface Props {
  meetings: MeetingWithArtifact[];
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isEmpty: boolean;
}

function Section({ title, children, isEmpty }: SectionProps) {
  const [open, setOpen] = React.useState(false);
  if (isEmpty) return null;
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="flex items-center gap-1 w-full text-left py-1 text-xs font-semibold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider">
        {open ? (
          <ChevronDown className="w-3 h-3 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 shrink-0" />
        )}
        {title}
      </Collapsible.Trigger>
      <Collapsible.Content className="mt-1 text-sm text-zinc-300 space-y-1">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function ArtifactView({ artifact }: { artifact: Artifact }) {
  const hasDecisions = artifact.decisions.length > 0;
  const hasActionItems = artifact.action_items.length > 0;
  const hasQuestions = artifact.open_questions.length > 0;
  const hasRisks = artifact.risk_items.length > 0;
  const hasFeatures = artifact.proposed_features.length > 0;
  const hasTopics = artifact.technical_topics.length > 0;
  const hasNotes = artifact.additional_notes.length > 0;

  return (
    <div className="space-y-1">
      <Section title="Summary" isEmpty={!artifact.summary}>
        <p className="text-zinc-400 leading-relaxed">{artifact.summary}</p>
      </Section>

      <Section title="Decisions" isEmpty={!hasDecisions}>
        <ul className="space-y-0.5">
          {artifact.decisions.map((d, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-zinc-600 shrink-0">—</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Action Items" isEmpty={!hasActionItems}>
        <ul className="space-y-0.5">
          {artifact.action_items.map((a, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-zinc-600 shrink-0">□</span>
              <span>
                {a.description}
                <span className="text-zinc-500 ml-1">
                  ({a.owner}
                  {a.due_date ? `, ${a.due_date}` : ""})
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Open Questions" isEmpty={!hasQuestions}>
        <ul className="space-y-0.5">
          {artifact.open_questions.map((q, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-zinc-600 shrink-0">?</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Risks" isEmpty={!hasRisks}>
        <ul className="space-y-0.5">
          {artifact.risk_items.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-zinc-600 shrink-0">⚠</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Proposed Features" isEmpty={!hasFeatures}>
        <ul className="space-y-0.5">
          {artifact.proposed_features.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-zinc-600 shrink-0">✦</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Technical Topics" isEmpty={!hasTopics}>
        <ul className="space-y-0.5">
          {artifact.technical_topics.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-zinc-600 shrink-0">◆</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Additional Notes" isEmpty={!hasNotes}>
        {artifact.additional_notes.map((note, i) => {
          const entries = Object.entries(note);
          const header = entries.find(([, v]) => typeof v === "string");
          return (
            <div key={i} className="space-y-0.5">
              {header && (
                <div className="text-zinc-400 font-medium">{String(header[1])}</div>
              )}
              {entries
                .filter(([k]) => k !== header?.[0])
                .map(([k, v]) => {
                  const items = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
                  return items.map((item, j) => (
                    <div key={`${k}-${j}`} className="flex gap-2 pl-2">
                      <span className="text-zinc-600">•</span>
                      <span>{String(item)}</span>
                    </div>
                  ));
                })}
            </div>
          );
        })}
      </Section>
    </div>
  );
}

export function ContextViewColumn({ meetings }: Props) {
  return (
    <div className="divide-y divide-zinc-800">
      {meetings.map(({ meeting, artifact }) => (
        <div key={meeting.id} className="p-4">
          <div className="mb-3">
            <div className="font-medium text-zinc-100 text-sm">{meeting.title}</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {meeting.date.slice(0, 10)}
              {meeting.client && (
                <span className="ml-2 text-zinc-600">[{meeting.client}]</span>
              )}
            </div>
          </div>
          {artifact ? (
            <ArtifactView artifact={artifact} />
          ) : (
            <div className="text-xs text-zinc-600">No artifact extracted</div>
          )}
        </div>
      ))}
      {meetings.length === 0 && (
        <div className="p-4 text-xs text-zinc-600">No meetings selected</div>
      )}
    </div>
  );
}
