import { describe, expect, it } from "vitest";
import { enrollmentIntentFromCheckout } from "./commerce-enrollment";
import { codingDeveloperReviewSummary } from "./coding-human-review";
import { ircProgramDecision } from "./irc-program";
import { trustBoundaryReport } from "./trust-boundary";

describe("IRC program decision", () => {
  it("selects Coding Developer without allowing commercial credentials", () => {
    expect(ircProgramDecision.id).toBe("coding-developer");
    expect(ircProgramDecision.commercialCredentialAllowed).toBe(false);
    expect(ircProgramDecision.deferredPrograms).toEqual(["applied-ai-operations", "it-support-technician"]);
  });
});

describe("trust boundary proof", () => {
  it("passes static RLS and Stripe enrollment invariants", () => {
    const report = trustBoundaryReport();
    const failed = report.findings.filter((finding) => !finding.ok);
    expect(failed, failed.map((item) => `${item.id}: ${item.evidence}`).join("\n")).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("rejects redirect-only and non-purchasable checkout metadata", () => {
    expect(enrollmentIntentFromCheckout({
      userId: "user-1",
      trackId: "coding-developer",
      sessionId: "cs_test",
    }).ok).toBe(false);
    expect(enrollmentIntentFromCheckout({
      userId: "user-1",
      trackId: "applied-ai-operations",
      sessionId: "cs_test",
    })).toMatchObject({ ok: true, trackId: "applied-ai-operations" });
  });
});

describe("Coding Developer human review packet", () => {
  it("prepares the publishable surface for human sign-off without auto-approving credentials", () => {
    const summary = codingDeveloperReviewSummary(new Date("2026-07-18T12:00:00.000Z"));
    expect(summary.programId).toBe("coding-developer");
    expect(summary.readyForHumanSignOff).toBe(true);
    expect(summary.blocked).toEqual([]);
    expect(summary.findings.some((item) => item.area === "instructional_design" && item.status === "pass")).toBe(true);
    expect(summary.findings.some((item) => item.area === "fictional_data" && item.status === "pass")).toBe(true);
    expect(summary.attention.some((item) => item.id === "technical-independent-approval")).toBe(true);
    expect(summary.attention.some((item) => item.id === "accessibility-human-walkthrough")).toBe(true);
  });
});
