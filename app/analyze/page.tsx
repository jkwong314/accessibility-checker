"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnnotatedViewer from "@/components/AnnotatedViewer";
import ImprovedViewer from "@/components/ImprovedViewer";
import IssueSidebar from "@/components/IssueSidebar";
import { ScanResult, Violation, WcagTarget } from "@/lib/types";
import { saveResult } from "@/lib/storage";

type Phase = "analyzing" | "improving" | "done" | "error" | "pass";

function AnalyzePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [wcagTarget, setWcagTarget] = useState<WcagTarget>("both");

  const [phase, setPhase] = useState<Phase>("analyzing");
  const [statusText, setStatusText] = useState("Analyzing against WCAG 2.2…");
  const [violations, setViolations] = useState<Violation[]>([]);
  const [passes, setPasses] = useState<string[]>([]);
  const [scoreBefore, setScoreBefore] = useState(0);
  const [scoreAfter, setScoreAfter] = useState(0);
  const [improvedHtml, setImprovedHtml] = useState<string | null>(null);
  const [improveError, setImproveError] = useState<string | null>(null);
  const [activeViolationId, setActiveViolationId] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Resizable divider
  const [splitPct, setSplitPct] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const mode = searchParams.get("mode");

    if (mode === "loaded") {
      const raw = sessionStorage.getItem("loaded_result");
      if (raw) {
        const result: ScanResult = JSON.parse(raw);
        setImageDataUrl(result.imageDataUrl);
        setMimeType("image/png");
        setWcagTarget(result.wcag_target);
        setViolations(result.violations);
        setPasses(result.passes);
        setScoreBefore(result.score_before);
        setScoreAfter(result.score_after);
        setImprovedHtml(result.improved_html || null);
        setPhase(result.violations.length === 0 ? "pass" : "done");
        sessionStorage.removeItem("loaded_result");
      }
      return;
    }

    const img = sessionStorage.getItem("pending_image_dataUrl");
    const mime = sessionStorage.getItem("pending_image_mimeType");
    const target = sessionStorage.getItem("pending_wcag_target") as WcagTarget;

    if (!img || !mime) {
      router.replace("/");
      return;
    }

    setImageDataUrl(img);
    setMimeType(mime);
    setWcagTarget(target || "both");

    sessionStorage.removeItem("pending_image_dataUrl");
    sessionStorage.removeItem("pending_image_mimeType");
    sessionStorage.removeItem("pending_wcag_target");

    runAnalysis(img, mime, target || "both");
  }, []);

  async function runAnalysis(img: string, mime: string, target: WcagTarget) {
    // Extract base64 from data URL
    const base64 = img.split(",")[1];

    try {
      setPhase("analyzing");
      setStatusText("Analyzing against WCAG 2.2…");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: mime, wcagTarget: target }),
      });

      if (!analyzeRes.ok) throw new Error("Analysis request failed");

      const analyzeData = await analyzeRes.json();

      if (analyzeData.error && analyzeData.violations?.length === 0) {
        setAnalyzeError(analyzeData.error);
        setPhase("error");
        return;
      }

      setViolations(analyzeData.violations || []);
      setPasses(analyzeData.passes || []);
      setScoreBefore(analyzeData.score_before ?? 0);

      if ((analyzeData.violations || []).length === 0) {
        setScoreAfter(100);
        setPhase("pass");
        saveResult({
          id: Date.now().toString(),
          timestamp: Date.now(),
          imageDataUrl: img,
          violations: [],
          passes: analyzeData.passes || [],
          score_before: analyzeData.score_before ?? 100,
          score_after: 100,
          improved_html: "",
          wcag_target: target,
        });
        return;
      }

      // Phase 2: improve
      setPhase("improving");
      setStatusText("Generating improved design…");

      const improveRes = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mime,
          violations: analyzeData.violations,
        }),
      });

      if (!improveRes.ok) {
        setImproveError("Could not generate improved design");
        setScoreAfter(100);
        setPhase("done");
        return;
      }

      const improveData = await improveRes.json();

      if (improveData.error) {
        setImproveError(improveData.error);
      } else {
        setImprovedHtml(improveData.improved_html || null);
      }

      const sa = improveData.score_after ?? 100;
      setScoreAfter(sa);
      setPhase("done");

      saveResult({
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageDataUrl: img,
        violations: analyzeData.violations || [],
        passes: analyzeData.passes || [],
        score_before: analyzeData.score_before ?? 0,
        score_after: sa,
        improved_html: improveData.improved_html || "",
        wcag_target: target,
      });
    } catch (err) {
      console.error(err);
      setAnalyzeError("Something went wrong. Please try again.");
      setPhase("error");
    }
  }

  // Drag to resize
  function onDividerMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    e.preventDefault();

    function onMouseMove(e: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(80, Math.max(20, pct)));
    }

    function onMouseUp() {
      dragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  // ---- LOADING STATE ----
  if (phase === "analyzing" || phase === "improving") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden">
        {imageDataUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 blur-2xl scale-110"
            style={{ backgroundImage: `url(${imageDataUrl})` }}
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Spinner */}
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/10" />
            <div className="absolute inset-0 rounded-full border-t-2 border-violet-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-t-2 border-violet-300/40 animate-spin" style={{ animationDuration: "0.6s", animationDirection: "reverse" }} />
          </div>

          {/* Steps */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${phase === "analyzing" ? "bg-violet-400 animate-pulse" : "bg-emerald-500"}`} />
              <span className={`text-sm ${phase === "analyzing" ? "text-white/80" : "text-white/30 line-through"}`}>
                Analyzing against WCAG 2.2
              </span>
              {phase === "improving" && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${phase === "improving" ? "bg-violet-400 animate-pulse" : "bg-white/10"}`} />
              <span className={`text-sm ${phase === "improving" ? "text-white/80" : "text-white/30"}`}>
                Generating improved design
              </span>
            </div>
          </div>

          <p className="text-xs text-white/20">This may take 15–30 seconds</p>
        </div>
      </div>
    );
  }

  // ---- ERROR STATE ----
  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0f] px-6 text-center">
        <div className="rounded-full border border-red-500/20 bg-red-500/10 p-5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-red-400">
            <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M14 8v6M14 18v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white/80">Analysis failed</h2>
          <p className="mt-2 text-sm text-white/40">{analyzeError || "Something went wrong."}</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          Try again
        </button>
      </div>
    );
  }

  // ---- PASS STATE ----
  if (phase === "pass") {
    return (
      <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
        <Header
          onBack={() => router.push("/")}
          scoreBefore={scoreBefore}
          scoreAfter={100}
          wcagTarget={wcagTarget}
          violationCount={0}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 p-8">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#10B981" strokeWidth="2"/>
              <path d="M14 24l7 7 13-13" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white/90">Fully accessible!</h2>
            <p className="mt-2 text-sm text-white/40">
              No WCAG 2.2 violations found. This design passes all {passes.length} criteria checked.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            {passes.map((p) => (
              <span key={p} className="rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-xs font-mono text-emerald-500">
                ✓ {p}
              </span>
            ))}
          </div>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/50 transition-colors hover:border-white/20 hover:text-white/70"
          >
            Check another design
          </button>
        </div>
      </div>
    );
  }

  // ---- RESULTS STATE ----
  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f] overflow-hidden">
      <Header
        onBack={() => router.push("/")}
        scoreBefore={scoreBefore}
        scoreAfter={scoreAfter}
        wcagTarget={wcagTarget}
        violationCount={violations.length}
      />

      {/* Split panels */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden" style={{ userSelect: dragging.current ? "none" : "auto" }}>
        {/* Left panel — original */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${splitPct}%` }}>
          <PanelLabel text="Original" badge={`${violations.length} issues`} badgeVariant="error" />
          <div className="flex-1 overflow-auto">
            <AnnotatedViewer
              imageDataUrl={imageDataUrl}
              violations={violations}
              activeViolationId={activeViolationId}
              onViolationClick={setActiveViolationId}
            />
          </div>
        </div>

        {/* Divider */}
        <div
          onMouseDown={onDividerMouseDown}
          className="relative flex w-1 cursor-col-resize flex-col items-center justify-center bg-white/5 hover:bg-violet-500/30 transition-colors group"
        >
          <div className="absolute flex h-8 w-4 flex-col items-center justify-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-violet-400 transition-colors" />
            ))}
          </div>
        </div>

        {/* Right panel — improved */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${100 - splitPct - 0.2}%` }}>
          <PanelLabel text="Improved" badge="All fixes applied" badgeVariant="success" />
          <div className="flex-1 overflow-auto">
            <ImprovedViewer
              improvedHtml={improvedHtml}
              loading={false}
              error={improveError}
              imageDataUrl={imageDataUrl}
            />
          </div>
        </div>
      </div>

      {/* Issue sidebar — bottom */}
      <div className="h-56 shrink-0 border-t border-white/10 overflow-hidden">
        <IssueSidebar
          violations={violations}
          passes={passes}
          activeViolationId={activeViolationId}
          onViolationClick={(id) => setActiveViolationId(activeViolationId === id ? null : id)}
          wcagTarget={wcagTarget}
        />
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 rounded-full border-t-2 border-violet-400 animate-spin" />
      </div>
    }>
      <AnalyzePageInner />
    </Suspense>
  );
}

