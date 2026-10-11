"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useBoardSession } from "./use-board-session";
import { useProfileContext } from "./profile-context";
import { buildAdvocateProfile } from "./advocate-calibration";
import { buildProfileContext } from "./profile-summary";
import type {
  BoardBrief,
  ChallengeExchange,
  FlowStep,
  PersonaProfile,
  ProbingAnswer,
  ProbingQuestion,
  WebUserProfile,
} from "./types";

type ChallengeStatus = "idle" | "streaming";

interface BoardContextValue {
  // Flow
  step: FlowStep;
  setStep: (step: FlowStep) => void;

  // Decision
  decision: string;
  setDecision: (d: string) => void;
  enrichedDecision: string;

  // Saved judgement profile, shared with every advisor when included
  userProfile: WebUserProfile | null;
  includeProfile: boolean;
  setIncludeProfile: (include: boolean) => void;

  // Probing questions
  probingQuestions: ProbingQuestion[];
  probingAnswers: Record<string, ProbingAnswer>;
  setProbingAnswer: (id: string, answer: ProbingAnswer) => void;
  questionsLoading: boolean;
  generateProbingQuestions: (decision: string) => Promise<void>;

  // Session (from useBoardSession)
  sessionStatus: ReturnType<typeof useBoardSession>["status"];
  responses: ReturnType<typeof useBoardSession>["responses"];
  activePersonaId: ReturnType<typeof useBoardSession>["activePersonaId"];
  brief: BoardBrief | null;
  sessionError: ReturnType<typeof useBoardSession>["error"];
  startSession: ReturnType<typeof useBoardSession>["startSession"];

  // Profiles
  profiles: PersonaProfile[];

  // Challenge
  challengeStatus: ChallengeStatus;
  startChallenge: (personaId: string, text: string) => void;
  abortChallenge: () => void;

