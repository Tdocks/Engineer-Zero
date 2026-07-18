export const codingMachineFlowSteps = [
  { id: "keyboard", label: "Keyboard", description: "The learner enters a command." },
  { id: "shell", label: "Shell", description: "The command interpreter reads the instruction." },
  { id: "operating-system", label: "Operating system", description: "The system locates and starts the requested program." },
  { id: "python", label: "Python interpreter", description: "Python reads the source instructions." },
  { id: "program", label: "Program", description: "Your Python file runs its own logic." },
  { id: "output", label: "Output", description: "The result or error returns to the terminal." },
] as const;

/** Deliberately not in execution order; it prevents order-by-display guessing. */
export const codingMachineFlowChoices = ["program", "keyboard", "output", "shell", "python", "operating-system"] as const;
