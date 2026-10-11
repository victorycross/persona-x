"use client";

import { useState } from "react";
import {
  MAX_GOALS_STATEMENT_CHARS,
  type GoalsDraftRequest,
  type GoalsDraftResult,
} from "@/lib/profile-import";

export function GoalsDraft({
  about,
  onDrafted,
}: {
  about: GoalsDraftRequest["about"];
  onDrafted: (result: GoalsDraftResult) => void;
}) {
  const [statement, setStatement] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafted, setDrafted] = useState(false);

  const canSubmit = !loading && statement.trim().length >= 10;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/board/profile/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement, about } satisfies GoalsDraftRequest),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.goals) {
        throw new Error(data.error ?? "Drafting failed. Please try again.");
      }
      onDrafted(data.goals as GoalsDraftResult);
      setDrafted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Drafting failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-labelledby="goals-draft-heading"
      className="rounded-[16px] border border-board-accent/30 bg-board-surface px-6 py-6"
    >
      <h3 id="goals-draft-heading" className="text-lg font-serif text-board-text mb-1">
        Quick start: draft from a sentence
      </h3>
      <p className="text-sm text-board-text-secondary mb-4">
        In your own words, what decision or challenge brought you here? Mention any timeline, budget, or lines you
        won&apos;t cross. We&apos;ll draft the fields below — edit anything that doesn&apos;t sound like you.
      </p>

      <label htmlFor="goals-draft-statement" className="sr-only">
        What decision or challenge brought you here?
      </label>
      <textarea
        id="goals-draft-statement"
        value={statement}
        onChange={(e) => {
          setStatement(e.target.value);
          setError(null);
        }}
        placeholder="I'm weighing whether to leave my director role to start a consultancy within the next six months. I have about a year of savings and won't put the family home at risk…"
        rows={3}
        maxLength={MAX_GOALS_STATEMENT_CHARS}
        className="field-input resize-y"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-3 w-full rounded-[12px] border border-board-accent px-6 py-3 text-sm font-semibold text-board-accent transition-colors hover:bg-board-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Drafting…" : drafted ? "Redraft my goals" : "Draft my goals"}
      </button>
      <p className="mt-2 text-xs text-board-text-tertiary">
        Weaknesses and blind spots are never drafted — only you can name those.
      </p>
    </section>
  );
}
