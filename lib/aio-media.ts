/**
 * Curated free videos for the Few-Day Interview Path.
 * Videos build fluency and show real demonstrations; authored AIO lessons still
 * own the role judgment, boundaries, and required work products.
 */

export type AioMediaCue = {
  id: string;
  moduleId: string;
  resourceType: "video";
  title: string;
  url: string;
  publisher: string;
  /** Assigned viewing time; a long video may use only `watchSegment`. */
  durationMinutes: number;
  watchSegment?: string;
  watchFor: string;
  doAfter: string;
  validatedAt: string;
  revalidateBy: string;
};

const validatedAt = "2026-07-19";
const revalidateBy = "2027-01-15";

/** URLs and titles were checked on 2026-07-19. Revalidate before the date above. */
export const aioMediaCatalog: AioMediaCue[] = [
  {
    id: "media-coding-python-functions",
    moduleId: "coding-day-1-04",
    resourceType: "video",
    title: "Python for Beginners — functions segment",
    url: "https://www.youtube.com/watch?v=eWRfhZUzrAc&t=7570s",
    publisher: "freeCodeCamp.org",
    durationMinutes: 18,
    watchSegment: "Start at 2:06:10; stop after the functions practice segment.",
    watchFor:
      "Arguments, return values, and how a small function becomes a testable contract.",
    doAfter:
      "Implement evaluate_reading and test the 79.9 / 80 / 90 boundaries in Coding Day 1.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-coding-json",
    moduleId: "coding-day-1-05",
    resourceType: "video",
    title: "Learn JSON — full crash course for beginners",
    url: "https://www.youtube.com/watch?v=GpOO5iKzOmY",
    publisher: "freeCodeCamp.org",
    durationMinutes: 12,
    watchFor:
      "Objects, arrays, scalar types, serialization, and why JSON is a wire format rather than a Python dictionary.",
    doAfter:
      "Serialize the urgent-reading list, parse it back, and name one invalid shape the API must reject.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-coding-fastapi",
    moduleId: "coding-day-2-03",
    resourceType: "video",
    title: "FastAPI tutorial — request validation and interactive docs",
    url: "https://www.youtube.com/watch?v=Wr1JjhTt1Xg",
    publisher: "codebasics",
    durationMinutes: 16,
    watchFor:
      "GET/POST routes, typed validation, generated docs, and the difference between a request contract and business logic.",
    doAfter:
      "Build POST /triage with a Pydantic request model, then provoke one 422 response in the interactive docs.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-coding-structured-output",
    moduleId: "coding-day-3-03",
    resourceType: "video",
    title: "Prompt engineering — structured output segment",
    url: "https://www.youtube.com/watch?v=2BpCk4d2Cc0&t=1200s",
    publisher: "Tech With Tim",
    durationMinutes: 10,
    watchSegment:
      "Start at 20:00; watch structured output, constraints, and iterative repair.",
    watchFor:
      "A requested shape is not trusted until application code validates it.",
    doAfter:
      "Complete the Extraction schema and write one malformed-output rejection case.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-01-discovery",
    moduleId: "aio-sprint-01-role-narrative",
    resourceType: "video",
    title: "Discovery still matters when AI makes building faster",
    url: "https://www.youtube.com/watch?v=lu0a-VRkKeY&t=631s",
    publisher: "Udacity / Marty Cagan",
    durationMinutes: 12,
    watchSegment:
      "Start at 10:31; focus on building to learn, discovery, and owning outcomes.",
    watchFor:
      "Why a requested technology is not the user problem and why discovery tests risk before scale.",
    doAfter:
      "Write Q1–Q7 in Sprint 01 before drafting the separate role narrative.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-02-context",
    moduleId: "aio-sprint-02-llm-fundamentals",
    resourceType: "video",
    title: "Foundations of Context — context-window mental model",
    url: "https://www.youtube.com/watch?v=xlUIiTSaFKI",
    publisher: "The AI Engineering Academy",
    durationMinutes: 18,
    watchSegment:
      "Watch the context components, token-budget, and context-rot sections.",
    watchFor:
      "Instructions, user input, history, retrieved knowledge, tools, and state all compete for a finite context budget.",
    doAfter:
      "Complete BUDGET-1 through BUDGET-5 and explain what gets removed first on overflow.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-03-rag",
    moduleId: "aio-sprint-03-rag",
    resourceType: "video",
    title: "How to use Retrieval Augmented Generation (RAG)",
    url: "https://www.youtube.com/watch?v=oVtlp72f9NQ",
    publisher: "Google Cloud Tech",
    durationMinutes: 7,
    watchFor:
      "Index → retrieve → augment → generate; semantic relevance does not grant authorization.",
    doAfter:
      "Write STEP-1 through STEP-6, placing policy before retrieval and cite/abstain after evidence checks.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-04-security",
    moduleId: "aio-sprint-04-secure-boundary",
    resourceType: "video",
    title: "How to secure your AI agents — technical deep dive",
    url: "https://www.youtube.com/watch?v=jZXvqEqJT7o",
    publisher: "Google Cloud Tech",
    durationMinutes: 18,
    watchSegment:
      "Focus on prompt injection, unsafe output, authentication/authorization, and least privilege.",
    watchFor:
      "Controls enforced outside the model still hold when retrieved text or a user tries to redirect it.",
    doAfter:
      "Write the pilot boundary, then identify which control blocks an injected request for a write tool.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-05-evaluation",
    moduleId: "aio-sprint-05-evaluation",
    resourceType: "video",
    title: "How to Build, Evaluate, and Iterate on LLM Agents",
    url: "https://www.youtube.com/watch?v=0pnEUAwoDP0",
    publisher: "DeepLearning.AI",
    durationMinutes: 20,
    watchSegment:
      "Focus on the RAG triad and separating retrieval from generation evaluation.",
    watchFor:
      "Evaluation is a dataset + expected behavior + metric + failure category, not a polished demo or one overall score.",
    doAfter:
      "Author all 12 CASE lines (including search-cite-outside-corpus, reasoning_effort/p95, and tool-write-outside-allowlist), then complete aio-lab-05.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-06-system-design",
    moduleId: "aio-sprint-06-system-design",
    resourceType: "video",
    title: "System Design Interview — a step-by-step guide",
    url: "https://www.youtube.com/watch?v=i7twT3x5yv8",
    publisher: "ByteByteGo",
    durationMinutes: 10,
    watchFor:
      "Clarify requirements → high-level design → deep dive → bottlenecks; map each step to AI controls.",
    doAfter:
      "Write COMPONENT-1 through COMPONENT-8 and rehearse one failure deep dive before aio-lab-06.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-07-defense",
    moduleId: "aio-sprint-07-project-defense",
    resourceType: "video",
    title: "Behavioral interview answers — ownership and decision reasoning",
    url: "https://www.youtube.com/watch?v=CAda15Tawlg",
    publisher: "Exponent",
    durationMinutes: 15,
    watchSegment:
      "Focus on personal contribution, why a choice was made, and evidence rather than team-level generalities.",
    watchFor:
      "Use “I” for your contribution and separate supplied scaffold, AI assistance, and independently verified work.",
    doAfter:
      "Run the procedure-assistant tests and write the mini-capstone defense card.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-09-prompt-agency",
    moduleId: "aio-sprint-09-prompt-and-agency",
    resourceType: "video",
    title: "OWASP LLM Top 10 — prompt injection overview segment",
    url: "https://www.youtube.com/watch?v=rA_lF-_BAss",
    publisher: "OWASP / community explainer",
    durationMinutes: 12,
    watchSegment: "Watch the prompt-injection / LLM01 overview; stop before unrelated tooling demos.",
    watchFor:
      "How untrusted data can try to override instructions, and why application controls must stay outside the model.",
    doAfter:
      "Write CONTRACT and AGENCY lines for a shift-handoff workflow in aio-sprint-09 work product — do not copy the lesson exemplar.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-10-grok-tools",
    moduleId: "aio-sprint-10-grok-model-ops",
    resourceType: "video",
    title: "How to secure your AI agents — tool and privilege segment",
    url: "https://www.youtube.com/watch?v=jZXvqEqJT7o",
    publisher: "Google Cloud Tech",
    durationMinutes: 12,
    watchSegment:
      "Re-watch the authentication/authorization and least-privilege tool sections; map them to Grok tool allowlists.",
    watchFor:
      "Provider tools (search, function calling, code execution) still need application allowlists; search hits are not automatic authorization.",
    doAfter:
      "Read the Grok 4.5 at-a-glance table on docs.x.ai, then write CALL/TOOLS/REASONING/COMPARE/UNKNOWN in the Sprint 10 work product and complete aio-lab-grok-routing.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-11-prompt-engineering",
    moduleId: "aio-sprint-11-prompt-engineering",
    resourceType: "video",
    title: "Prompt engineering — structured output segment",
    url: "https://www.youtube.com/watch?v=2BpCk4d2Cc0&t=1200s",
    publisher: "Tech With Tim",
    durationMinutes: 10,
    watchSegment:
      "Start at 20:00; watch structured output, constraints, and iterative repair.",
    watchFor:
      "A requested shape is not trusted until application code validates it; iterate against failures, not vibes.",
    doAfter:
      "Write PROMPT-V1/V2 + DELTA + CASE + TEACHBACK in Sprint 11, then practice the three Grok fixtures in aio-lab-grok-live.",
    validatedAt,
    revalidateBy,
  },
  {
    id: "media-sprint-08-mock",
    moduleId: "aio-sprint-08-mock-loop",
    resourceType: "video",
    title: "How to prepare for a job interview",
    url: "https://www.youtube.com/watch?v=enD8mK9Zvwo",
    publisher: "Utrecht University",
    durationMinutes: 8,
    watchFor:
      "Short, specific answers; motivation; STAR for behavioral questions; and making the interview a two-way conversation.",
    doAfter:
      "Run the required four-round Interview Studio mock and preserve every first answer before revision.",
    validatedAt,
    revalidateBy,
  },
];

export function mediaForModule(moduleId: string): AioMediaCue[] {
  return aioMediaCatalog.filter((entry) => entry.moduleId === moduleId);
}

export function mediaById(id: string): AioMediaCue | undefined {
  return aioMediaCatalog.find((entry) => entry.id === id);
}
