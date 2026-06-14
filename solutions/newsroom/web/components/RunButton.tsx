"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  endpoint: string;
  body?: Record<string, unknown>;
  idle: string;
  busy: string;
  className?: string;
  /** Optional formatter for the success toast from the JSON response. */
  done?: (data: unknown) => string;
}

/**
 * A button that POSTs to one of the long-running engine routes (run desk, run
 * edition, review, publish), shows progress, then refreshes the page data.
 */
export default function RunButton({
  endpoint,
  body,
  idle,
  busy,
  className,
  done,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setState("busy");
    setMsg(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error ?? "Something went wrong.");
      } else if (done) {
        setMsg(done(data));
      }
      router.refresh();
    } catch {
      setMsg("Network error.");
    } finally {
      setState("idle");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={go}
        disabled={state === "busy"}
        className={
          className ??
          "rounded-md border border-brass-600 bg-brass-600/10 px-3 py-1.5 text-sm font-medium text-brass-400 hover:bg-brass-600/20 disabled:opacity-50"
        }
      >
        {state === "busy" ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brass-400" />
            {busy}
          </span>
        ) : (
          idle
        )}
      </button>
      {msg && <span className="text-xs text-paper-300">{msg}</span>}
    </span>
  );
}
