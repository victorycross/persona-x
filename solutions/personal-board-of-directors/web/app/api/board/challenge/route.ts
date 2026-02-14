import { NextRequest, NextResponse } from "next/server";
import { runChallengeStream } from "@/lib/challenge-stream";

export async function POST(request: NextRequest) {
  let body: {
    personaId?: string;
    decision?: string;
    initialResponse?: string;
    priorChallenges?: Array<{
      challengeText: string;
      replyContent: string;
      isReplyComplete: boolean;
    }>;
    challengeText?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { personaId, decision, initialResponse, priorChallenges, challengeText } = body;

  if (!personaId || !decision || !initialResponse || !challengeText) {
    return NextResponse.json(
      { error: "personaId, decision, initialResponse, and challengeText are required" },
      { status: 400 }
    );
  }

  const stream = runChallengeStream({
    personaId,
    decision,
    initialResponse,
    priorChallenges: priorChallenges ?? [],
    challengeText,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
