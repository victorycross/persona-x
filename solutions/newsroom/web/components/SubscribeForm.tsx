"use client";

import { useState } from "react";

/** Public subscribe form on a newsroom's read page. */
export default function SubscribeForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setMsg(null);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, email: email.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setState("done");
      setMsg("You're subscribed. New editions will arrive in your inbox.");
    } else {
      setState("error");
      setMsg(data?.error ?? "Could not subscribe.");
    }
  }

  if (state === "done") {
    return <p className="text-sm text-brass-400">{msg}</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="min-w-0 flex-1 rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm"
      />
      <button
        disabled={state === "busy"}
        className="rounded-md border border-brass-600 bg-brass-600/10 px-3 py-2 text-sm font-medium text-brass-400 hover:bg-brass-600/20 disabled:opacity-50"
      >
        {state === "busy" ? "Subscribing…" : "Subscribe"}
      </button>
      {msg && state === "error" && (
        <span className="w-full text-xs text-red-400">{msg}</span>
      )}
    </form>
  );
}
