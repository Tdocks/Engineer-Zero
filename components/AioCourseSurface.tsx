"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CapabilityLevel, CourseAttemptRecord, CourseDraft, CourseStage, LearnerState, TrackId } from "@/lib/types";
import type { StructuredEvidence } from "@/lib/course-types";
import { recommendAioFoundationStart } from "@/lib/aio-foundation-path";

export type CourseKind = "module" | "lab" | "mission";
export type CourseBlock =
  | { type: "prose"; heading?: string; body: string }
  | { type: "caseStudy"; heading?: string; body: string }
  | { type: "workedExample"; heading?: string; body: string }
  | { type: "keyTakeaway"; heading?: string; body: string }
  | { type: "misconception"; heading?: string; items: string[] }
  | { type: "evidenceAsset"; name: string; content: string; kind?: string };
type Choice = {
  id: string;
  text: string;
  consequence?: string;
  disposition?: "no-ai" | "conventional" | "read-only-ai" | "human-approved" | "unsafe";
  nextStepId?: string;
};
type Question = {
  id: string;
  prompt: string;
  choices: Choice[];
  competency?: string;
  difficulty?: string;
};
export type CourseItem = {
  id: string;
  title: string;
  phaseId: string;
  week?: number;
  durationMinutes?: number;
  pillar?: string;
  conceptGroup?: string;
  mode?: string;
  capabilityLevel?: CapabilityLevel;
  performanceExpectation?: string;
  roleBoundary?: string;
  specialistEscalationGuidance?: string;
  pathAvailability?: Array<"sprint-48h" | "sprint-7-day" | "foundation-bridge" | "full-program" | "concept-library">;
  prerequisites?: string[];
  competencies?: Record<string, number>;
  outcome?: string;
  overview?: string;
  /** Editorial lesson blocks. Entries without blocks use the compatibility adapter below. */
  blocks?: CourseBlock[];
  sections?: Array<{ heading: string; body: string }>;
  workedExample?: string;
  misconceptions?: string[];
  knowledgeChecks?: Question[];
  scenario?: string;
  task?: string;
  assets?: Array<{ name: string; content: string; kind?: string }>;
  evidence?: { required: string[]; minimumWords?: number; requiredFields?: Array<keyof Omit<StructuredEvidence, "evidenceReferences">> };
  artifact?: { required: string[]; minimumWords?: number; requiredFields?: Array<keyof Omit<StructuredEvidence, "evidenceReferences">> };
  debrief: string;
  revisionPrompt?: string;
  sources?: Array<{
    title: string;
    url: string;
    publisher: string;
    accessed: string;
    version?: string;
    locator?: string;
    supportedClaim?: string;
    revalidateBy?: string;
  }>;
  instructionalDesign?: {
    approach: string;
    rationale: string;
    sources: Array<{
      title: string;
      url: string;
      publisher: string;
      accessed: string;
      version?: string;
      locator?: string;
      supportedClaim?: string;
    }>;
  };
  steps?: Array<{
    id: string;
    title: string;
    prompt: string;
    options: Choice[];
  }>;
  startStepId?: string;
  briefing?: string;
};
export type CourseCatalog = {
  version: string;
  modules: CourseItem[];
  labs: CourseItem[];
  missions: CourseItem[];
};
type Grade = {
  score: number;
  complete: boolean;
  feedback: string;
  artifact?: string;
  checks: Array<{ id: string; correct: boolean; explanation: string }>;
  rubric: {
    wordCount: number;
    artifactLength: boolean;
    checks: Array<{
      id: string;
      passed: boolean;
      label: string;
      detail: string;
    }>;
  };
};

const evidenceFields: Array<{
  key: keyof Omit<StructuredEvidence, "evidenceReferences">;
  label: string;
  prompt: string;
}> = [
  { key: "scenarioFact", label: "Scenario fact", prompt: "Name one concrete fact from the scenario or supplied evidence." },
  { key: "decision", label: "Decision", prompt: "State the specific recommendation or action you chose." },
  { key: "boundary", label: "Boundary", prompt: "State the permission, scope, safety, or operating limit." },
  { key: "verification", label: "Verification", prompt: "Explain what observable evidence would verify the result." },
  { key: "owner", label: "Accountable owner", prompt: "Name who owns the next decision or review." },
  { key: "escalation", label: "Escalation or rollback", prompt: "State when to stop, roll back, or escalate." },
];

