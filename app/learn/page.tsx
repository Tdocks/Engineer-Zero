import { LearningApp } from "@/components/LearningApp";
import type { TrackId } from "@/lib/types";

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
  const { track } = await searchParams;
  const initialTrack: TrackId = track === "it-support-technician" ? "it-support-technician" : "applied-ai-operations";
  return <LearningApp initialTrack={initialTrack} />;
}
