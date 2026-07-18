export type PublicCodingReviewBoardPrompt = { id: string; role: string; prompt: string };

export const codingReviewBoardPrompts: PublicCodingReviewBoardPrompt[] = [
  { id: "product", role: "Product representative", prompt: "Which manual handoff decision becomes easier, and how will you know it helped?" },
  { id: "software", role: "Software engineer", prompt: "Why is the route separate from the service function, and which test proves the important business behavior?" },
  { id: "security", role: "Security engineer", prompt: "What data is out of scope for the model and how do you prevent an untrusted note from changing system behavior?" },
  { id: "operations", role: "Operations user", prompt: "What happens when the model is unavailable during a shift handoff?" },
  { id: "assurance", role: "Assurance reviewer", prompt: "What makes this a prototype rather than an approved operational system?" },
];
