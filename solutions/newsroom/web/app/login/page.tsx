"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setState("error");
    } else {
      setState("sent");
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h2 className="font-serif text-2xl text-paper-50">Editor sign-in</h2>
      <p className="mt-1 text-sm text-paper-300">
        We&apos;ll email you a one-time link to the editor&apos;s desk.
      </p>

      {state === "sent" ? (
        <p className="mt-6 rounded-md border border-brass-600/50 bg-brass-600/10 p-4 text-sm text-brass-300">
          Check your inbox — a sign-in link is on its way to{" "}
          <span className="font-medium">{email}</span>.
        </p>
      ) : (
        <form onSubmit={sendLink} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm"
          />
          <button
            disabled={state === "sending"}
            className="w-full rounded-md border border-brass-600 bg-brass-600/10 px-3 py-2 text-sm font-medium text-brass-400 hover:bg-brass-600/20 disabled:opacity-50"
          >
            {state === "sending" ? "Sending…" : "Email me a link"}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
