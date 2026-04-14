import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { AnalyzeResponse, Violation, WcagTarget } from "@/lib/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert accessibility auditor specializing in WCAG 2.2 compliance for digital designs.
Analyze the provided design image and identify all accessibility violations.
You must respond with ONLY valid JSON — no markdown, no explanation, no code blocks.`;

function buildAnalyzePrompt(wcagTarget: WcagTarget): string {
  const levelFilter =
    wcagTarget === "AA"
      ? "Focus on WCAG 2.2 Level A and AA criteria only."
      : wcagTarget === "AAA"
      ? "Focus on WCAG 2.2 Level A, AA, and AAA criteria."
      : "Cover all WCAG 2.2 Level A, AA, and AAA criteria.";

  return `Analyze this design image for WCAG 2.2 accessibility violations. ${levelFilter}

For each violation found, provide precise location coordinates as percentages (0.0 to 1.0) of the image dimensions.

Return a JSON object with this exact structure:
{
  "violations": [
    {
      "id": "unique-string-id",
      "wcag_criterion": "1.4.3",
      "wcag_name": "Contrast (Minimum)",
      "level": "AA",
      "severity": "critical",
      "location": { "x": 0.1, "y": 0.2, "width": 0.3, "height": 0.05 },
      "description": "Clear description of what is failing and why",
      "fix": "Specific actionable fix recommendation",
      "original_color": "#AAAAAA",
      "suggested_color": "#767676"
    }
  ],
  "passes": ["1.1.1", "2.1.1"],
  "summary": "Brief overall assessment"
}

Severity levels: "critical" (blocks all users), "serious" (major barrier), "moderate" (significant difficulty), "minor" (minor annoyance).
Be thorough but precise. Only report actual violations you can see in the image.
If the image is too low resolution or not a UI design, set violations to [] and add an "error" field.`;
}

async function callClaude(imageBase64: string, mimeType: string, wcagTarget: WcagTarget): Promise<AnalyzeResponse> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: buildAnalyzePrompt(wcagTarget),
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Strip markdown code blocks if present
  const cleaned = text.replace(/^```json\n?/i, "").replace(/\n?```$/i, "").trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.error) {
    return { violations: [], passes: [], score_before: 100, error: parsed.error };
  }

  const violations: Violation[] = (parsed.violations || []).map((v: Violation, i: number) => ({
    ...v,
    id: v.id || `violation-${i}`,
  }));

  const passes: string[] = parsed.passes || [];
  const total = violations.length + passes.length;
  const score_before = total === 0 ? 100 : Math.round((passes.length / total) * 100);

  return { violations, passes, score_before };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, wcagTarget } = body as {
      imageBase64: string;
      mimeType: string;
      wcagTarget: WcagTarget;
    };

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing imageBase64 or mimeType" }, { status: 400 });
    }

    let result: AnalyzeResponse;
    try {
      result = await callClaude(imageBase64, mimeType, wcagTarget || "both");
    } catch (err) {
      // Retry once on parse failure
      try {
        result = await callClaude(imageBase64, mimeType, wcagTarget || "both");
      } catch {
        return NextResponse.json(
          { error: "Analysis failed after retry. Please try again.", violations: [], passes: [], score_before: 0 },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
