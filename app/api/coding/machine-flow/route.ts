import { NextResponse } from "next/server";
import { codingMachineFlowSteps } from "@/lib/coding-machine-flow";
import { reviewCodingMachineFlow } from "@/lib/coding-machine-flow-rubric";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { order?: unknown; explanation?: unknown };
    const known = new Set<string>(codingMachineFlowSteps.map((step) => step.id));
    if (!Array.isArray(body.order) || !body.order.every((item) => typeof item === "string" && known.has(item)) || new Set(body.order).size !== codingMachineFlowSteps.length || typeof body.explanation !== "string") return NextResponse.json({ error: "Choose each machine-flow step once and write a short explanation." }, { status: 400 });
    return NextResponse.json(reviewCodingMachineFlow(body.order, body.explanation));
  } catch {
    return NextResponse.json({ error: "The machine-flow exercise could not be reviewed. Your choices remain available locally." }, { status: 400 });
  }
}
