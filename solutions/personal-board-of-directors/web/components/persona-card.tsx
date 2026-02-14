"use client";

import { useState } from "react";
import type { PersonaProfile, PersonaResponse } from "@/lib/types";
import { RubricChart } from "./rubric-chart";

const ROLE_BADGE_COLORS: Record<string, string> = {
  integrator: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  challenger: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "sense-checker": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

interface PersonaCardProps {
  response: PersonaResponse;
  profile?: PersonaProfile;
  isActive: boolean;
}

export function PersonaCard({ response, profile, isActive }: PersonaCardProps) {
  const [showRubric, setShowRubric] = useState(false);

  const badgeColor =
    ROLE_BADGE_COLORS[profile?.contributionType ?? ""] ??
    "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";

  return (
    <div
      className={`animate-slide-up rounded-lg border bg-board-surface p-5 transition-colors ${
        isActive
          ? "border-board-accent/50 shadow-lg shadow-board-accent/5"
          : "border-board-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {response.personaName}
          </h3>
          {profile && (
            <span
              className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${badgeColor}`}
            >
              {profile.contributionType}
            </span>
          )}
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5 text-xs text-board-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-board-accent animate-pulse" />
            Speaking
          </div>
        )}
        {!isActive && response.isComplete && (
          <div className="text-xs text-board-muted">Complete</div>
        )}
      </div>

      {/* Response content */}
      <div
        className={`text-sm leading-relaxed text-board-text-dim whitespace-pre-wrap ${
          isActive && !response.isComplete ? "streaming-cursor" : ""
        }`}
      >
        {response.content || (
          <span className="text-board-muted italic">Preparing response...</span>
        )}
      </div>

      {/* Rubric toggle */}
      {profile && response.isComplete && (
        <div className="mt-4 border-t border-board-border pt-3">
          <button
            onClick={() => setShowRubric(!showRubric)}
            className="text-xs text-board-muted hover:text-board-text-dim transition-colors"
          >
            {showRubric ? "Hide" : "Show"} judgement profile
          </button>
          {showRubric && (
            <div className="mt-3">
              <RubricChart rubric={profile.rubric} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
