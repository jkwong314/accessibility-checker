# Accessibility Checker — Design Spec
**Date:** 2026-04-13
**Status:** Approved

---

## Overview

A web-based accessibility checker for digital designs. Users upload images or paste directly from Figma. The tool analyzes designs against WCAG 2.2 standards using Claude's vision capabilities and returns a side-by-side view: the original design annotated with failure markers on the left, and an AI-regenerated HTML/CSS improved design on the right.

**Target users:** Both designers (non-technical) and developers running accessibility audits.

---

## Stack

- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS
- **AI:** Claude claude-sonnet-4-6 via `@anthropic-ai/sdk` (server-side only — API key never exposed to browser)
- **Storage:** localStorage only — no database, no auth
- **Deployment:** Vercel

---

## Project Structure

```
app/
  page.tsx                  — upload / landing screen
  analyze/page.tsx          — results screen (side-by-side)
  api/analyze/route.ts      — phase 1: Claude WCAG analysis → structured JSON
  api/improve/route.ts      — phase 2: Claude HTML/CSS regeneration
  layout.tsx
components/
  UploadZone.tsx            — drag & drop + paste handler
  AnnotatedViewer.tsx       — left panel: image + numbered issue markers
  ImprovedViewer.tsx        — right panel: rendered HTML/CSS mockup in iframe
  IssueSidebar.tsx          — WCAG violation list with filters
  ConsentBanner.tsx         — one-time localStorage consent prompt
  HistoryDrawer.tsx         — past scans from localStorage
lib/
  types.ts                  — shared TypeScript types
  wcag.ts                   — WCAG 2.2 criterion metadata
  storage.ts                — localStorage read/write helpers
```

---

## User Flow

### Screen 1 — Upload
- Dark full-screen landing with centered upload zone
- Two equal input methods:
  - Drag & drop / file picker (PNG, JPG, WebP, SVG, max 10MB)
  - Paste zone — Cmd+V anywhere on the page captures clipboard image (works directly from Figma's "Copy as PNG")
- WCAG target toggle in header: `AA` / `AAA` / `Both`
- History icon (top-right) opens HistoryDrawer if consent was granted
- ConsentBanner appears at bottom on first visit

### Screen 2 — Analyzing (loading)
- Uploaded image dimmed in background
- Two-step progress indicator with real-time streamed status text:
  - Step 1: "Analyzing against WCAG 2.2..."
  - Step 2: "Generating improved design..."

### Screen 3 — Results
- 50/50 split layout with a draggable center divider handle (mouse drag to resize panels)
- **Left panel:** Original image with numbered circular markers at violation coordinates. Clicking a marker highlights the corresponding issue in the sidebar.
- **Right panel:** Claude's HTML/CSS recreation rendered in a sandboxed iframe, with green checkmark markers showing resolved issues
- **Bottom sidebar:** Scrollable violation list, filterable by severity (Critical / Serious / Moderate / Minor) and WCAG level (AA / AAA)
- **Header score badge:** Accessibility score before and after (0–100)

---

## Two-Phase API Design

### Phase 1 — `/api/analyze`
- Input: base64 image, wcag_target (`AA` | `AAA` | `both`)
- Sends image to Claude with a structured prompt asking for WCAG 2.2 analysis
- Output: JSON array of `Violation` objects + list of passing criteria + score

### Phase 2 — `/api/improve`
- Input: base64 image + violations array
- Sends image + violation context to Claude, asks for an HTML/CSS recreation with all issues fixed
- Output: HTML string rendered in the right panel iframe

---

## Data Model

```typescript
type Violation = {
  id: string
  wcag_criterion: string        // e.g. "1.4.3"
  wcag_name: string             // e.g. "Contrast (Minimum)"
  level: "AA" | "AAA"
  severity: "critical" | "serious" | "moderate" | "minor"
  location: { x: number; y: number; width: number; height: number } // 0–1 percentages
  description: string           // what is wrong
  fix: string                   // what to change
  original_color?: string       // hex, if color contrast issue
  suggested_color?: string      // hex, corrected value
}

type ScanResult = {
  id: string
  timestamp: number
  imageDataUrl: string          // base64, stored in localStorage
  violations: Violation[]
  passes: string[]              // WCAG criteria that passed
  score_before: number
  score_after: number           // targeted 100; calculated from violations Claude claims to have fixed
  improved_html: string         // Claude's HTML/CSS recreation
  wcag_target: "AA" | "AAA" | "both"
}
```

**Score formula:** `Math.round((passes.length / (passes.length + violations.length)) * 100)`

---

## localStorage & Consent

- On first visit: ConsentBanner appears at bottom — "Save scan history locally in your browser? Nothing leaves your device." with **[Save History]** / **[No thanks]**
- Consent choice stored in localStorage as `accessibility_checker_consent` (strictly necessary — exempt from consent requirements globally)
- If accepted: full `ScanResult` objects stored under `accessibility_checker_history`
- If declined: app is fully functional, no storage, banner never shown again

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Non-image file | Inline error in upload zone, no navigation |
| File > 10MB | Inline error with size limit message |
| Clipboard paste with no image | Toast: "No image found in clipboard" |
| Claude returns malformed JSON | Auto-retry once, then show error screen with "Try again" |
| Claude API timeout (>30s) | Show phase 1 results if available, skip improved design with notice |
| Rate limit | Error screen with retry guidance |
| HTML/CSS output unparseable | Right panel falls back to annotated overlay with fix callouts |
| Very low resolution image | Error: "Image quality too low for reliable analysis" |
| No violations found | Pass screen with 100/100 score and full criteria list — no split view |

---

## Visual Design

- **Aesthetic:** Dark/pro tool — dark background, high contrast UI
- **Tone:** Clinical, precise — feels like a developer/designer tool
- **Accent color:** Violet (`#8B5CF6`) against near-black (`#0A0A0F`) background

---

## Out of Scope

- User accounts or server-side history
- PDF or video input
- Automated fix export (e.g. download corrected Figma file)
- Browser extension or Figma plugin
- Shareable report links
