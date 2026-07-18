import "server-only";

import { itSupportContentVersion, itSupportLabs, itSupportMissions, itSupportSprintModules } from "./it-support-content";

function shuffle<T>(items: T[], seed: string) {
  const result = [...items];
  let state = Array.from(seed).reduce(
    (value, char) => value + char.charCodeAt(0),
    17,
  );
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const pick = state % (index + 1);
    [result[index], result[pick]] = [result[pick], result[index]];
  }
  return result;
}

/** Browser-safe projection for the authored IT Support Sprint. Keys, rules,
 * review status, and accepted branches stay in server-only content modules. */
export function itSupportPublicCatalog(seed: string) {
  return {
    version: itSupportContentVersion,
    modules: itSupportSprintModules.map(({ rules: _rules, review: _review, ...item }) => ({
      ...item,
      knowledgeChecks: shuffle(item.knowledgeChecks, seed + item.id).map(
        ({ correctChoiceId: _key, explanation: _explanation, misconception: _misconception, ...question }) => ({
          ...question,
          choices: shuffle(question.choices, seed + question.id),
        }),
      ),
    })),
    labs: itSupportLabs.map(({ rules: _rules, review: _review, ...lab }) => lab),
    missions: itSupportMissions.map(({ rules: _rules, review: _review, ...mission }) => ({
      ...mission,
      steps: mission.steps.map(
        ({ requiredChoiceId: _key, acceptableChoiceIds: _acceptable, ...step }) => ({
          ...step,
          options: shuffle(
            step.options.map(({ id, text, consequence, disposition, nextStepId }) => ({ id, text, consequence, disposition, nextStepId })),
            seed + step.id,
          ),
        }),
      ),
    })),
  };
}
