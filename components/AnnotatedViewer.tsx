"use client";

import { useRef, useState } from "react";
import { Violation } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/wcag";

type Props = {
  imageDataUrl: string;
  violations: Violation[];
  activeViolationId: string | null;
  onViolationClick: (id: string) => void;
};

export default function AnnotatedViewer({
  imageDataUrl,
  violations,
  activeViolationId,
  onViolationClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const [imgRendered, setImgRendered] = useState({ w: 0, h: 0, top: 0, left: 0 });

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    updateRenderedSize(img);
  }

  function updateRenderedSize(img: HTMLImageElement) {
    const rect = img.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    setImgRendered({
      w: rect.width,
      h: rect.height,
      top: rect.top - containerRect.top,
      left: rect.left - containerRect.left,
    });
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-auto bg-[#0A0A0F]">
      {/* Image */}
      <div className="relative inline-block min-w-full min-h-full flex items-center justify-center p-4">
        <div className="relative inline-block">
          <img
            src={imageDataUrl}
            alt="Original design"
            onLoad={handleImageLoad}
            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg"
            style={{ display: "block" }}
          />

          {/* Violation markers */}
          {imgRendered.w > 0 &&
            violations.map((v, i) => {
              const x = v.location.x * imgRendered.w + imgRendered.left;
              const y = v.location.y * imgRendered.h + imgRendered.top;
              const isActive = activeViolationId === v.id;
              const color = SEVERITY_COLORS[v.severity] || "#8B5CF6";

              return (
                <button
                  key={v.id}
                  onClick={() => onViolationClick(v.id)}
                  title={`${v.wcag_criterion}: ${v.description}`}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    transform: "translate(-50%, -50%)",
                    zIndex: isActive ? 20 : 10,
                  }}
                  className="group focus:outline-none"
                >
                  {/* Pulse ring */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-75"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  {/* Marker circle */}
                  <span
                    className="relative flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-125"
                    style={{
                      backgroundColor: color,
                      border: isActive ? "2px solid white" : "2px solid rgba(255,255,255,0.3)",
                      fontSize: "10px",
                    }}
                  >
                    {i + 1}
                  </span>
                </button>
              );
            })}

          {/* Bounding box highlight for active violation */}
          {imgRendered.w > 0 &&
            violations.map((v) => {
              if (activeViolationId !== v.id) return null;
              const color = SEVERITY_COLORS[v.severity] || "#8B5CF6";
              return (
                <div
                  key={`box-${v.id}`}
                  className="absolute pointer-events-none rounded"
                  style={{
                    left: v.location.x * imgRendered.w + imgRendered.left,
                    top: v.location.y * imgRendered.h + imgRendered.top,
                    width: v.location.width * imgRendered.w,
                    height: v.location.height * imgRendered.h,
                    border: `2px solid ${color}`,
                    backgroundColor: `${color}15`,
                    zIndex: 15,
                  }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
