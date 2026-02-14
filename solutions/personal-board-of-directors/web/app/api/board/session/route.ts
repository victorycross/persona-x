import { NextRequest, NextResponse } from "next/server";
import { runBoardSession } from "@/lib/session-stream";

export async function POST(request: NextRequest) {
  let body: { decision?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const decision = body.decision?.trim();
  if (!decision) {
    return NextResponse.json(
      { error: "Decision text is required" },
      { status: 400 }
    );
  }

  if (decision.length > 5000) {
    return NextResponse.json(
      { error: "Decision text must be under 5000 characters" },
      { status: 400 }
    );
  }

  const stream = runBoardSession(decision);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
