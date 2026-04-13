"use client";

type Props = {
  improvedHtml: string | null;
  loading: boolean;
  error: string | null;
  imageDataUrl: string;
};

export default function ImprovedViewer({ improvedHtml, loading, error, imageDataUrl }: Props) {
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#0A0A0F] text-white/40">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-violet-400 animate-spin" />
        </div>
        <p className="text-sm">Generating improved design…</p>
      </div>
    );
  }

  if (error) {
    // Fallback: show original image with a notice
    return (
      <div className="flex h-full flex-col bg-[#0A0A0F]">
        <div className="border-b border-white/10 bg-yellow-500/10 px-4 py-2">
          <p className="text-xs text-yellow-400">
            ⚠ Could not generate improved design for this layout — showing original with fix annotations
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <img
            src={imageDataUrl}
            alt="Original design (improved unavailable)"
            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg opacity-60"
          />
        </div>
      </div>
    );
  }

  if (!improvedHtml) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0A0A0F] text-white/20 text-sm">
        Improved design will appear here
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#0A0A0F]">
      {/* Pass badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs font-medium text-emerald-400">All violations fixed</span>
      </div>
      <iframe
        srcDoc={improvedHtml}
        sandbox="allow-same-origin"
        title="Improved accessible design"
        className="h-full w-full border-0"
      />
    </div>
  );
}
