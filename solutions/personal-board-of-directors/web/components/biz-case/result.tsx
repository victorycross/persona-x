"use client";

import { useState } from "react";
import { useBizCaseContext } from "@/lib/biz-case-context";

export function BizCaseResult() {
  const { narrativeContent, restartSession } = useBizCaseContext();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(narrativeContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-serif text-board-text">
          Your Business Case
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="rounded-lg border border-board-border bg-board-surface px-3 py-1.5 text-xs font-medium text-board-text-secondary transition-colors hover:border-board-accent/40 hover:text-board-text"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={restartSession}
            className="rounded-lg border border-board-border bg-board-surface px-3 py-1.5 text-xs font-medium text-board-text-secondary transition-colors hover:border-board-accent/40 hover:text-board-text"
          >
            Start Over
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-board-border bg-board-surface px-6 py-6">
        <div className="whitespace-pre-wrap font-sans text-sm text-board-text leading-relaxed">
          {narrativeContent}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={restartSession}
          className="text-xs text-board-text-tertiary hover:text-board-text-secondary transition-colors"
        >
          ← Build another business case
        </button>
      </div>
    </div>
  );
}
