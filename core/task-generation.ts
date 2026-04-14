import { createLogger } from "./logger.js";
import type { LlmAdapter } from "./llm/adapter.js";

const log = createLogger("task");

interface GeneratedTask {
  title: string;
  description: string;
  acceptance_criteria: string[];
  source_meeting_ids: string[];
}

export async function generateTask(
  llm: LlmAdapter,
  curatedContext: string,
  taskIntent: string,
  sourceMeetingIds: string[],
): Promise<GeneratedTask> {
  const content = `Context:\n${curatedContext}\n\nTask Intent: ${taskIntent}`;
  const result = await llm.complete("generate_task", content);
  const task: GeneratedTask = {
    title: result.title as string,
    description: result.description as string,
    acceptance_criteria: result.acceptance_criteria as string[],
    source_meeting_ids: sourceMeetingIds,
  };
  log("generated task: %s sources=%d", task.title, sourceMeetingIds.length);
  return task;
}
