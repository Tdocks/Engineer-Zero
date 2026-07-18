import "server-only";

import { codingSources } from "./coding-developer";
import { codingSourceReviewReport } from "./coding-source-governance";

export type SourceReachability = Record<string, { reachable: boolean; httpStatus: number | null }>;

export function codingSourceHealthRecords(asOf: Date, reachability: SourceReachability) {
  return codingSourceReviewReport(codingSources, asOf).map((source) => {
    const check = reachability[source.id];
    const status = source.disposition === "deprecated"
      ? "deprecated"
      : source.disposition === "review-due"
        ? "overdue"
        : check && !check.reachable
          ? "needs_attention"
          : source.reviewStatus === "technical-approved"
            ? "technical_approved"
            : "author_verified";
    return { source, status, httpStatus: check?.httpStatus ?? null };
  });
}
