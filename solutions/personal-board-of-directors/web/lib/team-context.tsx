"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import type {
  TeamFlowStep,
  TeamBrief,
  TeamSessionEvent,
  PersonaResponse,
  SessionStatus,
  PersonaStance,
  PersonaStanceMap,
  CompetitiveAdvantageVerdict,
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

  personaStances: PersonaStanceMap;
  setPersonaStance(id: string, stance: PersonaStance): void;

  founderResponse: PersonaResponse | null;
  competitiveAdvantage: CompetitiveAdvantageVerdict | null;
  sessionPhase: "founder" | "team";

  autoSelectLoading: boolean;
  autoSelectPersonas(): void;

  improvingBrief: boolean;
  improveBrief(): void;

  startFounderSession(): void;
  confirmCompetitiveAdvantage(verdict: CompetitiveAdvantageVerdict): void;
  startRemainingSession(): void;
  restartSession(): void;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function useTeamContext(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeamContext must be used within TeamProvider");
  return ctx;
}

/** Consume an SSE ReadableStream, calling onEvent for each parsed event. */
async function consumeSSEStream(
  res: Response,
  signal: AbortSignal,
  onEvent: (event: TeamSessionEvent) => void
): Promise<void> {
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

      if (signal.aborted) return;
      onEvent(event);
    }
  }
}

