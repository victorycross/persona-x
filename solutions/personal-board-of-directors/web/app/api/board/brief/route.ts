import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@persona-x/llm/client.js";
import { generateBoardBrief } from "@/lib/board-brief";
import type { PersonaResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
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

  try {
    const client = createClient();
    const brief = await generateBoardBrief(client, decision, responses);
    return NextResponse.json({ brief });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
