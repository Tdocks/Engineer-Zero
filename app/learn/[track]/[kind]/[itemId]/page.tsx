import { notFound } from "next/navigation";
import { AioCourseWorkspace } from "@/components/AioCourseWorkspace";
import type { CourseKind } from "@/components/AioCourseSurface";

const kinds = new Set<CourseKind>(["module", "lab", "mission"]);

export default async function CourseWorkspacePage({
  params,
}: {
  params: Promise<{ track: string; kind: string; itemId: string }>;
}) {
  const { track, kind, itemId } = await params;
  if (
    !["applied-ai-operations", "it-support-technician"].includes(track) ||
    !kinds.has(kind as CourseKind)
  ) {
    notFound();
  }
  return (
    <AioCourseWorkspace
      kind={kind as CourseKind}
      itemId={itemId}
      trackId={track as "applied-ai-operations" | "it-support-technician"}
    />
  );
}
