import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@persona-x/llm/client.js";
import { generateBoardBrief } from "@/lib/board-brief";
import type { PersonaResponse } from "@/lib/types";
import { checkApiKey, apiErrorResponse } from "@/lib/api-error";
import { MAX_DECISION_CONTEXT_CHARS } from "@/lib/profile-summary";

export async function POST(request: NextRequest) {
  const keyError = checkApiKey();
  if (keyError) return keyError;

  let body: {
    decision?: string;
    responses?: PersonaResponse[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { decision, responses } = body;

  if (!decision || !responses || responses.length === 0) {
    return NextResponse.json(
      { error: "decision and responses are required" },
      { status: 400 }
    );
  }

  if (decision.length > MAX_DECISION_CONTEXT_CHARS) {
    return NextResponse.json(
      { error: `Decision context must be under ${MAX_DECISION_CONTEXT_CHARS.toLocaleString("en-AU")} characters` },
      { status: 400 }
    );
  }

  if (responses.length > 20) {
    return NextResponse.json(
      { error: "Too many responses (max 20)" },
      { status: 400 }
    );
  }

  // Validate individual response sizes
  for (const r of responses) {
    if ((r.content?.length ?? 0) > 10000) {
      return NextResponse.json(
        { error: "Individual response content too large" },
        { status: 400 }
      );
    }
    if ((r.challenges?.length ?? 0) > 10) {
      return NextResponse.json(
        { error: "Too many challenges per response (max 10)" },
        { status: 400 }
      );
    }
  }

  try {
    const client = createClient();
    const brief = await generateBoardBrief(client, decision, responses);
    return NextResponse.json({ brief });
  } catch (err) {
    return apiErrorResponse(err, "board/brief");
  }
}
