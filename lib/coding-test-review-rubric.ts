import "server-only";

import type { TestReviewDisposition } from "@/lib/coding-test-review";

const rubric: Record<string, { expected: TestReviewDisposition; reason: string }> = {
  "empty-assertion": { expected: "no-behavior", reason: "A test that asserts only True cannot fail when the triage behavior regresses. Replace it with a specific input and expected priority." },
  "wrong-expectation": { expected: "wrong-requirement", reason: "The test conflicts with the documented 80–87 REVIEW range. Confirm the requirement, then correct the expected result rather than forcing code to satisfy a mistaken test." },
  "clock-coupling": { expected: "flaky-dependency", reason: "The wall clock can change between calls. Inject or control time when needed, and assert the retrieval behavior that users actually depend on." },
  "private-helper": { expected: "implementation-coupling", reason: "A private helper can be renamed or removed while the API still behaves correctly. Test the public route and response contract instead." },
  "boundary-gap": { expected: "missing-boundary", reason: "89 is useful nearby evidence but does not prove what happens exactly at the changed 88-degree decision boundary." },
};

export function reviewCodingTests(choices: Partial<Record<string, TestReviewDisposition>>) {
  const entries = Object.entries(rubric).map(([id, rule]) => ({ id, correct: choices[id] === rule.expected, reason: rule.reason }));
  return { total: entries.length, correct: entries.filter((entry) => entry.correct).length, complete: entries.every((entry) => choices[entry.id]), entries };
}