// ---- Sub-components ----

function Header({
  onBack,
  scoreBefore,
  scoreAfter,
  wcagTarget,
  violationCount,
}: {
  onBack: () => void;
  scoreBefore: number;
  scoreAfter: number;
  wcagTarget: WcagTarget;
  violationCount: number;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0d0d14] px-5 py-3">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/60"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New scan
        </button>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-violet-600">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="white" strokeWidth="1.2"/>
              <path d="M3 5h4M5 3v4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-white/70">accessible</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Violation count */}
        <span className="text-xs text-white/30">
          <span className="text-red-400 font-medium">{violationCount}</span> issue{violationCount !== 1 ? "s" : ""} found
        </span>

        {/* WCAG badge */}
        <span className="rounded border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-mono text-violet-400">
          WCAG 2.2 {wcagTarget.toUpperCase()}
        </span>

        {/* Score */}
        <div className="flex items-center gap-2">
          <ScoreBadge score={scoreBefore} label="Before" />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/20">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <ScoreBadge score={scoreAfter} label="After" highlight />
        </div>
      </div>
    </header>
  );
}

function ScoreBadge({ score, label, highlight }: { score: number; label: string; highlight?: boolean }) {
  const color =
    score >= 90 ? "#10B981" : score >= 70 ? "#EAB308" : score >= 50 ? "#F97316" : "#EF4444";
  return (
    <div className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${highlight ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
      <span className="text-[10px] text-white/30">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function PanelLabel({
  text,
  badge,
  badgeVariant,
}: {
  text: string;
  badge: string;
  badgeVariant: "error" | "success";
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#0d0d14] px-4 py-2">
      <span className="text-xs font-medium text-white/60">{text}</span>
      <span
        className={`rounded px-2 py-0.5 text-[10px] font-medium ${
          badgeVariant === "error"
            ? "border border-red-500/20 bg-red-500/10 text-red-400"
            : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        }`}
      >
        {badge}
      </span>
    </div>
  );
}
