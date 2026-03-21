import { z } from "zod/v4";

export const DecisionSchema = z.union([
  z.object({ text: z.string(), decided_by: z.string() }),
  z.string().transform((s) => ({ text: s, decided_by: "" })),
]);

export const ActionItemSchema = z.object({
  description: z.string(),
  owner: z.string(),
  requester: z.string().optional().default(""),
  due_date: z.union([z.string(), z.null()]).optional().default(null),
  priority: z.enum(["critical", "normal", "low"]).optional().default("normal"),
  short_id: z.string().optional(),
}).transform((a) => ({ ...a, requester: a.requester ?? "" }));

export const RiskItemSchema = z.union([
  z.object({
    category: z.enum(["relationship", "architecture", "engineering"]),
    description: z.string(),
  }),
  z.string().transform((s) => ({ category: "engineering" as const, description: s })),
]);

export const MilestoneSchema = z.object({
  title: z.string(),
  target_date: z.union([z.string(), z.null()]).optional().default(null),
  status_signal: z.string().optional().default(""),
  excerpt: z.string().optional().default(""),
});

export const ArtifactSchema = z.object({
  summary: z.string(),
  decisions: z.array(DecisionSchema),
  proposed_features: z.array(z.string()),
  action_items: z.array(ActionItemSchema),
  open_questions: z.array(z.string()),
  risk_items: z.array(RiskItemSchema),
  additional_notes: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  milestones: z.array(MilestoneSchema).optional().default([]),
});

export type ArtifactParsed = z.infer<typeof ArtifactSchema>;

export const ThreadStatusSchema = z.enum(["open", "resolved"]);
export const InsightStatusSchema = z.enum(["draft", "final"]);
export const MilestoneStatusSchema = z.enum(["on_track", "at_risk", "missed", "completed", "unscheduled"]);
