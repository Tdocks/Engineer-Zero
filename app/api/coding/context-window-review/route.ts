import { NextResponse } from "next/server";
import { codingContextChunks, selectedContextTokens } from "@/lib/coding-context-window";
import { reviewCodingContextWindow } from "@/lib/coding-context-window-review";

const allowedIds = new Set(codingContextChunks.map((chunk) => chunk.id));

export async function POST(request: Request) {
  try {
    const body = await request.json() as { selected?: unknown };
    if (!Array.isArray(body.selected) || !body.selected.every((item) => typeof item === "string" && allowedIds.has(item))) {
      return NextResponse.json({ error: "Submit a valid set of fictional context sources." }, { status: 400 });
    }
    const selected = [...new Set(body.selected)];
    return NextResponse.json(reviewCodingContextWindow(selected, selectedContextTokens(selected)));
  } catch {
    return NextResponse.json({ error: "The context selection could not be reviewed. Keep your selections and retry when ready." }, { status: 400 });
  }
}
