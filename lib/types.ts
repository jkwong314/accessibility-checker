export type WcagLevel = "AA" | "AAA";
export type WcagTarget = "AA" | "AAA" | "both";
export type Severity = "critical" | "serious" | "moderate" | "minor";

export type Violation = {
  id: string;
  wcag_criterion: string; // e.g. "1.4.3"
  wcag_name: string; // e.g. "Contrast (Minimum)"
  level: WcagLevel;
  severity: Severity;
  location: { x: number; y: number; width: number; height: number }; // 0–1 percentages
  description: string;
  fix: string;
  original_color?: string;
  suggested_color?: string;
};

export type ScanResult = {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  violations: Violation[];
  passes: string[];
  score_before: number;
  score_after: number;
  improved_html: string;
  wcag_target: WcagTarget;
};

export type AnalyzeResponse = {
  violations: Violation[];
  passes: string[];
  score_before: number;
  error?: string;
};

export type ImproveResponse = {
  improved_html: string;
  score_after: number;
  error?: string;
};
