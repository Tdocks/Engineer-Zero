import { codingSources, type CodingSource } from "./coding-developer";

export type CodingSourceReview = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  version: string;
  lastVerified: string;
  revalidateBy: string;
  disposition: "current" | "review-due" | "deprecated";
  reviewStatus: NonNullable<CodingSource["reviewStatus"]>;
  action: string;
};

/**
 * This is a release-governance report, not proof that a linked page still
 * supports every pedagogical claim. A human reviewer still checks source
 * meaning whenever a record is due or the publisher changes material scope.
 */
export function codingSourceReviewReport(
  sources: Record<string, CodingSource> = codingSources,
  asOf = new Date(),
): CodingSourceReview[] {
  return Object.values(sources).map((source) => {
    const dueAt = new Date(source.revalidateBy ?? source.lastVerified);
    const deprecated = source.deprecationStatus === "deprecated";
    const due = !deprecated && dueAt.getTime() <= asOf.getTime();
    const disposition: CodingSourceReview["disposition"] = deprecated ? "deprecated" : due ? "review-due" : "current";
    return {
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      version: source.version,
      lastVerified: source.lastVerified,
      revalidateBy: source.revalidateBy ?? source.lastVerified,
      disposition,
      reviewStatus: source.reviewStatus ?? "technical-review-required",
      action: deprecated
        ? `Replace this source before release using ${source.replacementLessonId ?? "an approved replacement lesson"}.`
        : due
          ? "Recheck the exact claim, locator, document version, and linked lesson before publishing a new content version."
          : source.reviewStatus === "technical-approved"
            ? "Keep this source in the next scheduled revalidation review."
            : "Current author-verification record only; obtain independent technical review before commercial credential claims.",
    };
  }).sort((left, right) => left.revalidateBy.localeCompare(right.revalidateBy));
}

export function codingCatalogPublicationStatus(sources: Record<string, CodingSource> = codingSources, asOf = new Date()) {
  const review = codingSourceReviewReport(sources, asOf);
  const stale = review.filter((source) => source.disposition !== "current");
  const awaitingTechnicalReview = review.filter((source) => source.reviewStatus !== "technical-approved");
  return {
    publishable: stale.length === 0 && awaitingTechnicalReview.length === 0,
    stale,
    awaitingTechnicalReview,
    review,
  };
}
