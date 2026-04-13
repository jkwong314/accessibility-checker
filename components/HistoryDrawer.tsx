"use client";

import { useEffect, useState } from "react";
import { ScanResult } from "@/lib/types";
import { getHistory, deleteResult, getConsent } from "@/lib/storage";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoad: (result: ScanResult) => void;
};

export default function HistoryDrawer({ open, onClose, onLoad }: Props) {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (open) {
      setHasConsent(getConsent() === true);
      setHistory(getHistory());
    }
  }, [open]);

  function handleDelete(id: string) {
    deleteResult(id);
    setHistory(getHistory());
  }

  function formatDate(ts: number) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(ts));
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col border-l border-white/10 bg-[#0D0D14] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white/80">Scan History</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!hasConsent ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
              <div className="rounded-full bg-white/5 p-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/20">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-sm text-white/40">History is disabled.</p>
              <p className="text-xs text-white/25">Accept the consent banner to save scans locally.</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
              <p className="text-sm text-white/40">No scans yet.</p>
              <p className="text-xs text-white/25">Your completed scans will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {history.map((result) => (
                <li key={result.id} className="group flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03]">
                  {/* Thumbnail */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/10">
                    <img
                      src={result.imageDataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30">{formatDate(result.timestamp)}</span>
                      <span className="rounded border border-white/10 px-1 py-0.5 text-[10px] font-mono text-white/30">
                        {result.wcag_target}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-white/70">
                        {result.violations.length} issues
                      </span>
                      <span className="text-white/20">·</span>
                      <span className="text-xs text-white/40">
                        Score: {result.score_before}
                        <span className="text-emerald-500"> → {result.score_after}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { onLoad(result); onClose(); }}
                      className="rounded bg-violet-600/20 px-2 py-1 text-[10px] text-violet-400 hover:bg-violet-600/40 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(result.id)}
                      className="rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
