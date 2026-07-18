"use client";

import { useEffect, useState } from "react";
import {
  emptyLearnerState,
  learnerStorageKey,
  normalizeLearnerState,
} from "@/lib/learning";
import type { LearnerState, TrackId } from "@/lib/types";

function readLearnerState(initialTrack: TrackId): LearnerState {
  if (typeof window === "undefined") {
    return { ...emptyLearnerState, activeTrack: initialTrack };
  }
  const saved = window.localStorage.getItem(learnerStorageKey);
  if (!saved) return { ...emptyLearnerState, activeTrack: initialTrack };
  try {
    return normalizeLearnerState(JSON.parse(saved) as Partial<LearnerState>);
  } catch {
    return { ...emptyLearnerState, activeTrack: initialTrack };
  }
}

export function useLearnerState(initialTrack: TrackId) {
  const [state, setState] = useState<LearnerState>(() =>
    readLearnerState(initialTrack),
  );
  const [hydrated] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (!hydrated || !state.profile || typeof window === "undefined") return;
    window.localStorage.setItem(learnerStorageKey, JSON.stringify(state));
  }, [hydrated, state]);

  return { state, setState, hydrated };
}
