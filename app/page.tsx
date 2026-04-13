"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import ConsentBanner from "@/components/ConsentBanner";
import HistoryDrawer from "@/components/HistoryDrawer";
import { WcagTarget, ScanResult } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [wcagTarget, setWcagTarget] = useState<WcagTarget>("both");
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleImage = useCallback(
    (dataUrl: string, mimeType: string) => {
      // Store image in sessionStorage to pass to analyze page
      sessionStorage.setItem("pending_image_dataUrl", dataUrl);
      sessionStorage.setItem("pending_image_mimeType", mimeType);
      sessionStorage.setItem("pending_wcag_target", wcagTarget);
      router.push("/analyze");
    },
    [router, wcagTarget]
  );

  function handleLoadHistory(result: ScanResult) {
    sessionStorage.setItem("loaded_result", JSON.stringify(result));
    router.push("/analyze?mode=loaded");
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0f]">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5"/>
              <path d="M4 7h6M7 4v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">accessible</span>
          <span className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-400">
            WCAG 2.2
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* WCAG Target toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">Target</span>
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              {(["AA", "AAA", "both"] as WcagTarget[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setWcagTarget(t)}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                    wcagTarget === t
                      ? "bg-violet-600 text-white"
                      : "text-white/40 hover:text-white/60 hover:bg-white/5"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4.5V7l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            History
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16">
        {/* Hero text */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight text-white/90 sm:text-5xl">
            Accessibility{" "}
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              Audit
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/40 leading-relaxed">
            Upload a design or paste from Figma. Get instant WCAG 2.2 analysis with a
            side-by-side improved version.
          </p>

          {/* Feature pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Color contrast", "Touch targets", "Focus indicators", "Text sizing", "ARIA roles"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/40"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <div className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <UploadZone
            onImage={handleImage}
            wcagTarget={wcagTarget}
            onWcagTargetChange={setWcagTarget}
          />
        </div>
      </main>

      {/* History drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleLoadHistory}
      />

      {/* Consent banner */}
      <ConsentBanner />
    </div>
  );
}
