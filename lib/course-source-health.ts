import "server-only";

import { aioInterviewPrompts, aioLabs, aioMissions, aioModules } from "./aio-content";
import { itSupportContentVersion, itSupportInterviewPrompts, itSupportLabs, itSupportMissions, itSupportSprintModules } from "./it-support-content";
import type { SourceReference } from "./course-types";

export type CourseSourceStatus = "author_verified" | "overdue" | "needs_attention";
export type SourceReachability = Record<string, { reachable: boolean; httpStatus: number | null }>;
export type CourseSourceHealthRecord = {
  trackId: "applied-ai-operations" | "it-support-technician";
  itemId: string;
  contentVersion: string;
  source: SourceReference;
  status: CourseSourceStatus;
  httpStatus: number | null;
};

type SourceItem = { id: string; sources: SourceReference[] };

function recordsFor(trackId: CourseSourceHealthRecord["trackId"], contentVersion: string, items: SourceItem[]) {
  return items.flatMap((item) => item.sources.map((source) => ({ trackId, itemId: item.id, contentVersion, source })));
}

export function courseSourceHealthRecords(now = new Date(), reachability: SourceReachability = {}) {
  const records = [
    ...recordsFor("applied-ai-operations", "aio-v3-zero-to-role-draft", [...aioModules, ...aioLabs, ...aioMissions, ...aioInterviewPrompts]),
    ...recordsFor("it-support-technician", itSupportContentVersion, [...itSupportSprintModules, ...itSupportLabs, ...itSupportMissions, ...itSupportInterviewPrompts]),
  ];
  return records.map((record) => {
    const reach = reachability[record.source.url];
    const overdue = !record.source.revalidateBy || new Date(`${record.source.revalidateBy}T23:59:59.999Z`) < now;
    const status: CourseSourceStatus = overdue ? "overdue" : reach && !reach.reachable ? "needs_attention" : "author_verified";
    return { ...record, status, httpStatus: reach?.httpStatus ?? null } satisfies CourseSourceHealthRecord;
  });
}

export function courseSourceUrls() {
  return [...new Set(courseSourceHealthRecords().map((record) => record.source.url))];
}
