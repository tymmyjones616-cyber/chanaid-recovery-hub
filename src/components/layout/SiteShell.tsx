import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingButtons } from "./FloatingButtons";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Ambient gradient orbs — drift slowly behind everything for a premium feel */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 h-[42rem] w-[42rem] rounded-full opacity-40 blur-3xl animate-orb-drift"
          style={{ background: "radial-gradient(circle, oklch(0.85 0.12 240 / 0.55), transparent 60%)" }}
        />
        <div
          className="absolute top-[40%] -right-40 h-[38rem] w-[38rem] rounded-full opacity-50 blur-3xl animate-orb-drift-rev"
          style={{ background: "radial-gradient(circle, oklch(0.8 0.16 330 / 0.55), transparent 60%)" }}
        />
        <div
          className="absolute bottom-[-12rem] left-[20%] h-[34rem] w-[34rem] rounded-full opacity-35 blur-3xl animate-orb-drift"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.2 320 / 0.45), transparent 60%)" }}
        />
      </div>

      <Header />
      <main className="flex-1 animate-page-in">{children}</main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}