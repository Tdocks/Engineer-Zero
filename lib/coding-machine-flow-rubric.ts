import "server-only";

const expected = ["keyboard", "shell", "operating-system", "python", "program", "output"];

export function reviewCodingMachineFlow(order: string[], explanation: string) {
  const normalized = explanation.toLowerCase();
  const missingClaims = ["shell", "operating system", "python", "output"].filter((claim) => !normalized.includes(claim));
  const correctOrder = order.length === expected.length && order.every((step, index) => step === expected[index]);
  const complete = correctOrder && missingClaims.length === 0;
  return {
    complete,
    correctOrder,
    missingClaims,
    feedback: complete
      ? "You reconstructed the command path and explained the handoff points. This mental model will help you separate a shell error, an environment issue, and an error from your Python program."
      : "Revise the path and explanation. A command begins at the keyboard, the shell interprets it, the operating system starts Python, the program runs, and output returns to the terminal.",
  };
}
