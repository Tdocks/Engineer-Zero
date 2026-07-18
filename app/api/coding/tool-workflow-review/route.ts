import { NextResponse } from "next/server";
import { reviewToolWorkflow } from "@/lib/coding-tool-workflow-review";
import type { ToolWorkflowDisposition } from "@/lib/coding-tool-workflow";

const allowed = new Set(["allow-read-only", "request-approval", "reject"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { choices?: unknown };
    if (!body.choices || typeof body.choices !== "object" || Array.isArray(body.choices)) {
      return NextResponse.json({ error: "Submit one disposition for each fictional tool proposal." }, { status: 400 });
    }
    const choices = Object.entries(body.choices as Record<string, unknown>).reduce<Partial<Record<string, ToolWorkflowDisposition>>>(
      (valid, [id, value]) => {
        if (typeof value === "string" && allowed.has(value)) valid[id] = value as ToolWorkflowDisposition;
        return valid;
      },
      {},
    );
    return NextResponse.json(reviewToolWorkflow(choices));
  } catch {
    return NextResponse.json({ error: "The tool-workflow choices could not be reviewed. Your selections remain available locally." }, { status: 400 });
  }
}
