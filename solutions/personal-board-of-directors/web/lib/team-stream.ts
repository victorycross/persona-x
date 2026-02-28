import path from "path";
import { createClient } from "@persona-x/llm/client.js";
import { loadPersonasForPanel } from "@persona-x/runtime/loader.js";
import { createPanelSession, determineSpeakingOrder } from "@persona-x/runtime/panel.js";
import { RUBRIC_DIMENSIONS } from "@persona-x/schema/rubric.js";
import type { RubricDimensionName } from "@persona-x/schema/rubric.js";
import type { LoadedPersona } from "@persona-x/runtime/interface.js";
import { generateTeamBrief } from "./team-brief";
import { LLM_MODEL } from "./constants";
import type { TeamSessionEvent, PersonaResponse } from "./team-types";

const TEAM_PERSONA_DIR = path.join(process.cwd(), "personas", "team");

async function loadTeamPersonas(slugs: string[]): Promise<LoadedPersona[]> {
  const filePaths = slugs.map((slug) =>
    path.join(TEAM_PERSONA_DIR, `${slug}.yaml`)
  );
  const result = await loadPersonasForPanel(filePaths);
  if (Object.keys(result.errors).length > 0) {
    throw new Error(
      `Failed to load team personas: ${JSON.stringify(result.errors)}`
    );
  }
  return result.personas;
}

function identifyRubricInfluence(persona: LoadedPersona): RubricDimensionName[] {
  const rubric = persona.file.rubric;
  const scored = RUBRIC_DIMENSIONS.map((dim) => ({
    dim,
    distance: Math.abs(rubric[dim].score - 5),
  }));
  scored.sort((a, b) => b.distance - a.distance);
  return scored.slice(0, 3).map((s) => s.dim);
}

function buildPersonaUserMessage(
  projectBrief: string,
  persona: LoadedPersona,
  priorResponses: PersonaResponse[]
): string {
  const influence = identifyRubricInfluence(persona);
  const influenceNote = influence
    .map((dim) => {
      const score = persona.file.rubric[dim].score;
      const label = dim.replace(/_/g, " ");
      return `- ${label}: ${score}/10`;
    })
    .join("\n");

  let message = `A software development team is reviewing the following project:

"${projectBrief}"

Your role: ${persona.file.metadata.name}
Your strongest rubric influences for this review:
${influenceNote}

Provide your perspective as ${persona.file.metadata.name}. Be specific, concrete, and actionable. Structure your response with:
1. Your initial take on this project from your role's perspective
2. Key concerns or risks you see from your vantage point
3. Your specific recommendations for the team
4. One thing the team should address that they probably have not considered yet

Keep your response focused and under 400 words. Use Australian English spelling.`;

  if (priorResponses.length > 0) {
    const priorSummary = priorResponses
      .map((r) => `${r.personaName}: ${r.content.substring(0, 200)}...`)
      .join("\n\n");
    message += `\n\nOther team members have already given their views:\n${priorSummary}\n\nBuild on or respectfully challenge their perspectives where relevant. Do not repeat what has already been said.`;
  }

  return message;
}

/**
 * Run a complete team consultation session, returning a ReadableStream of SSE events.
 */
export function runTeamSession(
  projectBrief: string,
  selectedSlugs: string[]
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let activeStream: { abort(): void } | null = null;
  let cancelled = false;

  return new ReadableStream({
    async start(controller) {
      function emit(event: TeamSessionEvent) {
        if (cancelled) return;
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      try {
        const client = createClient();
        const personas = await loadTeamPersonas(selectedSlugs);
        const ordered = determineSpeakingOrder(personas);

        const session = createPanelSession({
          topic: projectBrief,
          context: "Software Team Advisor — single-round project review",
          personas: ordered,
          max_rounds: 1,
          moderation: "none",
        });

        emit({ type: "session_start", personaCount: ordered.length });

        const responses: PersonaResponse[] = [];

        for (const persona of ordered) {
          if (cancelled) break;

          const systemPrompt = session.system_prompts.get(persona.id);
          if (!systemPrompt) continue;

          emit({
            type: "persona_start",
            personaId: persona.id,
            personaName: persona.file.metadata.name,
            role: persona.file.panel_role.contribution_type,
          });

          const userMessage = buildPersonaUserMessage(projectBrief, persona, responses);
          let fullContent = "";

          try {
            const stream = client.messages.stream({
              model: LLM_MODEL,
              max_tokens: 1024,
              temperature: 0.7,
              system: systemPrompt,
              messages: [{ role: "user", content: userMessage }],
            });
            activeStream = stream;

            for await (const event of stream) {
              if (cancelled) break;
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                const token = event.delta.text;
                fullContent += token;
                emit({ type: "persona_token", personaId: persona.id, token });
              }
            }

            activeStream = null;
          } catch (err) {
            activeStream = null;
            if (cancelled) break;
            fullContent = `[Error generating response: ${err instanceof Error ? err.message : String(err)}]`;
            emit({ type: "persona_token", personaId: persona.id, token: fullContent });
          }

          responses.push({
            personaId: persona.id,
            personaName: persona.file.metadata.name,
            content: fullContent,
            isComplete: true,
          });

          emit({ type: "persona_complete", personaId: persona.id });
        }

        if (cancelled) {
          controller.close();
          return;
        }

        emit({ type: "brief_start" });

        try {
          const brief = await generateTeamBrief(client, projectBrief, responses);
          emit({ type: "brief_complete", brief });
        } catch (err) {
          emit({
            type: "error",
            message: `Failed to generate Team Brief: ${err instanceof Error ? err.message : String(err)}`,
          });
        }

        emit({ type: "session_complete" });
        controller.close();
      } catch (err) {
        if (cancelled) {
          controller.close();
          return;
        }
        emit({
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        });
        controller.close();
      }
    },
    cancel() {
      cancelled = true;
      activeStream?.abort();
      activeStream = null;
    },
  });
}
