import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { PERSONA_COUNT } from "@/lib/personas";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsModal } from "@/components/settings-modal";
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
      className={`${instrumentSerif.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-board-bg text-board-text font-sans antialiased">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:rounded-lg focus:bg-board-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-board-accent-contrast"
          >
            Skip to main content
          </a>
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
              <div className="flex items-center gap-3">
                <span className="text-xs text-board-text-tertiary font-sans">
                  {PERSONA_COUNT} advisors
                </span>
                <SettingsModal />
              </div>
            </div>
          </header>
          <main id="main-content" className="mx-auto max-w-3xl px-6 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
