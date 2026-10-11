"use client";

import Link from "next/link";
import { useBoardContext } from "@/lib/board-context";
import { profileDecisionStarter } from "@/lib/profile-summary";

export function DecisionInput() {
  const {
    decision,
    setDecision,
    generateProbingQuestions,
    setStep,
    userProfile,
    includeProfile,
    setIncludeProfile,
  } = useBoardContext();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = decision.trim();
    if (!trimmed) return;
    setStep("probing_questions");
    generateProbingQuestions(trimmed);
  }

  const starter = userProfile ? profileDecisionStarter(userProfile) : "";

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        {userProfile ? (
          <div className="rounded-[16px] border border-board-border bg-board-surface px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-board-text-tertiary font-sans">
                  Your profile
                </p>
                <p className="mt-1 text-sm font-medium text-board-text">{userProfile.name}</p>
                {userProfile.primaryGoal && (
                  <p className="mt-0.5 text-xs text-board-text-secondary">
                    Goal: {userProfile.primaryGoal}
                  </p>
                )}
              </div>
              <Link
                href="/board/profile"
                className="flex-shrink-0 text-xs font-medium text-board-accent hover:underline"
              >
                Edit
              </Link>
            </div>
            <label className="mt-4 flex items-start gap-2.5 text-sm text-board-text-secondary">
              <input
                type="checkbox"
                checked={includeProfile}
                onChange={(e) => setIncludeProfile(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[rgb(var(--board-accent))]"
              />
              <span>
                Share my profile with the board — your background, goals and constraints, and your personal
                advocate. Clarifying questions won&apos;t re-ask what it already covers.
              </span>
            </label>
          </div>
        ) : (
          <p className="text-center text-xs text-board-text-tertiary">
            Advisors give sharper advice when they know your background.{" "}
            <Link href="/board/profile" className="font-medium text-board-accent hover:underline">
              Create your profile
            </Link>{" "}
            (about 5 minutes).
          </p>
        )}

        <div className="rounded-[16px] border border-board-border bg-board-surface px-6 py-7">
          <h2 id="decision-label" className="text-2xl font-serif text-board-text mb-1">
            What decision are you facing?
          </h2>
          <p id="decision-hint" className="text-sm text-board-text-secondary mb-5">
            Describe the situation, your options, and what matters most to you.
          </p>
          {starter && includeProfile && !decision.trim() && (
            <button
              type="button"
              onClick={() => setDecision(starter)}
              className="mb-3 rounded-lg border border-board-accent/40 px-3 py-1.5 text-xs font-medium text-board-accent transition-colors hover:bg-board-accent/10"
            >
              Start from my profile goal
            </button>
          )}
          <textarea
            id="decision"
            aria-labelledby="decision-label"
            aria-describedby="decision-hint"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="e.g. I'm considering leaving my role for a startup offering equity but a 30% pay cut."
            rows={6}
            maxLength={5000}
            className="w-full rounded-[8px] border border-board-border bg-board-bg px-4 py-3 text-sm text-board-text placeholder:text-board-text-tertiary placeholder:italic focus:border-board-accent/50 focus:outline-none focus:ring-1 focus:ring-board-accent/30 resize-none"
          />
          <div className="mt-1 text-right text-xs text-board-text-tertiary">
            {decision.length}/5000
          </div>
        </div>
        <button
          type="submit"
          disabled={!decision.trim()}
          className="w-full rounded-[12px] bg-board-accent px-6 py-3.5 text-sm font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90 disabled:opacity-50 disabled:bg-board-surface-raised disabled:text-board-text-secondary disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
