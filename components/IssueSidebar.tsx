"use client";

import { useState } from "react";
import { Violation, WcagLevel, Severity } from "@/lib/types";
import { SEVERITY_COLORS, SEVERITY_ORDER } from "@/lib/wcag";

type Props = {
  violations: Violation[];
  passes: string[];
  activeViolationId: string | null;
  onViolationClick: (id: string) => void;
  wcagTarget: "AA" | "AAA" | "both";
};

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

export default function IssueSidebar({
  violations,
  passes,
  activeViolationId,
  onViolationClick,
  wcagTarget,
}: Props) {
  const [levelFilter, setLevelFilter] = useState<WcagLevel | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [showPasses, setShowPasses] = useState(false);

  const filtered = violations
    .filter((v) => levelFilter === "all" || v.level === levelFilter)
    .filter((v) => severityFilter === "all" || v.severity === severityFilter)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const severityCounts = violations.reduce(
    (acc, v) => ({ ...acc, [v.severity]: (acc[v.severity] || 0) + 1 }),
    {} as Record<string, number>
  );

  return (
    <div className="flex h-full flex-col border-t border-white/10 bg-[#0D0D14]">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Filter</span>

        {/* Level filter */}
        <div className="flex rounded-md border border-white/10 overflow-hidden">
          {(["all", "AA", "AAA"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                levelFilter === l
                  ? "bg-violet-600 text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {l === "all" ? "All levels" : l}
            </button>
          ))}
        </div>

        {/* Severity filter */}
        <div className="flex rounded-md border border-white/10 overflow-hidden">
          {(["all", "critical", "serious", "moderate", "minor"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 text-xs capitalize transition-colors ${
                severityFilter === s
                  ? "bg-violet-600 text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {s === "all" ? "All severity" : s}
              {s !== "all" && severityCounts[s] ? (
                <span className="ml-1 opacity-60">({severityCounts[s]})</span>
              ) : null}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-white/30">
          {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Violation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-white/30">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
              <path d="M10 16l4 4 8-8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm">No issues match current filters</p>
          </div>
        ) : (
          <ul>
            {filtered.map((v, i) => {
              const color = SEVERITY_COLORS[v.severity];
              const isActive = activeViolationId === v.id;
              const originalIndex = violations.findIndex((x) => x.id === v.id);

              return (
                <li key={v.id}>
                  <button
                    onClick={() => onViolationClick(v.id)}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                      isActive ? "bg-violet-500/10 border-l-2 border-l-violet-400" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Number badge */}
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white font-bold"
                        style={{ backgroundColor: color, fontSize: "10px" }}
                      >
                        {originalIndex + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-white/50">{v.wcag_criterion}</span>
                          <span className="text-xs font-medium text-white/80 truncate">{v.wcag_name}</span>
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                            style={{ color, backgroundColor: `${color}20` }}
                          >
                            {v.severity}
                          </span>
                          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-white/40">
                            {v.level}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-white/50 leading-relaxed">{v.description}</p>

                        {isActive && (
                          <div className="mt-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                            <p className="text-xs text-emerald-400 font-medium mb-0.5">Fix</p>
                            <p className="text-xs text-emerald-300/70">{v.fix}</p>
                            {v.original_color && v.suggested_color && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[10px] text-white/40">
                                  <span
                                    className="inline-block h-3 w-3 rounded-sm border border-white/20"
                                    style={{ backgroundColor: v.original_color }}
                                  />
                                  {v.original_color}
                                </span>
                                <span className="text-white/30">→</span>
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                  <span
                                    className="inline-block h-3 w-3 rounded-sm border border-white/20"
                                    style={{ backgroundColor: v.suggested_color }}
                                  />
                                  {v.suggested_color}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Passes section */}
        {passes.length > 0 && (
          <div className="border-t border-white/10">
            <button
              onClick={() => setShowPasses(!showPasses)}
              className="flex w-full items-center justify-between px-4 py-3 text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              <span>{passes.length} criteria passed</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`transition-transform ${showPasses ? "rotate-180" : ""}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {showPasses && (
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {passes.map((p) => (
                  <span
                    key={p}
                    className="flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[10px] font-mono text-emerald-500"
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
