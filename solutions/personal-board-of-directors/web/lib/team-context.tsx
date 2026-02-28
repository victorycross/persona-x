"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  TeamFlowStep,
  TeamBrief,
  TeamSessionEvent,
  PersonaResponse,
  SessionStatus,
} from "./team-types";

interface TeamContextValue {
  step: TeamFlowStep;
  setStep(step: TeamFlowStep): void;

  selectedPersonaIds: string[];
  togglePersona(id: string): void;

  projectBrief: string;
  setProjectBrief(s: string): void;

  sessionStatus: SessionStatus;
  responses: PersonaResponse[];
  activePersonaId: string | null;
  teamBrief: TeamBrief | null;
  sessionError: string | null;

  currentMemberIndex: number;
  setCurrentMemberIndex(i: number): void;

  startSession(): void;
  restartSession(): void;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function useTeamContext(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeamContext must be used within TeamProvider");
  return ctx;
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<TeamFlowStep>("persona_select");
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [projectBrief, setProjectBrief] = useState("");

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [responses, setResponses] = useState<PersonaResponse[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [teamBrief, setTeamBrief] = useState<TeamBrief | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  const togglePersona = useCallback((id: string) => {
    setSelectedPersonaIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const startSession = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSessionStatus("loading");
    setResponses([]);
    setActivePersonaId(null);
    setTeamBrief(null);
    setSessionError(null);
    setCurrentMemberIndex(0);
    setStep("consulting_team");

    (async () => {
      try {
        const res = await fetch("/api/team/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectBrief,
            selectedPersonaIds,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
        }

        setSessionStatus("streaming");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const match = part.match(/^data: (.+)$/m);
            if (!match) continue;

            let event: TeamSessionEvent;
            try {
              event = JSON.parse(match[1]) as TeamSessionEvent;
            } catch {
              continue;
            }

            if (event.type === "session_start") {
              // Already streaming
            } else if (event.type === "persona_start") {
              setActivePersonaId(event.personaId);
              setResponses((prev) => [
                ...prev,
                {
                  personaId: event.personaId,
                  personaName: event.personaName,
                  content: "",
                  isComplete: false,
                },
              ]);
            } else if (event.type === "persona_token") {
              setResponses((prev) =>
                prev.map((r) =>
                  r.personaId === event.personaId
                    ? { ...r, content: r.content + event.token }
                    : r
                )
              );
            } else if (event.type === "persona_complete") {
              setResponses((prev) =>
                prev.map((r) =>
                  r.personaId === event.personaId ? { ...r, isComplete: true } : r
                )
              );
              setActivePersonaId(null);
            } else if (event.type === "brief_complete") {
              setTeamBrief(event.brief);
            } else if (event.type === "session_complete") {
              setSessionStatus("complete");
              setStep("team_review");
              setCurrentMemberIndex(0);
            } else if (event.type === "error") {
              setSessionError(event.message);
              setSessionStatus("error");
            }
          }
        }

        abortRef.current = null;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSessionError(err instanceof Error ? err.message : String(err));
        setSessionStatus("error");
        abortRef.current = null;
      }
    })();
  }, [projectBrief, selectedPersonaIds]);

  const restartSession = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStep("persona_select");
    setSelectedPersonaIds([]);
    setProjectBrief("");
    setSessionStatus("idle");
    setResponses([]);
    setActivePersonaId(null);
    setTeamBrief(null);
    setSessionError(null);
    setCurrentMemberIndex(0);
  }, []);

  return (
    <TeamContext.Provider
      value={{
        step,
        setStep,
        selectedPersonaIds,
        togglePersona,
        projectBrief,
        setProjectBrief,
        sessionStatus,
        responses,
        activePersonaId,
        teamBrief,
        sessionError,
        currentMemberIndex,
        setCurrentMemberIndex,
        startSession,
        restartSession,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