function blankEvidence(): StructuredEvidence {
  return { scenarioFact: "", decision: "", boundary: "", verification: "", owner: "", escalation: "", evidenceReferences: [] };
}

function evidenceFromLegacyArtifact(artifact?: string): StructuredEvidence {
  const evidence = blankEvidence();
  if (!artifact) return evidence;
  const aliases: Record<string, keyof Omit<StructuredEvidence, "evidenceReferences">> = {
    context: "scenarioFact", "scenario fact": "scenarioFact", decision: "decision", constraint: "boundary", boundary: "boundary", verification: "verification", owner: "owner", escalation: "escalation", rollback: "escalation",
  };
  for (const line of artifact.split("\n")) {
    const [rawLabel, ...rest] = line.split(":");
    const key = aliases[rawLabel?.trim().toLowerCase()];
    if (key) evidence[key] = rest.join(":").trim();
  }
  return evidence;
}

const headings: Record<CourseKind, [string, string]> = {
  module: ["ACADEMY", "Original instruction that ends in durable evidence."],
  lab: ["AI-NATIVE LABS", "Practice judgment in safe fictional environments."],
  mission: [
    "MISSIONS",
    "Make an operating decision, live with its consequence, and revise.",
  ],
};

/** Turns the existing catalog shape into an editorial lesson until authored blocks replace it. */
function lessonBlocksFor(item: CourseItem): CourseBlock[] {
  if (item.blocks?.length) return item.blocks;
  const blocks: CourseBlock[] = [];
  if (item.overview) blocks.push({ type: "prose", body: item.overview });
  for (const section of item.sections ?? []) {
    // Legacy factory lessons repeat the overview and example in their old
    // section list. The reader presents each once, in the useful location.
    if (section.body === item.overview || section.body === item.workedExample) continue;
    blocks.push({ type: "prose", heading: section.heading, body: section.body });
  }
  if (item.workedExample) blocks.push({ type: "workedExample", heading: "Worked through", body: item.workedExample });
  if (item.scenario) blocks.push({ type: "caseStudy", heading: "A fictional operating case", body: item.scenario });
  for (const asset of item.assets ?? []) {
    blocks.push({ type: "evidenceAsset", name: asset.name, content: asset.content, kind: asset.kind });
  }
  if (item.misconceptions?.length) blocks.push({ type: "misconception", heading: "Common mistaken assumptions", items: item.misconceptions });
  if (!blocks.length && (item.outcome ?? item.task)) {
    blocks.push({ type: "prose", body: item.outcome ?? item.task ?? "" });
  }
  return blocks;
}

function CourseGuide({ item, isIncident, hintCount }: { item: CourseItem; isIncident: boolean; hintCount: number }) {
  const requirements = (item.artifact?.required ?? item.evidence?.required ?? ["Specific decision", "Safe boundary", "Verification", "Accountable owner"]).slice(0, 5);
  return (
    <details className="course-guide">
      <summary><span>Course guide</span><small>objective, boundaries, evidence, sources</small></summary>
      <div className="course-guide-content">
        <section><h3>By the end</h3><p>{item.outcome ?? item.task ?? item.briefing ?? item.overview}</p></section>
        {item.roleBoundary && <section><h3>Operating boundary</h3><p>{item.roleBoundary}</p></section>}
        {item.specialistEscalationGuidance && <section><h3>Involve a specialist when</h3><p>{item.specialistEscalationGuidance}</p></section>}
        <section>
          <h3>Evidence standard</h3>
          <p><b>{item.capabilityLevel ?? "prove"}</b> · {item.performanceExpectation ?? "Create specific evidence you can explain and defend."}</p>
          <ul>{requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
          <p className="guide-status">{isIncident ? "Production Incident — coaching is unavailable by design." : hintCount ? `${hintCount} coaching hint${hintCount === 1 ? "" : "s"} used.` : "One bounded coaching hint is available during practice."}</p>
        </section>
        {item.sources?.length ? <section className="course-guide-sources"><h3>Sources for this lesson</h3>{item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title}<small>{source.version ? `${source.version} · ` : ""}{source.locator ? `${source.locator} · ` : ""}accessed {source.accessed}</small></a>)}</section> : null}
        {item.instructionalDesign && <section className="course-guide-design"><h3>Why this format</h3><p><b>{item.instructionalDesign.approach}.</b> {item.instructionalDesign.rationale}</p></section>}
      </div>
    </details>
  );
}