/** Apply a standard team-phase SSE event to shared state updaters. */
function applyTeamEvent(
  event: TeamSessionEvent,
  setters: {
    setResponses: Dispatch<SetStateAction<PersonaResponse[]>>;
    setActivePersonaId: Dispatch<SetStateAction<string | null>>;
    setTeamBrief: Dispatch<SetStateAction<TeamBrief | null>>;
    setSessionError: Dispatch<SetStateAction<string | null>>;
    setSessionStatus: Dispatch<SetStateAction<SessionStatus>>;
    onComplete(): void;
  }
): void {
  const {
    setResponses,
    setActivePersonaId,
    setTeamBrief,
    setSessionError,
    setSessionStatus,
    onComplete,
  } = setters;

  if (event.type === "session_start") {
    // already streaming
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
    onComplete();
  } else if (event.type === "error") {
    setSessionError(event.message);
    setSessionStatus("error");
  }
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<TeamFlowStep>("project_input");
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [projectBrief, setProjectBrief] = useState("");

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [responses, setResponses] = useState<PersonaResponse[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [teamBrief, setTeamBrief] = useState<TeamBrief | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);

  const [personaStances, setPersonaStancesState] = useState<PersonaStanceMap>({});
  const [founderResponse, setFounderResponse] = useState<PersonaResponse | null>(null);
  const [competitiveAdvantage, setCompetitiveAdvantage] =
    useState<CompetitiveAdvantageVerdict | null>(null);
  const [sessionPhase, setSessionPhase] = useState<"founder" | "team">("founder");
  const [autoSelectLoading, setAutoSelectLoading] = useState(false);
  const [improvingBrief, setImprovingBrief] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const togglePersona = useCallback((id: string) => {
    setSelectedPersonaIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const setPersonaStance = useCallback((id: string, stance: PersonaStance) => {
    setPersonaStancesState((prev) => ({ ...prev, [id]: stance }));
  }, []);

  const confirmCompetitiveAdvantage = useCallback(
    (verdict: CompetitiveAdvantageVerdict) => {
      setCompetitiveAdvantage(verdict);
    },
    []
  );

  const startFounderSession = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSessionStatus("loading");
    setResponses([]);
    setActivePersonaId(null);
    setTeamBrief(null);
    setSessionError(null);
    setCurrentMemberIndex(0);
    setFounderResponse(null);
    setCompetitiveAdvantage(null);

    const hasFounder = selectedPersonaIds.includes("founder");

    if (!hasFounder) {
      // Single-phase fallback — no Founder in team
      setSessionPhase("team");
      setStep("consulting_team");

      (async () => {
        try {
          const res = await fetch("/api/team/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectBrief,
              selectedPersonaIds,
              founderOnly: false,
              personaStances,
            }),
            signal: controller.signal,
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(
              (data as { error?: string }).error ?? `HTTP ${res.status}`
            );
          }

          setSessionStatus("streaming");

          await consumeSSEStream(res, controller.signal, (event) => {
            applyTeamEvent(event, {
              setResponses,
              setActivePersonaId,
              setTeamBrief,
              setSessionError,
              setSessionStatus,
              onComplete() {
                setStep("team_review");
                setCurrentMemberIndex(0);
              },
            });
          });

          abortRef.current = null;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          setSessionError(err instanceof Error ? err.message : String(err));
          setSessionStatus("error");
          abortRef.current = null;
        }
      })();
      return;
    }

    // Phase 1 — Founder only
    setSessionPhase("founder");
    setStep("consulting_team");

    (async () => {
      try {
        const res = await fetch("/api/team/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectBrief,
            founderOnly: true,
            personaStances,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            (data as { error?: string }).error ?? `HTTP ${res.status}`
          );
        }

        setSessionStatus("streaming");

        await consumeSSEStream(res, controller.signal, (event) => {
          if (event.type === "session_start") {
            // already streaming
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
          } else if (event.type === "competitive_advantage_verdict") {
            setCompetitiveAdvantage(event.verdict);
          } else if (event.type === "founder_phase_complete") {
            setSessionStatus("complete");
            setResponses((prev) => {
              const fr = prev.find((r) => r.personaId === "founder") ?? null;
              setFounderResponse(fr);
              return prev;
            });
            setStep("founder_gate");
          } else if (event.type === "error") {
            setSessionError(event.message);
            setSessionStatus("error");
          }
        });

        abortRef.current = null;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSessionError(err instanceof Error ? err.message : String(err));
        setSessionStatus("error");
        abortRef.current = null;
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectBrief, selectedPersonaIds, personaStances]);

  const startRemainingSession = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const remainingSlugs = selectedPersonaIds.filter((id) => id !== "founder");

    setSessionPhase("team");
    setStep("consulting_team");
    setSessionStatus("loading");
    setActivePersonaId(null);
    setTeamBrief(null);
    setSessionError(null);
    // Intentionally do NOT reset `responses` — founder's entry stays

    (async () => {
      try {
        const res = await fetch("/api/team/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectBrief,
            selectedPersonaIds: remainingSlugs,
            founderOnly: false,
            personaStances,
            competitiveAdvantage,
            founderResponse: founderResponse
              ? {
                  personaId: founderResponse.personaId,
                  personaName: founderResponse.personaName,
                  content: founderResponse.content,
                }
              : undefined,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            (data as { error?: string }).error ?? `HTTP ${res.status}`
          );
        }

        setSessionStatus("streaming");

        await consumeSSEStream(res, controller.signal, (event) => {
          applyTeamEvent(event, {
            setResponses,
            setActivePersonaId,
            setTeamBrief,
            setSessionError,
            setSessionStatus,
            onComplete() {
              setStep("team_review");
              setCurrentMemberIndex(0);
            },
          });
        });

        abortRef.current = null;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSessionError(err instanceof Error ? err.message : String(err));
        setSessionStatus("error");
        abortRef.current = null;
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectBrief,
    selectedPersonaIds,
    personaStances,
    competitiveAdvantage,
    founderResponse,
  ]);

  const autoSelectPersonas = useCallback(async () => {
    const brief = projectBrief.trim();
    if (!brief) return;
    setAutoSelectLoading(true);
    try {
      const res = await fetch("/api/team/auto-select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectBrief: brief }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { selectedPersonaIds: string[]; stances: PersonaStanceMap };
      setSelectedPersonaIds(data.selectedPersonaIds ?? []);
      setPersonaStancesState(data.stances ?? {});
      setStep("persona_select");
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : String(err));
    } finally {
      setAutoSelectLoading(false);
    }
  }, [projectBrief]);

  const improveBrief = useCallback(async () => {
    if (!teamBrief) return;
    setImprovingBrief(true);
    try {
      const res = await fetch("/api/team/brief/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: teamBrief, projectBrief }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { brief: TeamBrief };
      if (data.brief) {
        setTeamBrief(data.brief);
      }
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : String(err));
    } finally {
      setImprovingBrief(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamBrief, projectBrief]);

  const restartSession = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStep("project_input");
    setSelectedPersonaIds([]);
    setProjectBrief("");
    setSessionStatus("idle");
    setResponses([]);
    setActivePersonaId(null);
    setTeamBrief(null);
    setSessionError(null);
    setCurrentMemberIndex(0);
    setPersonaStancesState({});
    setFounderResponse(null);
    setCompetitiveAdvantage(null);
    setSessionPhase("founder");
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
        personaStances,
        setPersonaStance,
        founderResponse,
        competitiveAdvantage,
        sessionPhase,
        autoSelectLoading,
        autoSelectPersonas,
        improvingBrief,
        improveBrief,
        startFounderSession,
        confirmCompetitiveAdvantage,
        startRemainingSession,
        restartSession,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