  // Brief regeneration
  briefStale: boolean;
  briefLoading: boolean;
  improveBrief(): void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoardContext() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoardContext must be used within BoardProvider");
  return ctx;
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [step, setStepRaw] = useState<FlowStep>("decision_input");
  const [decision, setDecision] = useState("");
  const [probingQuestions, setProbingQuestions] = useState<ProbingQuestion[]>([]);
  const [probingAnswers, setProbingAnswers] = useState<Record<string, ProbingAnswer>>({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [profiles, setProfiles] = useState<PersonaProfile[]>([]);

  // User profile: context for every advisor, and the basis of the advocate persona
  const { profile: userProfile } = useProfileContext();
  const [includeProfile, setIncludeProfile] = useState(true);
  const activeProfile = includeProfile ? userProfile : null;
  const profileContext = useMemo(
    () => (activeProfile ? buildProfileContext(activeProfile) : ""),
    [activeProfile]
  );

  // Challenge state
  const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus>("idle");
  const challengeAbortRef = useRef<AbortController | null>(null);
  const challengePersonaRef = useRef<string | null>(null);

  // Brief regeneration state
  const [briefStale, setBriefStale] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);
  const [regeneratedBrief, setRegeneratedBrief] = useState<BoardBrief | null>(null);

  const session = useBoardSession();
  const { status, responses, activePersonaId, brief: sessionBrief, error: sessionError, startSession: rawStartSession, updateResponse } = session;

  // Wrap startSession to automatically include user profile for advocate generation
  const startSession = useCallback(
    (decision: string) => rawStartSession(decision, activeProfile),
    [rawStartSession, activeProfile]
  );

  // Use regenerated brief if available, otherwise use session brief
  const brief = regeneratedBrief ?? sessionBrief;

  // Load persona profiles on mount, include advocate if the user's profile is in use
  useEffect(() => {
    fetch("/api/board/personas")
      .then((res) => res.json())
      .then((data) => {
        const baseProfiles: PersonaProfile[] = data.personas ?? [];
        if (activeProfile) {
          const advocateProfile = buildAdvocateProfile(activeProfile);
          setProfiles([...baseProfiles, advocateProfile]);
        } else {
          setProfiles(baseProfiles);
        }
      })
      .catch(console.error);
  }, [activeProfile]);

  // Build enriched decision from original + profile + probing Q&A
  const enrichedDecision = useMemo(
    () => buildEnrichedDecision(decision, probingQuestions, probingAnswers, profileContext),
    [decision, probingQuestions, probingAnswers, profileContext]
  );

  // Generate probing questions from the API
  const generateProbingQuestions = useCallback(async (decisionText: string) => {
    setQuestionsLoading(true);
    try {
      const res = await fetch("/api/board/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: decisionText, profileContext }),
      });
      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      setProbingQuestions(data.questions ?? []);
      setProbingAnswers({});
    } catch (err) {
      console.error("Failed to generate probing questions:", err);
      setProbingQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }, [profileContext]);

  const setProbingAnswer = useCallback((id: string, answer: ProbingAnswer) => {
    setProbingAnswers((prev) => ({ ...prev, [id]: answer }));
  }, []);

  // Abort any in-flight challenge and remove the incomplete exchange
  const abortChallenge = useCallback(() => {
    if (challengeAbortRef.current) {
      challengeAbortRef.current.abort();
      challengeAbortRef.current = null;
      // Remove the dangling incomplete exchange
      const personaId = challengePersonaRef.current;
      if (personaId) {
        updateResponse(personaId, (r) => ({
          ...r,
          challenges: r.challenges.filter((c) => c.isReplyComplete),
        }));
        challengePersonaRef.current = null;
      }
    }
    setChallengeStatus("idle");
  }, [updateResponse]);

  // Reset challenge/brief state when a new session starts
  useEffect(() => {
    if (status === "loading") {
      abortChallenge();
      setChallengeStatus("idle");
      setBriefStale(false);
      setBriefLoading(false);
      setRegeneratedBrief(null);
    }
  }, [status, abortChallenge]);

  // Start a challenge exchange
  const startChallenge = useCallback(
    (personaId: string, text: string) => {
      // Abort any existing challenge
      abortChallenge();

      const abortController = new AbortController();
      challengeAbortRef.current = abortController;
      challengePersonaRef.current = personaId;

      // Find the current response to get context
      const response = responses.find((r) => r.personaId === personaId);
      if (!response) return;

      // Add blank exchange to the persona's challenges
      const newExchange: ChallengeExchange = {
        challengeText: text,
        replyContent: "",
        isReplyComplete: false,
      };

      updateResponse(personaId, (r) => ({
        ...r,
        challenges: [...r.challenges, newExchange],
      }));

      setChallengeStatus("streaming");

      // Completed challenges (not including the new blank one)
      const priorChallenges = response.challenges.filter((c) => c.isReplyComplete);

      // Stream the challenge reply
      (async () => {
        try {
          const res = await fetch("/api/board/challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              personaId,
              decision: enrichedDecision,
              initialResponse: response.content,
              priorChallenges,
              challengeText: text,
            }),
            signal: abortController.signal,
          });

          if (!res.ok) throw new Error(`Challenge failed: ${res.status}`);

          const reader = res.body?.getReader();
          if (!reader) throw new Error("No response body");

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const dataMatch = line.match(/^data: (.+)$/m);
              if (!dataMatch) continue;

              let event;
              try {
                event = JSON.parse(dataMatch[1]);
              } catch {
                continue;
              }

              if (event.type === "challenge_reply_token") {
                updateResponse(personaId, (r) => {
                  const challenges = [...r.challenges];
                  const last = challenges[challenges.length - 1];
                  challenges[challenges.length - 1] = {
                    ...last,
                    replyContent: last.replyContent + event.token,
                  };
                  return { ...r, challenges };
                });
              } else if (event.type === "challenge_reply_complete") {
                updateResponse(personaId, (r) => {
                  const challenges = [...r.challenges];
                  const last = challenges[challenges.length - 1];
                  challenges[challenges.length - 1] = {
                    ...last,
                    isReplyComplete: true,
                  };
                  return { ...r, challenges };
                });
                challengePersonaRef.current = null;
                setChallengeStatus("idle");
                setBriefStale(true);
              } else if (event.type === "error") {
                updateResponse(personaId, (r) => {
                  const challenges = [...r.challenges];
                  const last = challenges[challenges.length - 1];
                  challenges[challenges.length - 1] = {
                    ...last,
                    replyContent: last.replyContent || `[Error: ${event.message}]`,
                    isReplyComplete: true,
                  };
                  return { ...r, challenges };
                });
                challengePersonaRef.current = null;
                setChallengeStatus("idle");
              }
            }
          }
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          setChallengeStatus("idle");
        }
      })();
    },
    [responses, enrichedDecision, updateResponse, abortChallenge]
  );

  const improveBrief = useCallback(() => {
    const currentBrief = brief;
    if (!currentBrief) return;
    setBriefLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/board/brief/improve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: currentBrief, decision: enrichedDecision }),
        });
        if (!res.ok) throw new Error(`Improve failed: ${res.status}`);
        const data = await res.json();
        setRegeneratedBrief(data.brief);
      } catch (err) {
        console.error("Failed to improve brief:", err);
      } finally {
        setBriefLoading(false);
      }
    })();
  }, [brief, enrichedDecision]);

  // Step setter that handles brief regeneration when navigating to board_brief
  const setStep = useCallback(
    (newStep: FlowStep) => {
      // Abort challenge on navigation
      if (newStep !== step) {
        abortChallenge();
      }

      if (newStep === "board_brief" && briefStale) {
        setBriefLoading(true);
        setStepRaw(newStep);

        (async () => {
          try {
            const res = await fetch("/api/board/brief", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                decision: enrichedDecision,
                responses,
              }),
            });

            if (!res.ok) throw new Error(`Brief regeneration failed: ${res.status}`);
            const data = await res.json();
            setRegeneratedBrief(data.brief);
            setBriefStale(false);
          } catch (err) {
            console.error("Failed to regenerate brief:", err);
            // Fall back to original brief
          } finally {
            setBriefLoading(false);
          }
        })();
      } else {
        setStepRaw(newStep);
      }
    },
    [step, briefStale, enrichedDecision, responses, abortChallenge]
  );

  // Auto-advance: consulting_board → persona_review when first persona starts
  useEffect(() => {
    if (step === "consulting_board" && responses.length > 0) {
      setStepRaw("persona_review");
    }
  }, [step, responses.length]);

  return (
    <BoardContext.Provider
      value={{
        step,
        setStep,
        decision,
        setDecision,
        enrichedDecision,
        userProfile,
        includeProfile,
        setIncludeProfile,
        probingQuestions,
        probingAnswers,
        setProbingAnswer,
        questionsLoading,
        generateProbingQuestions,
        sessionStatus: status,
        responses,
        activePersonaId,
        brief,
        sessionError: sessionError,
        startSession,
        profiles,
        challengeStatus,
        startChallenge,
        abortChallenge,
        briefStale,
        briefLoading,
        improveBrief,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function formatProbingAnswer(answer: ProbingAnswer | undefined): string {
  if (!answer) return "";
  return [...answer.selected, answer.other.trim()].filter(Boolean).join("; ");
}

function buildEnrichedDecision(
  decision: string,
  questions: ProbingQuestion[],
  answers: Record<string, ProbingAnswer>,
  profileContext: string
): string {
  const answeredQuestions = questions
    .map((q) => ({ q, a: formatProbingAnswer(answers[q.id]) }))
    .filter(({ a }) => a)
    .map(({ q, a }) => `Q: ${q.question}\nA: ${a}`)
    .join("\n\n");

  const sections = [decision];
  if (profileContext) sections.push(`--- About Me (from my profile) ---\n\n${profileContext}`);
  if (answeredQuestions) sections.push(`--- Additional Context ---\n\n${answeredQuestions}`);
  return sections.join("\n\n");
}