function LessonBlocks({ blocks, reflection, onReflection }: { blocks: CourseBlock[]; reflection: string; onReflection: (value: string) => void }) {
  const firstCaseIndex = blocks.findIndex((block) => block.type === "caseStudy");
  return <>
    {blocks.map((block, index) => {
      if (block.type === "prose") return <section className="lesson-prose" key={`${block.heading ?? "prose"}-${index}`}><h3>{block.heading}</h3><p>{block.body}</p></section>;
      if (block.type === "workedExample") return <section className="lesson-worked" key={`${block.heading ?? "worked"}-${index}`}><span className="lesson-label">Worked example</span><h3>{block.heading}</h3><p>{block.body}</p></section>;
      if (block.type === "caseStudy") return <section className="lesson-case" key={`${block.heading ?? "case"}-${index}`}><span className="lesson-label">Case for discussion</span><h3>{block.heading}</h3><p>{block.body}</p>{index === firstCaseIndex && <label className="inline-apply"><span>Apply this idea</span><b>Before moving on, name the first safe recommendation you would make—and the boundary that keeps it controlled.</b><textarea value={reflection} onChange={(event) => onReflection(event.target.value)} placeholder="Write a short working note. It is saved with this lesson draft." /></label>}</section>;
      if (block.type === "keyTakeaway") return <aside className="lesson-takeaway" key={`${block.heading ?? "takeaway"}-${index}`}><b>{block.heading ?? "Key takeaway"}</b><p>{block.body}</p></aside>;
      if (block.type === "misconception") return <section className="lesson-misconception" key={`${block.heading ?? "misconception"}-${index}`}><h3>{block.heading}</h3><ul>{block.items.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>;
      return <figure className="evidence-panel" key={block.name}><figcaption>{block.kind ?? "Evidence"} · {block.name}</figcaption><pre>{block.content}</pre></figure>;
    })}
  </>;
}

export function AioCourseSurface({
  kind,
  state,
  trackId = "applied-ai-operations",
}: {
  kind: CourseKind;
  state: LearnerState;
  trackId?: TrackId;
}) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CourseCatalog | null>(null);
  const [error, setError] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pathFilter, setPathFilter] = useState("all");
  const [capabilityFilter, setCapabilityFilter] = useState("all");
  useEffect(() => {
    const attempt = crypto.randomUUID();
    fetch(`/api/course/catalog?track=${encodeURIComponent(trackId)}&attempt=${encodeURIComponent(attempt)}`)
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(
              new Error("The course catalog could not be loaded."),
            ),
      )
      .then(setCatalog)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "The course catalog could not be loaded.",
        ),
      );
  }, [trackId]);
  const items = useMemo(
    () =>
      catalog
        ? kind === "module"
          ? catalog.modules
          : kind === "lab"
            ? catalog.labs
            : catalog.missions
        : [],
    [catalog, kind],
  );
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const latestAttempt = state.courseAttempts
          .filter((attempt) => attempt.itemId === item.id)
          .at(-1);
        const phaseMatches = phaseFilter === "all" || item.phaseId === phaseFilter;
        const modeMatches = modeFilter === "all" || item.mode === modeFilter;
        const pathMatches = pathFilter === "all" || item.pathAvailability?.includes(pathFilter as NonNullable<CourseItem["pathAvailability"]>[number]);
        const capabilityMatches = capabilityFilter === "all" || item.capabilityLevel === capabilityFilter;
        const statusMatches =
          statusFilter === "all" ||
          (statusFilter === "complete" && latestAttempt?.complete) ||
          (statusFilter === "revision" && latestAttempt && !latestAttempt.complete) ||
          (statusFilter === "new" && !latestAttempt);
        return phaseMatches && modeMatches && statusMatches && pathMatches && capabilityMatches;
      }),
    [capabilityFilter, items, modeFilter, pathFilter, phaseFilter, state.courseAttempts, statusFilter],
  );
  const foundationRecommendation = trackId === "applied-ai-operations"
    ? recommendAioFoundationStart(state.assessmentSummaries["applied-ai-operations"])
    : null;
  const completedItems = new Set(
    state.courseAttempts.filter((attempt) => attempt.complete).map((attempt) => attempt.itemId),
  );
  const [label, description] = headings[kind];
  if (error)
    return (
      <div className="content">
        <section className="empty">
          <h2>Course content is temporarily unavailable.</h2>
          <p>
            {error} Your saved work remains in this browser. Refresh to retry.
          </p>
        </section>
      </div>
    );
  if (!catalog)
    return (
      <div className="content">
        <section className="empty">
          <h2>Loading the authored curriculum…</h2>
          <p>Preparing the versioned course catalog and assessment form.</p>
        </section>
      </div>
    );
  return (
    <div className="content">
      <div className="section-title">
        <div>
          <span className="eyebrow">{label}</span>
          <h2>{description}</h2>
        </div>
        <span className="track-name">{trackId === "applied-ai-operations" ? "AIO v1" : "IT Support v1"} · internal review</span>
      </div>
      <p className="lede">
        Every activity follows Learn → Knowledge Check → Practice → Debrief →
        Revision. Required work is scored by transparent, deterministic rules;
        Kyra cannot grant completion.
      </p>
      <section className="capability-legend" aria-label="Evidence expectation legend">
        <div><b>Know</b><span>Explain, recognize, and name the accountable specialist.</span></div>
        <div><b>Practice</b><span>Complete bounded guided work with support.</span></div>
        <div><b>Prove</b><span>Independently build, troubleshoot, or defend saved evidence.</span></div>
      </section>
      {kind === "module" && foundationRecommendation && (
        <section className="foundation-diagnostic">
          <div>
            <span className="eyebrow amber">FOUNDATION DIAGNOSTIC</span>
            <h3>{foundationRecommendation.title}</h3>
            <p>{foundationRecommendation.reason}</p>
          </div>
          <button
            className="secondary"
            onClick={() => {
              setPathFilter(foundationRecommendation.path);
              setPhaseFilter(foundationRecommendation.phaseId);
            }}
          >
            Open recommended starting point →
          </button>
        </section>
      )}
      <div className="activity-controls" aria-label="Filter learning activities">
        <label>Path<select value={pathFilter} onChange={(event) => setPathFilter(event.target.value)}><option value="all">All paths</option><option value="sprint-48h">48-hour interview speedrun</option><option value="sprint-7-day">Days 3–7 Sprint extensions</option><option value="foundation-bridge">Zero-to-Role Foundation</option><option value="concept-library">Role Concepts Library</option><option value="full-program">18-week full program</option></select></label>
        <label>Phase<select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}><option value="all">All phases</option><option value="crash-course">Interview Sprint</option><option value="foundation-bridge">Foundation Bridge</option><option value="fast-track">Applied AI Fast Track</option><option value="master-track">Master Track</option></select></label>
        <label>Evidence<select value={capabilityFilter} onChange={(event) => setCapabilityFilter(event.target.value)}><option value="all">All expectations</option><option value="know">Know</option><option value="practice">Practice</option><option value="prove">Prove</option></select></label>
        {(kind === "lab" || kind === "mission") && <label>Mode<select value={modeFilter} onChange={(event) => setModeFilter(event.target.value)}><option value="all">All modes</option><option>Solo</option><option>Pair Programming</option><option>AI Builder</option><option>Production Incident</option></select></label>}
        <label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Any status</option><option value="new">Not started</option><option value="revision">Revision needed</option><option value="complete">Evidence complete</option></select></label>
        <span>{filteredItems.length} focused activities</span>
      </div>
      <div className="activity-grid">
        {filteredItems.map((item) => {
          const attempt = state.courseAttempts
            .filter((saved) => saved.itemId === item.id)
            .at(-1);
          const unmetPrerequisites = (item.prerequisites ?? []).filter((id) => !completedItems.has(id));
          return (
            <article className="activity-card" key={item.id}>
              <div>
                <span className="mode">
                  {item.mode ?? item.phaseId.replace("-", " ")}
                </span>
                <span className="eyebrow teal">
                  {item.conceptGroup ?? item.pillar ?? "Applied AI"}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.outcome ?? item.scenario ?? item.briefing}</p>
              <footer>
                <span>
                  <b className={`capability ${item.capabilityLevel ?? "prove"}`}>{item.capabilityLevel ?? "prove"}</b> · {item.durationMinutes ?? 35} min ·{" "}
                  {attempt?.complete
                    ? "Evidence complete"
                    : attempt
                      ? "Revision available"
                      : unmetPrerequisites.length
                        ? `${unmetPrerequisites.length} prerequisite${unmetPrerequisites.length === 1 ? "" : "s"} required`
                        : "Artifact required"}
                </span>
                <button disabled={unmetPrerequisites.length > 0} onClick={() => router.push(`/learn/${trackId}/${kind}/${item.id}`)}>
                  {unmetPrerequisites.length ? "Locked" : attempt ? "Review →" : "Start →"}
                </button>
              </footer>
            </article>
          );
        })}
      </div>
      {!filteredItems.length && <section className="empty"><h2>No matching activities</h2><p>Clear a filter to return to the full learning path.</p></section>}
    </div>
  );
}

