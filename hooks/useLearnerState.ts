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
    if (!hydrated || typeof window === "undefined") return;
    // Shared programs may be started before a learner chooses a career track.
    // Preserve that work without forcing an onboarding profile first.
    if (!state.profile && Object.keys(state.programProgress).length === 0) return;
    window.localStorage.setItem(learnerStorageKey, JSON.stringify(state));
  }, [hydrated, state]);

  return { state, setState, hydrated };
}
