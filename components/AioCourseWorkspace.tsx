"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CourseRunner,
  type CourseCatalog,
  type CourseKind,
} from "@/components/AioCourseSurface";
import { useLearnerState } from "@/hooks/useLearnerState";
import type { CourseAttemptRecord, CourseDraft } from "@/lib/types";

export function AioCourseWorkspace({
  kind,
  itemId,
}: {
  kind: CourseKind;
  itemId: string;
}) {
  const router = useRouter();
  const { state, setState, hydrated } = useLearnerState("applied-ai-operations");
  const [catalog, setCatalog] = useState<CourseCatalog | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/course/catalog?workspace=${encodeURIComponent(itemId)}`)
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("The course workspace could not be loaded.")),
      )
      .then(setCatalog)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "The course workspace could not be loaded.",
        ),
      );
  }, [itemId]);

  const item = useMemo(() => {
    if (!catalog) return undefined;
    const items =
      kind === "module"
        ? catalog.modules
        : kind === "lab"
          ? catalog.labs
          : catalog.missions;
    return items.find((candidate) => candidate.id === itemId);
  }, [catalog, itemId, kind]);

  if (error || (catalog && !item)) {
    return (
      <main className="course-workspace-page course-workspace-error">
        <section>
          <p className="eyebrow">COURSE WORKSPACE</p>
          <h1>That activity is not available.</h1>
          <p>{error || "Return to the learning path and choose another activity."}</p>
          <button className="primary" onClick={() => router.push("/learn?track=applied-ai-operations")}>
            Return to learning
          </button>
        </section>
      </main>
    );
  }

  if (!hydrated || !catalog || !item) {
    return (
      <main className="course-workspace-page course-workspace-loading">
        <p className="eyebrow">PREPARING YOUR WORKSPACE</p>
        <h1>Loading the evidence, task, and review criteria…</h1>
      </main>
    );
  }

  const previous = state.courseAttempts
    .filter((attempt) => attempt.itemId === itemId)
    .at(-1) as CourseAttemptRecord | undefined;
  const draft = state.courseDrafts[itemId] as CourseDraft | undefined;

  return (
    <CourseRunner
      item={item}
      kind={kind}
      version={catalog.version}
      previous={previous}
      draft={draft}
      presentation="workspace"
      onClose={() => router.back()}
      onDraftChange={(nextDraft) =>
        setState((current) => {
          const courseDrafts = { ...current.courseDrafts };
          if (nextDraft) courseDrafts[itemId] = nextDraft;
          else delete courseDrafts[itemId];
          return { ...current, courseDrafts };
        })
      }
      onSaved={(attempt) =>
        setState((current) => {
          const courseDrafts = { ...current.courseDrafts };
          delete courseDrafts[itemId];
          return {
            ...current,
            courseAttempts: [...current.courseAttempts, attempt],
            courseDrafts,
          };
        })
      }
    />
  );
}