export function CourseRunner({
  item,
  kind,
  version,
  previous,
  draft,
  presentation,
  onClose,
  onSaved,
  onDraftChange,
  trackId = "applied-ai-operations",
}: {
  item: CourseItem;
  kind: CourseKind;
  version: string;
  previous?: CourseAttemptRecord;
  draft?: CourseDraft;
  presentation?: "modal" | "workspace";
  onClose: () => void;
  onSaved: (attempt: CourseAttemptRecord) => void;
  onDraftChange?: (draft: CourseDraft | null) => void;
  trackId?: TrackId;
}) {
  const [stage, setStage] = useState<CourseStage>(draft?.stage ?? "learn");
  const [answers, setAnswers] = useState<Record<string, string>>(
    draft?.answers ?? previous?.answers ?? {},
  );
  const [missionChoices, setMissionChoices] = useState<Record<string, string>>(
    draft?.missionChoices ?? previous?.missionChoices ?? {},
  );
  const [evidence, setEvidence] = useState<StructuredEvidence>(
    draft?.evidence ?? previous?.evidence ?? evidenceFromLegacyArtifact(previous?.artifact),
  );
  const [hintCount, setHintCount] = useState(draft?.hintCount ?? previous?.hintCount ?? 0);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isIncident = item.mode === "Production Incident";
  const lessonBlocks = useMemo(() => lessonBlocksFor(item), [item]);
  const stages = ["learn", "check", "practice", "debrief", "revision"] as const;
  const stageIndex = stages.indexOf(stage);
  const questionCount = item.knowledgeChecks?.length ?? 0;
  const completeChecks =
    questionCount === 0 ||
    (item.knowledgeChecks ?? []).every((question) => Boolean(answers[question.id]));
  const missionPath = useMemo(() => {
    if (kind !== "mission" || !item.steps?.length) return [] as NonNullable<CourseItem["steps"]>;
    const byId = new Map(item.steps.map((step) => [step.id, step]));
    const path: NonNullable<CourseItem["steps"]> = [];
    let nextId = item.startStepId ?? item.steps[0].id;
    while (nextId && byId.has(nextId) && path.length < item.steps.length) {
      const step = byId.get(nextId)!;
      path.push(step);
      const selected = step.options.find((option) => option.id === missionChoices[step.id]);
      if (!selected?.nextStepId) break;
      nextId = selected.nextStepId;
    }
    return path;
  }, [item.startStepId, item.steps, kind, missionChoices]);
  const completeMission =
    kind !== "mission" ||
    Boolean(missionPath.length && missionChoices[missionPath.at(-1)!.id]);
  const requiredEvidenceFields = item.artifact?.requiredFields ?? evidenceFields.map((field) => field.key);
  const evidenceComplete = requiredEvidenceFields.every((key) =>
    evidence[key].trim().split(/\s+/).filter(Boolean).length >= 8,
  );
  const hasDraftWork =
    Object.keys(answers).length > 0 ||
    Object.keys(missionChoices).length > 0 ||
    hintCount > 0 ||
    Object.values(evidence).some((value) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value.trim()),
    );
  useEffect(() => {
    if (grade || !hasDraftWork) return;
    onDraftChange?.({
      itemId: item.id,
      kind,
      version,
      stage,
      answers,
      missionChoices,
      evidence,
      hintCount,
      revisionOf: previous?.id,
      updatedAt: new Date().toISOString(),
    });
  }, [answers, evidence, grade, hasDraftWork, hintCount, item.id, kind, missionChoices, onDraftChange, previous?.id, stage, version]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (hasDraftWork && !window.confirm("Keep this saved draft and return to learning?")) return;
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasDraftWork, onClose]);
  const safeClose = () => {
    if (hasDraftWork && !window.confirm("Your work is saved as a draft. Return to learning?")) return;
    onClose();
  };
  const submit = async () => {
    setBusy(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/course/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: trackId, kind, itemId: item.id, answers, evidence, missionChoices }),
      });
      const result = (await response.json()) as Grade & { error?: string };
      if (!response.ok) {
        setSubmitError(result.error ?? "Scoring is temporarily unavailable. Your draft remains here.");
        return;
      }
      setGrade(result);
      onSaved({
        id: crypto.randomUUID(), itemId: item.id, version, kind, score: result.score,
        complete: result.complete, artifact: result.artifact ?? "", evidence, answers,
        missionChoices, hintCount, revisionOf: previous?.id, createdAt: new Date().toISOString(),
        competencies: item.competencies,
        capabilityLevel: item.capabilityLevel ?? "prove",
        verificationLevel: "local-study",
        evidenceDimension: item.capabilityLevel === "know" ? "understands" : item.capabilityLevel === "practice" ? (item.mode === "Production Incident" ? "troubleshoots" : "aiCollaboration") : kind === "module" ? "builds" : kind === "mission" ? "defends" : item.mode === "Production Incident" ? "troubleshoots" : item.mode === "AI Builder" ? "aiCollaboration" : "builds",
      });
      onDraftChange?.(null);
      setStage("debrief");
    } catch {
      setSubmitError("Scoring is temporarily unavailable. Your draft remains here; retry when ready.");
    } finally {
      setBusy(false);
    }
  };
  const help = () => {
    if (isIncident) return;
    setHintCount((current) => current + 1);
  };
  const runner = (
      <section className={`${presentation === "workspace" ? "course-workspace" : "modal course-modal"} course-kind-${kind}`}>
        <header className="course-workspace-header">
          <button className="course-back" onClick={safeClose}>
            ← <span>Return to learning</span>
          </button>
          <span className="save-state">{hasDraftWork ? "Draft saved in this browser" : "Ready when you are"}</span>
        </header>
        <span className="eyebrow teal">
          {kind.toUpperCase()} · <b className={`capability ${item.capabilityLevel ?? "prove"}`}>{item.capabilityLevel ?? "prove"}</b> · {item.mode ?? item.phaseId.toUpperCase()} ·{" "}
          {item.durationMinutes ?? 35} MIN
        </span>
        <h2>{item.title}</h2>
        <div className="course-flow-status">
          <span>
            Step {stageIndex + 1} of {stages.length}
          </span>
          <span>
            {stage === "learn"
              ? "Build context first"
              : stage === "check"
                ? "Check your understanding"
                : stage === "practice"
                  ? "Create your evidence"
                  : stage === "debrief"
                    ? "Review the result"
                    : "Strengthen your evidence"}
          </span>
        </div>
        <div className="course-progress" aria-hidden="true">
          <i
            style={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
          />
        </div>
        <div className="course-steps" aria-label="Learning activity stages">
          {stages.map((name, index) => {
            const locked =
              index > stageIndex ||
              (name === "debrief" && !grade) ||
              (name === "revision" && !grade);
            return (
              <button
                key={name}
                className={stage === name ? "current" : ""}
                disabled={locked}
                aria-current={stage === name ? "step" : undefined}
                onClick={() => setStage(name)}
              >
                {name}
              </button>
            );
          })}
        </div>
        <CourseGuide item={item} isIncident={isIncident} hintCount={hintCount} />
        <article className="course-reader">
        {stage === "learn" && (
          <div className="course-body">
            <p className="lesson-opening">{item.outcome ?? item.task ?? item.briefing ?? item.overview}</p>
            <LessonBlocks
              blocks={lessonBlocks}
              reflection={answers.__lessonReflection ?? ""}
              onReflection={(value) => setAnswers((current) => ({ ...current, __lessonReflection: value }))}
            />
            <button
              className="primary wide"
              onClick={() => setStage(questionCount ? "check" : "practice")}
            >
              Continue to {questionCount ? "knowledge check" : "practice"} →
            </button>
          </div>
        )}
        {stage === "check" && (
          <div className="course-body">
            <p>
              Answer every question. Choice order is randomized for this
              attempt; answers are stored by choice ID and graded server-side.
            </p>
            {item.knowledgeChecks?.map((question, index) => (
              <div className="course-question" key={question.id}>
                <b>
                  {String(index + 1).padStart(2, "0")} · {question.prompt}
                </b>
                {question.choices.map((choice) => (
                  <button
                    key={choice.id}
                    className={
                      answers[question.id] === choice.id ? "selected" : ""
                    }
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: choice.id,
                      }))
                    }
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            ))}
            <button
              className="primary wide"
              disabled={!completeChecks}
              onClick={() => setStage("practice")}
            >
              Continue to practice →
            </button>
          </div>
        )}
        {stage === "practice" && (
          <div className="course-body">
            {kind === "mission" &&
              missionPath.map((step, stepIndex) => (
                <div className="course-question" key={step.id}>
                  <b>
                    {step.title}: {step.prompt}
                  </b>
                  {step.options.map((option) => (
                    <button
                      key={option.id}
                      className={
                        missionChoices[step.id] === option.id ? "selected" : ""
                      }
                      onClick={() =>
                        setMissionChoices((current) => ({
                          ...current,
                          [step.id]: option.id,
                        }))
                      }
                    >
                      {option.disposition && <i>{option.disposition.replace("-", " ")}</i>}
                      {option.text}
                    </button>
                  ))}
                  {missionChoices[step.id] &&
                    step.options.find((option) => option.id === missionChoices[step.id])?.consequence && (
                      <p className="decision-consequence">
                        {step.options.find((option) => option.id === missionChoices[step.id])?.consequence}
                      </p>
                    )}
                </div>
              ))}
            <EvidenceEditor
              evidence={evidence}
              setEvidence={setEvidence}
              assetNames={item.assets?.map((asset) => asset.name) ?? []}
              requiredFields={requiredEvidenceFields}
            />
            <div className="course-help">
              <span>
                {isIncident
                  ? "Production Incident: Kyra is intentionally unavailable."
                  : hintCount
                    ? "Hint used: keep ownership and verification explicit."
                    : "Need a nudge? Ask for one bounded coaching hint."}
              </span>
              {!isIncident && (
                <button className="link" onClick={help}>
                  Use hint
                </button>
              )}
            </div>
            <button
              className="primary wide"
              disabled={
                !completeMission ||
                !evidenceComplete ||
                busy
              }
              onClick={submit}
            >
              {busy ? "Scoring evidence…" : "Submit for deterministic review →"}
            </button>
            {submitError && <p className="form-error" role="alert">{submitError}</p>}
          </div>
        )}
        {stage === "debrief" && (
          <div className="course-body">
            {grade ? (
              <>
                <div
                  className={grade.complete ? "feedback complete" : "feedback"}
                >
                  <b>
                    {grade.score}% ·{" "}
                    {grade.complete ? "Evidence complete" : "Revision required"}
                  </b>
                  <br />
                  {grade.feedback}
                  <small className="verification-note">Saved as local study evidence in this browser. It is not a verified credential record.</small>
                </div>
                {grade.checks.map((check) => (
                  <div
                    className={
                      check.correct ? "debrief-line correct" : "debrief-line"
                    }
                    key={check.id}
                  >
                    <b>{check.correct ? "✓" : "↺"}</b>
                    <span>{check.explanation}</span>
                  </div>
                ))}
                <section>
                  <h3>Artifact rubric</h3>
                  <p>
                    {grade.rubric.wordCount} words ·{" "}
                    {grade.rubric.artifactLength
                      ? "minimum length met"
                      : "minimum length not met"}
                  </p>
                  {grade.rubric.checks.map((check) => (
                    <div className="debrief-line" key={check.id}>
                      <b>{check.passed ? "✓" : "↺"}</b>
                      <span>
                        {check.label}: {check.detail}
                      </span>
                    </div>
                  ))}
                </section>
                <button
                  className="primary wide"
                  onClick={() => setStage("revision")}
                >
                  Open revision →
                </button>
              </>
            ) : (
              <p>
                Submit the practice artifact to unlock the deterministic
                debrief.
              </p>
            )}
          </div>
        )}
        {stage === "revision" && (
          <div className="course-body">
            <p>
              {item.revisionPrompt ??
                "Revise the evidence based on the debrief. Keep the original attempt in your history; revisions demonstrate learning rather than erase it."}
            </p>
            <EvidenceEditor
              evidence={evidence}
              setEvidence={setEvidence}
              assetNames={item.assets?.map((asset) => asset.name) ?? []}
              requiredFields={requiredEvidenceFields}
              revision
            />
            <button
              className="primary wide"
              disabled={
                !evidenceComplete || busy
              }
              onClick={submit}
            >
              {busy ? "Scoring revision…" : "Resubmit revision →"}
            </button>
          </div>
        )}
        </article>
      </section>
  );
  return presentation === "workspace" ? (
    <main className="course-workspace-page">{runner}</main>
  ) : (
    <div className="modal-layer">{runner}</div>
  );
}

