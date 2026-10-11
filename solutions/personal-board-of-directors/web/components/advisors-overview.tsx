"use client";

import { useState } from "react";
import { useBoardContext } from "@/lib/board-context";
import { ROLE_BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/lib/constants";
import { summariseResponse } from "@/lib/response-summary";
import type { PersonaProfile, PersonaResponse } from "@/lib/types";
import { RubricChart } from "./rubric-chart";

/**
 * All advisors on one page: each card shows the advisor's bottom line and
 * expands to the full response, where the user can also challenge them.
 */
export function AdvisorsOverview() {
  const { responses, activePersonaId, profiles, setStep, challengeStatus } = useBoardContext();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const total = Math.max(profiles.length, responses.length);
  const completeCount = responses.filter((r) => r.isComplete).length;
  const allComplete = responses.length > 0 && completeCount === total;
  const pendingCount = Math.max(total - responses.length, 0);

  function toggle(personaId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(personaId)) next.delete(personaId);
      else next.add(personaId);
      return next;
    });
  }

  const liveMessage = allComplete
    ? "All advisors have responded."
    : activePersonaId
      ? `${responses.find((r) => r.personaId === activePersonaId)?.personaName ?? "An advisor"} is responding…`
      : "";

  return (
    <div className="animate-fade-in">
      <div className="sr-only" aria-live="polite">{liveMessage}</div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-board-text-tertiary font-sans">
          Your Board
        </p>
        <h2 className="text-2xl font-serif text-board-text mt-1">What your advisors said</h2>
        <p className="text-sm text-board-text-secondary mt-1">
          Each advisor&apos;s bottom line is below. Open any card to read their full view or challenge them.
        </p>
      </div>

      <div className="space-y-3">
        {responses.map((response) => (
          <AdvisorCard
            key={response.personaId}
            response={response}
            profile={profiles.find((p) => p.id === response.personaId)}
            isActive={activePersonaId === response.personaId}
            isExpanded={expanded.has(response.personaId)}
            onToggle={() => toggle(response.personaId)}
          />
        ))}

        {Array.from({ length: pendingCount }).map((_, i) => (
          <div
            key={`pending-${i}`}
            className="rounded-[16px] border border-dashed border-board-border px-6 py-4 text-xs text-board-text-tertiary"
          >
            Waiting to speak…
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          onClick={() => setStep("board_brief")}
          disabled={!allComplete || challengeStatus === "streaming"}
          className="w-full rounded-[12px] bg-board-accent px-6 py-3.5 text-sm font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90 disabled:opacity-50 disabled:bg-board-surface-raised disabled:text-board-text-secondary disabled:cursor-not-allowed"
        >
          {allComplete ? (
            <>
              View Board Brief <span aria-hidden="true">&rarr;</span>
            </>
          ) : (
            `Waiting for advisors (${completeCount} of ${total})`
          )}
        </button>
        {allComplete && (
          <p className="text-xs text-board-text-tertiary">
            The brief synthesises all {total} perspectives, including any challenges you raise.
          </p>
        )}
      </div>
    </div>
  );
}

function AdvisorCard({
  response,
  profile,
  isActive,
  isExpanded,
  onToggle,
}: {
  response: PersonaResponse;
  profile: PersonaProfile | undefined;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { challengeStatus, startChallenge } = useBoardContext();
  const [challengeText, setChallengeText] = useState("");
  const [showRubric, setShowRubric] = useState(false);

  const isStreaming = isActive && !response.isComplete;
  const { summary, body } = summariseResponse(response.content);
  const badgeColor = ROLE_BADGE_COLORS[profile?.contributionType ?? ""] ?? DEFAULT_BADGE_COLOR;
  const panelId = `advisor-${response.personaId}`;

  function handleSubmitChallenge() {
    const text = challengeText.trim();
    if (!text) return;
    setChallengeText("");
    startChallenge(response.personaId, text);
  }

  return (
    <div className="rounded-[16px] border border-board-border bg-board-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="w-full px-6 py-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-board-text">{response.personaName}</span>
              {profile && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${badgeColor}`}
                >
                  {profile.contributionType}
                </span>
              )}
              {response.challenges.length > 0 && (
                <span className="text-[10px] text-board-text-tertiary">
                  {response.challenges.length} challenge{response.challenges.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-board-text-secondary">
              {summary || (
                <span className="italic text-board-text-tertiary">
                  {isStreaming ? "Responding…" : "Preparing response…"}
                </span>
              )}
            </p>
          </div>
          <span className="flex-shrink-0 pt-0.5 text-xs text-board-accent">
            {isStreaming ? (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-board-accent animate-pulse" />
                Speaking
              </span>
            ) : isExpanded ? (
              "Hide"
            ) : (
              "Read full"
            )}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div id={panelId} className="border-t border-board-border px-6 py-5 space-y-4">
          <div
            className={`text-sm leading-relaxed text-board-text-secondary whitespace-pre-wrap ${
              isStreaming ? "streaming-cursor" : ""
            }`}
          >
            {body}
          </div>

          {response.challenges.map((exchange, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-[14px] border border-board-accent/20 bg-board-surface-raised px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-board-accent mb-1.5 font-sans">You</p>
                  <p className="text-sm text-board-text-secondary whitespace-pre-wrap">{exchange.challengeText}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-[14px] border border-board-border bg-board-bg px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-board-text-tertiary mb-1.5 font-sans">
                    {response.personaName}
                  </p>
                  <div
                    className={`text-sm text-board-text-secondary whitespace-pre-wrap ${
                      !exchange.isReplyComplete ? "streaming-cursor" : ""
                    }`}
                  >
                    {exchange.replyContent || <span className="italic text-board-text-tertiary">Thinking…</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {response.isComplete && challengeStatus !== "streaming" && (
            <div>
              <label
                htmlFor={`challenge-${response.personaId}`}
                className="text-xs uppercase tracking-widest text-board-text-tertiary mb-2 block font-sans"
              >
                Challenge {response.personaName}
              </label>
              <textarea
                id={`challenge-${response.personaId}`}
                value={challengeText}
                onChange={(e) => setChallengeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmitChallenge();
                  }
                }}
                placeholder="Ask a follow-up or push back on their view…"
                rows={2}
                maxLength={2000}
                className="field-input resize-none"
              />
              <div className="mt-2 flex items-center justify-between">
                {profile ? (
                  <button
                    type="button"
                    onClick={() => setShowRubric((v) => !v)}
                    className="text-xs text-board-text-tertiary hover:text-board-text-secondary"
                  >
                    {showRubric ? "Hide" : "Show"} judgement profile
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={handleSubmitChallenge}
                  disabled={!challengeText.trim()}
                  className="rounded-[10px] bg-board-accent px-4 py-2 text-xs font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90 disabled:opacity-50 disabled:bg-board-surface-raised disabled:text-board-text-secondary disabled:cursor-not-allowed"
                >
                  Challenge
                </button>
              </div>
            </div>
          )}

          {showRubric && profile && (
            <div className="rounded-[12px] border border-board-border px-4 py-4">
              <RubricChart rubric={profile.rubric} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
