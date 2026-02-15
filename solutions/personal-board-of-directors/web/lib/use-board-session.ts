"use client";

import { useState, useCallback, useRef } from "react";
import type {
  BoardBrief,
  BoardSessionEvent,
  PersonaResponse,
  SessionStatus,
} from "./types";

export interface BoardSessionState {
  status: SessionStatus;
  responses: PersonaResponse[];
  activePersonaId: string | null;
  brief: BoardBrief | null;
  error: string | null;
}

export function useBoardSession() {
  const [state, setState] = useState<BoardSessionState>({
    status: "idle",
    responses: [],
    activePersonaId: null,
    brief: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const startSession = useCallback(async (decision: string) => {
    // Abort any existing session
    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    setState({
      status: "loading",
      responses: [],
      activePersonaId: null,
      brief: null,
      error: null,
    });

    try {
      const res = await fetch("/api/board/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`Session failed: ${res.status} ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      setState((prev) => ({ ...prev, status: "streaming" }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const dataMatch = line.match(/^data: (.+)$/m);
          if (!dataMatch) continue;

          let event: BoardSessionEvent;
          try {
            event = JSON.parse(dataMatch[1]);
          } catch {
            continue;
          }
          handleEvent(event, setState);
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const dataMatch = buffer.match(/^data: (.+)$/m);
        if (dataMatch) {
          try {
            const event: BoardSessionEvent = JSON.parse(dataMatch[1]);
            handleEvent(event, setState);
          } catch {
            // Truncated SSE frame — ignore
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  const updateResponse = useCallback(
    (personaId: string, updater: (r: PersonaResponse) => PersonaResponse) => {
      setState((prev) => ({
        ...prev,
        responses: prev.responses.map((r) =>
          r.personaId === personaId ? updater(r) : r
        ),
      }));
    },
    []
  );

  return { ...state, startSession, updateResponse };
}

function handleEvent(
  event: BoardSessionEvent,
  setState: React.Dispatch<React.SetStateAction<BoardSessionState>>
) {
  switch (event.type) {
    case "persona_start":
      setState((prev) => ({
        ...prev,
        activePersonaId: event.personaId,
        responses: [
          ...prev.responses,
          {
            personaId: event.personaId,
            personaName: event.personaName,
            content: "",
            isComplete: false,
            challenges: [],
          },
        ],
      }));
      break;

    case "persona_token":
      setState((prev) => ({
        ...prev,
        responses: prev.responses.map((r) =>
          r.personaId === event.personaId
            ? { ...r, content: r.content + event.token }
            : r
        ),
      }));
      break;

    case "persona_complete":
      setState((prev) => ({
        ...prev,
        activePersonaId: null,
        responses: prev.responses.map((r) =>
          r.personaId === event.personaId ? { ...r, isComplete: true } : r
        ),
      }));
      break;

    case "brief_complete":
      setState((prev) => ({
        ...prev,
        brief: event.brief,
      }));
      break;

    case "session_complete":
      setState((prev) => ({
        ...prev,
        status: "complete",
      }));
      break;

    case "error":
      setState((prev) => ({
        ...prev,
        status: "error",
        error: event.message,
      }));
      break;
  }
}
