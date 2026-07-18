import "server-only";

import { aioLabs, aioMissions, aioModules } from "./aio-content";
import { itSupportContentVersion, itSupportLabs, itSupportMissions, itSupportSprintModules } from "./it-support-content";
import type { ReviewStatus } from "./course-types";

export type RegistryTrackId = "applied-ai-operations" | "it-support-technician";
export type RegistryItemKind = "module" | "lab" | "mission";
export type RegistryItem = {
  id: string;
  kind: RegistryItemKind;
  contentVersion: string;
  review: ReviewStatus;
};

const aioVersion = "aio-v3-zero-to-role-draft";

/** One source of truth for release-reviewable curriculum items. Browser-safe
 * catalog projections come from the same authored collections, but this
 * registry deliberately stays server-only because it includes review state. */
export const courseContentRegistry: Record<RegistryTrackId, RegistryItem[]> = {
  "applied-ai-operations": [
    ...aioModules.map((item) => ({ id: item.id, kind: "module" as const, contentVersion: aioVersion, review: item.review })),
    ...aioLabs.map((item) => ({ id: item.id, kind: "lab" as const, contentVersion: aioVersion, review: item.review })),
    ...aioMissions.map((item) => ({ id: item.id, kind: "mission" as const, contentVersion: aioVersion, review: item.review })),
  ],
  "it-support-technician": [
    ...itSupportSprintModules.map((item) => ({ id: item.id, kind: "module" as const, contentVersion: itSupportContentVersion, review: item.review })),
    ...itSupportLabs.map((item) => ({ id: item.id, kind: "lab" as const, contentVersion: itSupportContentVersion, review: item.review })),
    ...itSupportMissions.map((item) => ({ id: item.id, kind: "mission" as const, contentVersion: itSupportContentVersion, review: item.review })),
  ],
};

export function findRegistryItem(trackId: RegistryTrackId, itemId: string, contentVersion: string) {
  return courseContentRegistry[trackId].find(
    (item) => item.id === itemId && item.contentVersion === contentVersion,
  );
}

export function registrySummary(trackId: RegistryTrackId) {
  const items = courseContentRegistry[trackId];
  return {
    total: items.length,
    modules: items.filter((item) => item.kind === "module").length,
    labs: items.filter((item) => item.kind === "lab").length,
    missions: items.filter((item) => item.kind === "mission").length,
    releaseApproved: items.filter((item) => item.review.versionApproved === "approved").length,
  };
}
