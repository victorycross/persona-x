"use client";

import { useState, useRef } from "react";
import {
  IMPORT_GUIDES,
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_TEXT_CHARS,
  type ImportSource,
  type ProfileImportResult,
} from "@/lib/profile-import";

type ImportMode = "pdf" | "paste";

const SOURCE_OPTIONS: { value: ImportSource; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "resume", label: "Résumé / CV" },
];

const MODE_OPTIONS: { value: ImportMode; label: string }[] = [
  { value: "pdf", label: "Upload PDF" },
  { value: "paste", label: "Paste text" },
];

export function ProfileImport({
  onImported,
}: {
  onImported: (result: ProfileImportResult) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [source, setSource] = useState<ImportSource>("linkedin");
  const [mode, setMode] = useState<ImportMode>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedFrom, setImportedFrom] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const guide = IMPORT_GUIDES[source];
  const steps = mode === "pdf" ? guide.pdfSteps : guide.pasteSteps;
  const canSubmit = !loading && (mode === "pdf" ? !!file : text.trim().length > 0);

  const handleFile = (f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type && f.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      setFile(null);
      return;
    }
    if (f.size > MAX_IMPORT_FILE_BYTES) {
      setError("That file is larger than 2 MB. Please choose a smaller PDF or paste the text instead.");
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("source", source);
      if (mode === "pdf" && file) form.append("file", file);
      else form.append("text", text);

      const res = await fetch("/api/board/profile/import", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.profile) {
        throw new Error(data.error ?? "Import failed. Please try again.");
      }
      onImported(data.profile as ProfileImportResult);
      setImportedFrom(guide.title);
      setExpanded(false);
      setFile(null);
      setText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[16px] border border-board-border bg-board-surface px-6 py-4">
        <p className="text-sm text-board-text-secondary">
          {importedFrom ? (
            <>
              Imported from your {importedFrom}. Fields marked{" "}
              <span className="font-medium text-board-accent">Suggested</span> need your review.
            </>
          ) : (
            "Import your background from LinkedIn or a résumé."
          )}
        </p>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex-shrink-0 text-xs font-medium text-board-accent hover:underline"
        >
          {importedFrom ? "Import again" : "Show"}
        </button>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="profile-import-heading"
      className="rounded-[16px] border border-board-accent/30 bg-board-surface px-6 py-6"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 id="profile-import-heading" className="text-lg font-serif text-board-text">
          Quick start: import your background
        </h3>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex-shrink-0 text-xs text-board-text-tertiary hover:text-board-text-secondary"
        >
          Skip — I&apos;ll type it
        </button>
      </div>
      <p className="text-sm text-board-text-secondary mb-5">
        We&apos;ll pre-fill the fields below for you to review. Nothing is stored on our servers, and your judgement
        profile still comes from the assessment, not your CV.
      </p>

      <div className="space-y-4">
        <ChoiceRow label="Import from" options={SOURCE_OPTIONS} value={source} onChange={(v) => { setSource(v); setError(null); }} />
        <ChoiceRow label="Method" options={MODE_OPTIONS} value={mode} onChange={(v) => { setMode(v); setError(null); }} />

        <div className="rounded-[12px] bg-board-bg border border-board-border px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-board-text-tertiary mb-2">
            How to get your {guide.title}
          </p>
          {mode === "pdf" && <p className="text-xs text-board-text-secondary mb-3">{guide.summary}</p>}
          <ol className="space-y-1.5 text-sm text-board-text list-decimal pl-5">
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <ul className="mt-3 space-y-1 text-xs text-board-text-tertiary">
            {guide.tips.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>

        {mode === "pdf" ? (
          <div>
            <label
              htmlFor="profile-import-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border border-dashed border-board-border px-4 py-6 text-center transition-colors hover:border-board-accent/50"
            >
              <span className="text-sm font-medium text-board-text">
                {file ? file.name : "Choose a PDF"}
              </span>
              <span className="text-xs text-board-text-tertiary">
                {file ? `${(file.size / 1024).toFixed(0)} KB — click to change` : "PDF only, 2 MB maximum"}
              </span>
            </label>
            <input
              ref={fileInputRef}
              id="profile-import-file"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="profile-import-text" className="sr-only">
              Paste your {guide.title} text
            </label>
            <textarea
              id="profile-import-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              placeholder={`Paste your ${guide.title} text here…`}
              rows={6}
              maxLength={MAX_IMPORT_TEXT_CHARS}
              className="field-input resize-y"
            />
            <p className="mt-1 text-right text-[11px] text-board-text-tertiary">
              {text.length.toLocaleString("en-AU")} / {MAX_IMPORT_TEXT_CHARS.toLocaleString("en-AU")}
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-[12px] border border-board-accent px-6 py-3 text-sm font-semibold text-board-accent transition-colors hover:bg-board-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Reading your profile…" : "Import and pre-fill"}
        </button>
      </div>
    </section>
  );
}

function ChoiceRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-24 flex-shrink-0 text-xs text-board-text-tertiary">{label}</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? "border-board-accent bg-board-accent/10 text-board-accent"
              : "border-board-border text-board-text-secondary hover:border-board-accent/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
