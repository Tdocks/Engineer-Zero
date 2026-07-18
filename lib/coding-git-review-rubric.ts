import "server-only";

const requiredFiles = new Set(["app/services.py", "tests/test_services.py", "README.md"]);
const excludedFiles = new Set([".env", "debug-output.txt"]);

export function reviewCodingGitChange(selectedFiles: string[], commitId: string, reviewerNote: string) {
  const selected = new Set(selectedFiles);
  const missing = [...requiredFiles].filter((path) => !selected.has(path));
  const unsafe = [...excludedFiles].filter((path) => selected.has(path));
  const normalized = reviewerNote.toLowerCase();
  const requiredClaims = ["88", "test", "secret", "readme"];
  const missingClaims = requiredClaims.filter((claim) => !normalized.includes(claim));
  const messageMatches = commitId === "threshold-boundary";
  const complete = missing.length === 0 && unsafe.length === 0 && missingClaims.length === 0 && messageMatches;
  return {
    complete,
    missing,
    unsafe,
    missingClaims,
    messageMatches,
    feedback: complete
      ? "This is a reviewable, scoped change: the rule, exact-boundary test, and documentation move together; local output and the configuration secret remain outside version control."
      : "Revise the proposed change set. A reviewer needs the rule, direct regression test, and matching documentation; secrets and incidental output must stay out. Explain the 88-degree boundary, test, README update, and secret exclusion in your review note.",
  };
}
