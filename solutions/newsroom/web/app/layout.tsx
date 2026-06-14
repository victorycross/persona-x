import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Newsroom",
  description: "Run your own AI research desk.",
};

const NAV = [
  { href: "/", label: "Front Page" },
  { href: "/newsroom", label: "The Newsroom" },
  { href: "/wire", label: "The Wire" },
  { href: "/editions", label: "Editions" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans">
        <header className="border-b border-ink-700 bg-ink-900/60 backdrop-blur">
          <div className="mx-auto max-w-5xl px-5 pt-6 pb-3">
            <div className="flex items-baseline justify-between">
              <Link href="/" className="group">
                <h1 className="font-serif text-3xl tracking-tight text-paper-50">
                  The Newsroom
                </h1>
                <p className="text-xs uppercase tracking-[0.3em] text-brass-600 group-hover:text-brass-400">
                  Run your own research desk
                </p>
              </Link>
              <span className="hidden text-[11px] uppercase tracking-widest text-paper-500 sm:block">
                Drafts for human sign-off
              </span>
            </div>
            <nav className="mt-4 flex gap-6 border-t border-ink-800 pt-3 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-paper-300 hover:text-paper-50"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-5 pb-10 pt-6 text-xs text-paper-500">
          The Newsroom · editions are drafts until the Editor-in-Chief signs off.
        </footer>
      </body>
    </html>
  );
}
