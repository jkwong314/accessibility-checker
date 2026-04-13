import { ScanResult } from "./types";

const CONSENT_KEY = "accessibility_checker_consent";
const HISTORY_KEY = "accessibility_checker_history";
const MAX_HISTORY = 20;

export function getConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(CONSENT_KEY);
  if (val === null) return null;
  return val === "true";
}

export function setConsent(value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, String(value));
}

export function hasSeenConsentBanner(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(CONSENT_KEY) !== null;
}

export function saveResult(result: ScanResult): void {
  if (typeof window === "undefined") return;
  if (getConsent() !== true) return;

  const history = getHistory();
  const updated = [result, ...history].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage quota exceeded — remove oldest entries and retry
    const trimmed = updated.slice(0, Math.floor(MAX_HISTORY / 2));
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
      // silently fail if storage is unavailable
    }
  }
}

export function getHistory(): ScanResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanResult[];
  } catch {
    return [];
  }
}

export function deleteResult(id: string): void {
  if (typeof window === "undefined") return;
  const history = getHistory().filter((r) => r.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}
