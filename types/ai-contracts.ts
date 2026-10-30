/** Shared TypeScript contracts for AIOU Coaching's browser/AI tools.
 * Keep secrets out of these structures; Worker tokens are user-managed credentials.
 */
export type AiTask = "assignment_feedback" | "practice_questions" | "explain_topic";

export interface AiRequest {
  task: AiTask;
  prompt: string;
  sourceText?: string;
  language?: "ur" | "en" | "mixed";
  maxTokens?: number;
}

export interface AiIssue {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  suggestion?: string;
}

export interface AssignmentAudit {
  kind: "assignment_audit";
  word_count: number;
  paragraph_count: number;
  heading_count: number;
  checks: Array<{ id: string; ok: boolean; message: string }>;
  notice: string;
}

export interface PracticeQuestion {
  number: number;
  type: "revision";
  question: string;
}

export interface PracticeSet {
  kind: "practice_questions";
  questions: PracticeQuestion[];
  notice: string;
}

export interface WorkerAiResult {
  id: string | null;
  name: string;
  model: string;
  ok: boolean;
  text: string;
  reasoning: string;
  error: string;
  ms: number;
  chars: number;
}

export type StudyToolResult = AssignmentAudit | PracticeSet | WorkerAiResult;

export function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
