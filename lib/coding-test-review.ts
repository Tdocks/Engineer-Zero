export type TestReviewDisposition = "no-behavior" | "wrong-requirement" | "flaky-dependency" | "implementation-coupling" | "missing-boundary";

export const codingTestReviewCases = [
  { id: "empty-assertion", name: "test_triage_returns_a_value", code: "def test_triage_returns_a_value():\n    assert True", context: "The route should assign a priority from a numeric reading." },
  { id: "wrong-expectation", name: "test_85_is_normal", code: "def test_85_is_normal():\n    assert evaluate_reading(85) == 'NORMAL'", context: "The documented fictional rule is NORMAL below 80, REVIEW from 80 through 87, and URGENT at 88 or above." },
  { id: "clock-coupling", name: "test_handoff_is_recent", code: "def test_handoff_is_recent():\n    assert create_handoff().created_at == datetime.now()", context: "The test should verify a stored handoff can be retrieved, without depending on the wall clock." },
  { id: "private-helper", name: "test_response_label_format", code: "def test_response_label_format():\n    assert _format_priority('URGENT') == 'URGENT'", context: "The useful behavior is that POST /triage returns a validated priority in the response contract." },
  { id: "boundary-gap", name: "test_89_is_urgent", code: "def test_89_is_urgent():\n    assert evaluate_reading(89) == 'URGENT'", context: "The threshold moved from 90 to 88; no test currently checks the exact new boundary." },
] as const;

export const testReviewDispositionLabels: Record<TestReviewDisposition, string> = {
  "no-behavior": "Passes without asserting behavior",
  "wrong-requirement": "Encodes the wrong requirement",
  "flaky-dependency": "Depends on an unstable external value",
  "implementation-coupling": "Tests a private detail instead of a useful behavior",
  "missing-boundary": "Misses the exact decision boundary",
};

/** Deterministic presentation order prevents answer position from becoming a cue. */
export function testReviewOptionsFor(caseId: string): TestReviewDisposition[] {
  const options: TestReviewDisposition[] = ["no-behavior", "wrong-requirement", "flaky-dependency", "implementation-coupling", "missing-boundary"];
  const shift = [...caseId].reduce((sum, character, index) => sum + character.charCodeAt(0) * (index + 1), 0) % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}
