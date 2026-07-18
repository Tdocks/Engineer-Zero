export type GitCommitOption = {
  id: string;
  label: string;
};

export const codingGitReviewScenario = {
  title: "Review a focused threshold change",
  branch: "fix/triage-boundary-88",
  base: "main",
  summary: "A field calibration update changes the fictional REVIEW → URGENT boundary from 90 to 88. Prepare a small reviewable change—not a repository cleanup.",
  files: [
    { path: "app/services.py", change: "- if temperature >= 90:\n+  if temperature >= 88:", purpose: "The deterministic triage rule changed." },
    { path: "tests/test_services.py", change: "+ def test_88_degree_reading_is_urgent():\n+    assert evaluate_reading(88) == 'URGENT'", purpose: "The exact new boundary needs regression evidence." },
    { path: "README.md", change: "- Urgent threshold: 90\n+  Urgent threshold: 88", purpose: "The published fictional rule must match the service." },
    { path: ".env", change: "OPENAI_API_KEY=fictional-training-value", purpose: "A local configuration file appeared in the working tree. It must never be committed." },
    { path: "debug-output.txt", change: "POST /triage 200\nPOST /triage 200\nPOST /triage 200", purpose: "Temporary local output is not part of the behavior change." },
  ],
} as const;

/** Options remain neutral on the client. The accepted intent stays server-only. */
export const codingGitCommitOptions: readonly GitCommitOption[] = [
  { id: "threshold-boundary", label: "Adjust triage boundary and add regression coverage" },
  { id: "repository-cleanup", label: "Update every local file before review" },
  { id: "fastapi-upgrade", label: "Modernize API dependencies and route structure" },
  { id: "misc-edits", label: "Apply assorted operational changes" },
];
