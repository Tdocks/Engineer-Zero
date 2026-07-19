/**
 * Bounded Grok practice fixtures for the Few-Day Interview Path.
 * Live calls go through /api/course/grok-practice with server-only XAI_API_KEY.
 * Deterministic fallbacks keep the packet completable without a key.
 */

export const GROK_PRACTICE_MODEL = "grok-4.5";
export const GROK_PRACTICE_BASE_URL = "https://api.x.ai/v1";
export const GROK_PRACTICE_MAX_PROMPT_CHARS = 1200;
export const GROK_PRACTICE_DAILY_LIMIT_DEFAULT = 30;

export type GrokPracticeTaskId = "classify-cite" | "abstain-conflict" | "schema-repair";

export type GrokPracticeTask = {
  id: GrokPracticeTaskId;
  title: string;
  /** Trusted instruction layer (never from learner). */
  systemPrompt: string;
  /** Bounded user/data payload. */
  userPrompt: string;
  expectedBehavior: string;
  /** Deterministic fixture when XAI_API_KEY is unset or the provider fails. */
  fallbackOutput: {
    status: "answer" | "abstain";
    citations: string[];
    conflict?: boolean;
    reason: string;
  };
};

export const grokPracticeTasks: GrokPracticeTask[] = [
  {
    id: "classify-cite",
    title: "Classify and cite an authorized procedure step",
    systemPrompt:
      "You are a read-only procedure assistant. Answer only from authorized cited procedures. Return JSON: {status:\"answer\"|\"abstain\", citations:string[], conflict?:boolean, reason:string}. Never invent values.",
    userPrompt:
      "Authorized evidence:\n- SOP-12 Rev C: Lock out valve V-12 before opening the bay panel.\nQuestion: What is the lockout step for Line B valve V-12?",
    expectedBehavior: "status=answer with citation SOP-12 Rev C; no invented steps",
    fallbackOutput: {
      status: "answer",
      citations: ["SOP-12 Rev C"],
      reason: "Lock out valve V-12 before opening the bay panel.",
    },
  },
  {
    id: "abstain-conflict",
    title: "Abstain when two authorized sources conflict",
    systemPrompt:
      "You are a read-only procedure assistant. If authorized sources conflict on a consequential step, set status=abstain, conflict=true, and name both citations. Never silently pick.",
    userPrompt:
      "Authorized evidence:\n- Bulletin R8-A: Cool-down wait is 15 minutes.\n- Bulletin R8-B: Cool-down wait is 30 minutes.\nQuestion: How long should we wait before restart?",
    expectedBehavior: "status=abstain, conflict=true, cite both; no silent pick",
    fallbackOutput: {
      status: "abstain",
      citations: ["Bulletin R8-A", "Bulletin R8-B"],
      conflict: true,
      reason: "Authorized sources conflict on cool-down wait; escalate to content owner.",
    },
  },
  {
    id: "schema-repair",
    title: "Refuse free-text when schema is required",
    systemPrompt:
      "Return ONLY valid JSON matching {status:\"answer\"|\"abstain\", citations:string[], conflict?:boolean, reason:string}. If you cannot cite an authorized source, abstain. Do not return prose outside JSON.",
    userPrompt:
      "Authorized evidence: none for this question.\nQuestion: How long until the pump cools after shutdown?",
    expectedBehavior: "JSON abstain with empty citations; no invented cool-down number",
    fallbackOutput: {
      status: "abstain",
      citations: [],
      reason: "No authorized supporting source for cool-down duration.",
    },
  },
];

export function getGrokPracticeTask(taskId: string): GrokPracticeTask | undefined {
  return grokPracticeTasks.find((task) => task.id === taskId);
}

export function isGrokPracticeTaskId(value: string): value is GrokPracticeTaskId {
  return grokPracticeTasks.some((task) => task.id === value);
}

export type GrokPracticeRunResult = {
  mode: "live" | "fallback";
  taskId: GrokPracticeTaskId;
  model: string;
  output: GrokPracticeTask["fallbackOutput"];
  rawText?: string;
  requestId: string;
  message: string;
};

export function fallbackGrokPracticeResult(
  task: GrokPracticeTask,
  reason: string,
): GrokPracticeRunResult {
  return {
    mode: "fallback",
    taskId: task.id,
    model: GROK_PRACTICE_MODEL,
    output: task.fallbackOutput,
    requestId: `fallback-${task.id}-${Date.now()}`,
    message: reason,
  };
}

function extractJsonObject(text: string): GrokPracticeTask["fallbackOutput"] | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Partial<GrokPracticeTask["fallbackOutput"]>;
    if (parsed.status !== "answer" && parsed.status !== "abstain") return null;
    return {
      status: parsed.status,
      citations: Array.isArray(parsed.citations)
        ? parsed.citations.map(String).slice(0, 8)
        : [],
      conflict: Boolean(parsed.conflict),
      reason: String(parsed.reason ?? "").slice(0, 500),
    };
  } catch {
    return null;
  }
}

export async function runLiveGrokPractice(
  task: GrokPracticeTask,
  apiKey: string,
): Promise<GrokPracticeRunResult> {
  const response = await fetch(`${GROK_PRACTICE_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_PRACTICE_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: task.systemPrompt },
        { role: "user", content: task.userPrompt.slice(0, GROK_PRACTICE_MAX_PROMPT_CHARS) },
      ],
    }),
  });

  const requestId =
    response.headers.get("x-request-id") ||
    response.headers.get("cf-ray") ||
    `live-${task.id}-${Date.now()}`;

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `xAI request failed (${response.status}). ${detail.slice(0, 200)}`.trim(),
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const rawText = payload.choices?.[0]?.message?.content?.trim() ?? "";
  const parsed = extractJsonObject(rawText);
  if (!parsed) {
    return {
      mode: "live",
      taskId: task.id,
      model: GROK_PRACTICE_MODEL,
      output: {
        status: "abstain",
        citations: [],
        reason: "Live response failed schema parse; treat as abstain for practice.",
      },
      rawText: rawText.slice(0, 800),
      requestId,
      message: "Live call returned non-JSON; recorded as schema-repair practice signal.",
    };
  }

  return {
    mode: "live",
    taskId: task.id,
    model: GROK_PRACTICE_MODEL,
    output: parsed,
    rawText: rawText.slice(0, 800),
    requestId,
    message: "Live Grok practice call succeeded.",
  };
}
