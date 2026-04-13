"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WcagTarget } from "@/lib/types";

type Props = {
  onImage: (dataUrl: string, mimeType: string) => void;
  wcagTarget: WcagTarget;
  onWcagTargetChange: (t: WcagTarget) => void;
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export default function UploadZone({ onImage, wcagTarget, onWcagTargetChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Please upload a PNG, JPG, WebP, or SVG.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File is too large. Maximum size is 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImage(dataUrl, file.type);
      };
      reader.readAsDataURL(file);
    },
    [onImage]
  );

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            return;
          }
        }
      }
      showToast("No image found in clipboard");
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFile]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full cursor-pointer rounded-2xl border-2 transition-all duration-200 ${
          dragging
            ? "border-violet-400 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.2)]"
            : "border-white/10 bg-white/[0.02] hover:border-violet-500/50 hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          className="sr-only"
        />
        <div className="flex flex-col items-center justify-center gap-5 px-8 py-16">
          {/* Icon */}
          <div className={`rounded-2xl p-4 transition-colors ${dragging ? "bg-violet-500/20" : "bg-white/5"}`}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={dragging ? "text-violet-400" : "text-white/30"}>
              <path d="M20 8v16M13 15l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 28h24M8 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </div>

          <div className="text-center">
            <p className="text-lg font-medium text-white/80">
              {dragging ? "Drop to analyze" : "Drop your design here"}
            </p>
            <p className="mt-1 text-sm text-white/40">
              PNG, JPG, WebP, SVG up to 10MB
            </p>
          </div>

          <div className="flex items-center gap-4 w-full max-w-xs">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30 font-mono">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
              <p className="text-sm text-white/60">
                Press{" "}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-white/80">⌘V</kbd>
                {" "}to paste from Figma or clipboard
              </p>
            </div>
            <p className="text-xs text-white/30">Copy any frame in Figma → paste here</p>
          </div>
        </div>

        {/* Subtle corner accents */}
        <span className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-violet-500/30 rounded-tl-sm" />
        <span className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-violet-500/30 rounded-tr-sm" />
        <span className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-violet-500/30 rounded-bl-sm" />
        <span className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-violet-500/30 rounded-br-sm" />
      </div>

      {/* Error */}
      {error && (
        <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-lg border border-white/10 bg-[#1A1A2E] px-4 py-2 text-sm text-white/70 shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
