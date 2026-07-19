import { LearningApp, type View } from "@/components/LearningApp";
import type { TrackId } from "@/lib/types";

const allowedViews = new Set<View>([
  "today",
  "tracks",
  "academy",
  "labs",
  "missions",
  "projects",
  "interview",
  "launchpad",
  "guidance",
  "readiness",
]);

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string; view?: string; studio?: string }>;
}) {
  const { track, view, studio } = await searchParams;
  const initialTrack: TrackId = track === "it-support-technician" ? "it-support-technician" : "applied-ai-operations";
  const initialView = allowedViews.has(view as View) ? (view as View) : "today";
  const initialStudioMode =
    studio === "probes" || studio === "mock" || studio === "guided" || studio === "rapid" || studio === "defense"
      ? studio
      : undefined;
  return (
    <LearningApp
      initialTrack={initialTrack}
      initialView={initialView}
      initialStudioMode={initialStudioMode}
    />
  );
}
