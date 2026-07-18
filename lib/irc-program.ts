/**
 * First program intentionally pushed toward an internal release candidate.
 * Keep this file aligned with docs/IRC_PROGRAM_DECISION.md.
 */
export const ircProgramId = "coding-developer" as const;
export type IrcProgramId = typeof ircProgramId;

export const ircProgramDecision = {
  id: ircProgramId,
  title: "Coding Developer",
  decidedAt: "2026-07-18",
  dispositionTarget: "internal-release-candidate" as const,
  deferredPrograms: ["applied-ai-operations", "it-support-technician"] as const,
  rationale:
    "Strongest local pilot with authored four-day path, runnable prototypes, and reusable foundations for AIO and IT Support.",
  commercialCredentialAllowed: false,
} as const;
