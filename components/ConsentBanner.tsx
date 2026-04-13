"use client";

import { useEffect, useState } from "react";
import { hasSeenConsentBanner, setConsent } from "@/lib/storage";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasSeenConsentBanner()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleAccept() {
    setConsent(true);
    setVisible(false);
  }

  function handleDecline() {
    setConsent(false);
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0D0D14]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <p className="text-sm text-white/60">
          <span className="text-white/80">Save scan history locally in your browser?</span>{" "}
          Nothing leaves your device — stored in localStorage only.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleDecline}
            className="rounded-md border border-white/20 px-4 py-2 text-sm text-white/50 transition-colors hover:border-white/40 hover:text-white/70"
          >
            No thanks
          </button>
          <button
            onClick={handleAccept}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Save History
          </button>
        </div>
      </div>
    </div>
  );
}
