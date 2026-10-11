import { NextRequest, NextResponse } from "next/server";
import { runBoardSession } from "@/lib/session-stream";
import { generateAdvocatePersona } from "@/lib/advocate-generator";
import { checkApiKey } from "@/lib/api-error";
import type { WebUserProfile } from "@/lib/types";
import { MAX_DECISION_CONTEXT_CHARS } from "@/lib/profile-summary";

export async function POST(request: NextRequest) {
  const keyError = checkApiKey();
  if (keyError) return keyError;

  let body: { decision?: string; userProfile?: WebUserProfile };
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

  if (decision.length > MAX_DECISION_CONTEXT_CHARS) {
    return NextResponse.json(
      { error: `Decision context must be under ${MAX_DECISION_CONTEXT_CHARS.toLocaleString("en-AU")} characters` },
      { status: 400 }
    );
  }

  let advocatePersona;
  if (body.userProfile) {
    try {
      advocatePersona = generateAdvocatePersona(body.userProfile, decision);
    } catch (err) {
      console.error("Failed to generate advocate persona:", err);
    }
  }

  const stream = runBoardSession(decision, advocatePersona);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
