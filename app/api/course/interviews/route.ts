import { NextResponse } from "next/server";
import { aioInterviewPrompts } from "@/lib/aio-content";
import { scoreAioInterviewResponse } from "@/lib/aio-interview-scoring";
import { itSupportInterviewPrompts } from "@/lib/it-support-content";
import type { InterviewPrompt } from "@/lib/course-types";
import type { TrackId } from "@/lib/types";

function publicPrompt(prompt: InterviewPrompt) {
  return {
    id: prompt.id,
    category: prompt.category,
    prompt: prompt.prompt,
    why: prompt.why,
    timedMinutes: prompt.timedMinutes,
    scenarioArtifact: prompt.scenarioArtifact,
  };
}

function trackFrom(value: unknown): TrackId | null {
  return value === "applied-ai-operations" || value === "it-support-technician" ? value : null;
}

function promptsFor(track: TrackId) {
  return track === "it-support-technician" ? itSupportInterviewPrompts : aioInterviewPrompts;
}

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

export async function GET(request: Request) {
  const track = trackFrom(new URL(request.url).searchParams.get("track")) ?? "applied-ai-operations";
  return NextResponse.json({
    version: track === "it-support-technician" ? "it-support-v1-interview-studio-draft" : "aio-v1-draft",
    track,
    prompts: promptsFor(track).map(publicPrompt),
  });
}

const itDimensions = {
  "Endpoint and Windows": [
    ["impact or scope", /\b(impact|affected|user|workflow|scope|last.?known)\b/i],
    ["endpoint evidence", /\b(event|log|device manager|boot|driver|storage|dock|display|profile|symptom)\b/i],
    ["safe recovery", /\b(known.?good|replacement|approved|reversible|contain|backup)\b/i],
    ["workflow verification", /\b(verify|test|confirm|sign.?in|application|workflow)\b/i],
  ],
  "Networking and connected devices": [
    ["layered evidence", /\b(link|dhcp|address|gateway|dns|hostname|vlan|port|wi.?fi)\b/i],
    ["network ownership boundary", /\b(network owner|network team|escalat|approved change|segmentation)\b/i],
    ["required-service verification", /\b(verify|service|workflow|application|resolve|test)\b/i],
  ],
  "Identity, Microsoft, and managed devices": [
    ["identity distinction", /\b(authentication|authorization|mfa|sign.?in|permission|identity|compliance)\b/i],
    ["approved access boundary", /\b(approved|least privilege|owner|escalat|policy|security)\b/i],
    ["minimum-access verification", /\b(verify|confirm|required access|workflow|resource)\b/i],
  ],
  "Printing, AV, mobile, and asset lifecycle": [
    ["device-specific evidence", /\b(queue|driver|port|media|ribbon|template|scan|audio|display|asset|serial|enrollment)\b/i],
    ["controlled recovery", /\b(approved|fallback|contain|known.?good|test|scope)\b/i],
    ["output verification", /\b(verify|scan|meeting|workflow|confirm|inventory)\b/i],
  ],
  "Incident operations and technical judgment": [
    ["impact prioritization", /\b(impact|priority|urgent|safety|operation|triage)\b/i],
    ["ownership and escalation", /\b(owner|escalat|network|security|vendor|team)\b/i],
    ["checkpoint and verification", /\b(update|checkpoint|verify|confirm|communicat|prevent)\b/i],
  ],
  "Behavioral and project defense": [
    ["personal contribution", /\b(i |my |i\'d|i\s)/i],
    ["specific action and result", /\b(action|implemented|decided|result|outcome|verified|measured)\b/i],
    ["honest tradeoff or lesson", /\b(learned|tradeoff|limitation|would improve|constraint|next time)\b/i],
  ],
} as const;

function scoreItInterview(response: string, category: string) {
  const requiredDimensions = itDimensions[category as keyof typeof itDimensions] ?? [];
  const answerWords = words(response);
  const missing = requiredDimensions
    .filter(([, matcher]) => !matcher.test(response))
    .map(([label]) => label);
  const score = Math.min(
    100,
    Math.round(
      20 +
        Math.min(answerWords.length, 220) * 0.12 +
        (requiredDimensions.length - missing.length) *
          (66 / Math.max(requiredDimensions.length, 1)),
    ),
  );
  const complete = answerWords.length >= 80 && missing.length === 0;
  return {
    score,
    complete,
    missing,
    antiPatterns: [] as string[],
    feedback: complete
      ? "Your first attempt has a clear operating sequence. Compare it to the examiner guidance, then revise for specificity."
      : `Add specific reasoning for: ${missing.join(", ") || "depth and concrete evidence"}.`,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    track?: unknown;
    promptId?: string;
    response?: string;
  } | null;
  const track = trackFrom(body?.track) ?? "applied-ai-operations";
  const prompt = body?.promptId
    ? promptsFor(track).find((item) => item.id === body.promptId)
    : undefined;
  if (!prompt || !body?.response || body.response.length > 8000) {
    return NextResponse.json({ error: "Provide a known prompt and a bounded response." }, { status: 400 });
  }
  const scored =
    track === "applied-ai-operations"
      ? scoreAioInterviewResponse(body.response)
      : scoreItInterview(body.response, prompt.category);
  return NextResponse.json({
    score: scored.score,
    complete: scored.complete,
    feedback: scored.feedback,
    missing: scored.missing,
    antiPatterns: scored.antiPatterns,
    followUp: prompt.followUp,
    examinerGuidance: {
      strongAnswer: prompt.strongAnswer,
      commonMiss: prompt.commonMiss,
      rubric: prompt.rubric,
    },
  });
}