function EvidenceEditor({
  evidence,
  setEvidence,
  assetNames,
  requiredFields = evidenceFields.map((field) => field.key),
  revision = false,
}: {
  evidence: StructuredEvidence;
  setEvidence: React.Dispatch<React.SetStateAction<StructuredEvidence>>;
  assetNames: string[];
  requiredFields?: Array<keyof Omit<StructuredEvidence, "evidenceReferences">>;
  revision?: boolean;
}) {
  return (
    <section className="structured-evidence" aria-label={revision ? "Revision evidence" : "Saved evidence"}>
      <h3>{revision ? "Revision evidence" : "Saved evidence"}</h3>
      <p>Each field needs a distinct, concrete claim. Labels alone, repeated wording, and generic filler cannot complete this activity.</p>
      {evidenceFields.filter((field) => requiredFields.includes(field.key)).map((field) => (
        <label className="write-answer" key={field.key}>
          <b>{field.label}</b>
          <span>{field.prompt}</span>
          <textarea
            value={evidence[field.key]}
            onChange={(event) => setEvidence((current) => ({ ...current, [field.key]: event.target.value }))}
            placeholder={field.prompt}
          />
        </label>
      ))}
      {assetNames.length > 0 && (
        <fieldset className="evidence-references">
          <legend>Evidence used</legend>
          <p>Link the fictional logs, payloads, or source excerpts that informed your decision.</p>
          {assetNames.map((name) => (
            <label key={name}>
              <input
                type="checkbox"
                checked={evidence.evidenceReferences.includes(name)}
                onChange={(event) => setEvidence((current) => ({
                  ...current,
                  evidenceReferences: event.target.checked
                    ? [...current.evidenceReferences, name]
                    : current.evidenceReferences.filter((reference) => reference !== name),
                }))}
              />
              {name}
            </label>
          ))}
        </fieldset>
      )}
    </section>
  );
}
