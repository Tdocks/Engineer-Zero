import { NextResponse } from "next/server";
import { codingGitCommitOptions, codingGitReviewScenario } from "@/lib/coding-git-review";
import { reviewCodingGitChange } from "@/lib/coding-git-review-rubric";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { selectedFiles?: unknown; commitId?: unknown; reviewerNote?: unknown };
    if (!Array.isArray(body.selectedFiles) || !body.selectedFiles.every((value) => typeof value === "string") || typeof body.commitId !== "string" || typeof body.reviewerNote !== "string") {
      return NextResponse.json({ error: "Select the proposed files, a commit message, and a concrete reviewer note." }, { status: 400 });
    }
    const validFiles = new Set<string>(codingGitReviewScenario.files.map((file) => file.path));
    const validCommitIds = new Set<string>(codingGitCommitOptions.map((option) => option.id));
    if (!body.selectedFiles.every((path) => validFiles.has(path)) || !validCommitIds.has(body.commitId)) {
      return NextResponse.json({ error: "The submitted Git-review choices are not recognized." }, { status: 400 });
    }
    return NextResponse.json(reviewCodingGitChange(body.selectedFiles, body.commitId, body.reviewerNote));
  } catch {
    return NextResponse.json({ error: "The Git review could not be scored. Your local selections are unchanged." }, { status: 400 });
  }
}
