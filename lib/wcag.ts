export type WcagCriterion = {
  id: string;
  name: string;
  level: "A" | "AA" | "AAA";
  description: string;
  url: string;
};

export const WCAG_CRITERIA: WcagCriterion[] = [
  // Perceivable
  { id: "1.1.1", name: "Non-text Content", level: "A", description: "All non-text content has a text alternative", url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content" },
  { id: "1.3.1", name: "Info and Relationships", level: "A", description: "Information and structure can be programmatically determined", url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships" },
  { id: "1.3.3", name: "Sensory Characteristics", level: "A", description: "Instructions don't rely solely on sensory characteristics", url: "https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics" },
  { id: "1.3.4", name: "Orientation", level: "AA", description: "Content is not restricted to single display orientation", url: "https://www.w3.org/WAI/WCAG22/Understanding/orientation" },
  { id: "1.3.5", name: "Identify Input Purpose", level: "AA", description: "Purpose of input fields can be programmatically determined", url: "https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose" },
  { id: "1.4.1", name: "Use of Color", level: "A", description: "Color is not the only visual means of conveying information", url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color" },
  { id: "1.4.3", name: "Contrast (Minimum)", level: "AA", description: "Text has a contrast ratio of at least 4.5:1", url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum" },
  { id: "1.4.4", name: "Resize Text", level: "AA", description: "Text can be resized up to 200% without loss of content", url: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text" },
  { id: "1.4.5", name: "Images of Text", level: "AA", description: "Text is not presented as images (with exceptions)", url: "https://www.w3.org/WAI/WCAG22/Understanding/images-of-text" },
  { id: "1.4.6", name: "Contrast (Enhanced)", level: "AAA", description: "Text has a contrast ratio of at least 7:1", url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced" },
  { id: "1.4.8", name: "Visual Presentation", level: "AAA", description: "Foreground and background colors can be selected by the user", url: "https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation" },
  { id: "1.4.10", name: "Reflow", level: "AA", description: "Content can be presented without horizontal scrolling at 320px", url: "https://www.w3.org/WAI/WCAG22/Understanding/reflow" },
  { id: "1.4.11", name: "Non-text Contrast", level: "AA", description: "UI components and graphics have 3:1 contrast ratio", url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast" },
  { id: "1.4.12", name: "Text Spacing", level: "AA", description: "No loss of content when text spacing is adjusted", url: "https://www.w3.org/WAI/WCAG22/Understanding/text-spacing" },
  { id: "1.4.13", name: "Content on Hover or Focus", level: "AA", description: "Additional content on hover/focus is dismissible and persistent", url: "https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus" },
  // Operable
  { id: "2.1.1", name: "Keyboard", level: "A", description: "All functionality is operable via keyboard", url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard" },
  { id: "2.4.3", name: "Focus Order", level: "A", description: "Focus order preserves meaning and operability", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order" },
  { id: "2.4.4", name: "Link Purpose", level: "A", description: "The purpose of each link can be determined from context", url: "https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context" },
  { id: "2.4.6", name: "Headings and Labels", level: "AA", description: "Headings and labels describe topic or purpose", url: "https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels" },
  { id: "2.4.7", name: "Focus Visible", level: "AA", description: "Keyboard focus indicator is visible", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible" },
  { id: "2.4.11", name: "Focus Not Obscured (Minimum)", level: "AA", description: "Focused component is not entirely hidden by sticky content", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum" },
  { id: "2.4.12", name: "Focus Not Obscured (Enhanced)", level: "AAA", description: "Focused component is fully visible", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced" },
  { id: "2.4.13", name: "Focus Appearance", level: "AAA", description: "Focus indicator meets minimum size and contrast requirements", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance" },
  { id: "2.5.3", name: "Label in Name", level: "A", description: "Label text is included in accessible name for UI components", url: "https://www.w3.org/WAI/WCAG22/Understanding/label-in-name" },
  { id: "2.5.8", name: "Target Size (Minimum)", level: "AA", description: "Target size is at least 24x24 CSS pixels", url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum" },
  // Understandable
  { id: "3.1.1", name: "Language of Page", level: "A", description: "Default human language of page can be programmatically determined", url: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-page" },
  { id: "3.2.1", name: "On Focus", level: "A", description: "No context change occurs when component receives focus", url: "https://www.w3.org/WAI/WCAG22/Understanding/on-focus" },
  { id: "3.3.1", name: "Error Identification", level: "A", description: "Input errors are identified and described in text", url: "https://www.w3.org/WAI/WCAG22/Understanding/error-identification" },
  { id: "3.3.2", name: "Labels or Instructions", level: "A", description: "Labels or instructions provided for user input", url: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions" },
  // Robust
  { id: "4.1.2", name: "Name, Role, Value", level: "A", description: "All UI components have accessible name, role, and state", url: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value" },
  { id: "4.1.3", name: "Status Messages", level: "AA", description: "Status messages can be determined programmatically", url: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages" },
];

export function getCriterion(id: string): WcagCriterion | undefined {
  return WCAG_CRITERIA.find((c) => c.id === id);
}

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#EF4444",
  serious: "#F97316",
  moderate: "#EAB308",
  minor: "#6B7280",
};

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};
