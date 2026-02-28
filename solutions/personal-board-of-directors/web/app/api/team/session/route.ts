import { NextRequest, NextResponse } from "next/server";
import { checkApiKey } from "@/lib/api-error";
import { runTeamSession } from "@/lib/team-stream";

export async function POST(request: NextRequest): Promise<Response> {
  const keyError = checkApiKey();
  if (keyError) return keyError;

  let body: { projectBrief?: string; selectedPersonaIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const projectBrief = body.projectBrief?.trim();
  if (!projectBrief) {
    return NextResponse.json(
      { error: "Project brief is required" },
      { status: 400 }
    );
  }

  if (projectBrief.length > 5000) {
    return NextResponse.json(
      { error: "Project brief must be under 5000 characters" },
      { status: 400 }
    );
  }

  const selectedPersonaIds = body.selectedPersonaIds;
  if (
    !Array.isArray(selectedPersonaIds) ||
    selectedPersonaIds.length < 2
  ) {
    return NextResponse.json(
      { error: "At least 2 team members must be selected" },
      { status: 400 }
    );
  }

  const stream = runTeamSession(projectBrief, selectedPersonaIds);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
