import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { PERSONA_COUNT } from "@/lib/personas";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Board of Directors",
  description: "Multi-perspective AI advisory for life's important decisions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${instrumentSerif.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen bg-board-bg text-board-text font-sans antialiased">
        <header className="border-b border-board-border px-6 py-5">
          <div className="mx-auto max-w-3xl flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif text-board-text tracking-tight">
                Personal Board of Directors
              </h1>
              <p className="text-xs text-board-text-secondary mt-0.5 font-sans">
                Structured multi-perspective counsel for important decisions
              </p>
            </div>
            <div className="text-xs text-board-text-tertiary font-sans">
              {PERSONA_COUNT} advisors
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
