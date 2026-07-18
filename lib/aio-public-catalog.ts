import "server-only";

import { aioLabs, aioMissions, aioModules } from "./aio-content";

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

/** Browser-safe course projection. Never add answer keys, accepted choices, review state, or private scoring rules here. */
export function aioPublicCatalog(seed: string) {
  return {
    version: "aio-v3-zero-to-role-draft",
    modules: aioModules.map(({ rules: _rules, review: _review, ...item }) => ({
      ...item,
      knowledgeChecks: shuffle(item.knowledgeChecks, seed + item.id).map(
        (question) => ({
          id: question.id,
          prompt: question.prompt,
          choices: shuffle(question.choices, seed + question.id),
          competency: question.competency,
          difficulty: question.difficulty,
        }),
      ),
    })),
    labs: aioLabs.map(({ rules: _rules, review: _review, ...lab }) => lab),
    missions: aioMissions.map(({ review: _review, ...mission }) => ({
      ...mission,
      steps: mission.steps.map(
        ({ requiredChoiceId: _answerKey, acceptableChoiceIds: _acceptableChoiceIds, ...step }) => ({
          ...step,
          options: shuffle(
            step.options.map(({ id, text, consequence, disposition, nextStepId }) => ({
              id,
              text,
              consequence,
              disposition,
              nextStepId,
            })),
            seed + step.id,
          ),
        }),
      ),
    })),
  };
}
