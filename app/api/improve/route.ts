import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ImproveResponse, Violation } from "@/lib/types";

const client = new Anthropic();

function buildImprovePrompt(violations: Violation[]): string {
  const violationList = violations
    .map(
      (v, i) =>
        `${i + 1}. [${v.wcag_criterion} - ${v.wcag_name}] ${v.description}. Fix: ${v.fix}${
          v.suggested_color ? ` Use color: ${v.suggested_color}` : ""
        }`
    )
    .join("\n");

  return `You are an expert UI developer and accessibility specialist.

I'm providing a design image that has the following WCAG 2.2 accessibility violations:

${violationList}

Create a complete HTML/CSS recreation of this design with ALL violations fixed. Requirements:
- Faithfully recreate the visual design and layout from the image
- Fix every violation listed above
- Use semantic HTML5 elements
- Include inline CSS styles (no external stylesheets needed)
- Ensure proper color contrast ratios (minimum 4.5:1 for AA, 7:1 for AAA where applicable)
- Add proper alt text, ARIA labels, and roles
- Ensure touch targets are at least 44x44px
- Use readable font sizes (minimum 16px for body text)
- The HTML should be self-contained and render correctly in a browser iframe

Respond with ONLY the complete HTML document. No explanation. No markdown. Just the raw HTML starting with <!DOCTYPE html>.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, violations } = body as {
      imageBase64: string;
      mimeType: string;
      violations: Violation[];
    };

    if (!imageBase64 || !mimeType || !violations) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
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
              text: buildImprovePrompt(violations),
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Strip markdown code blocks if present
    const improved_html = text
      .replace(/^```html\n?/i, "")
      .replace(/^```\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    if (!improved_html.toLowerCase().includes("<!doctype") && !improved_html.toLowerCase().includes("<html")) {
      return NextResponse.json(
        { error: "Could not generate improved design", improved_html: "", score_after: 0 },
        { status: 500 }
      );
    }

    const score_after = 100;

    const result: ImproveResponse = { improved_html, score_after };
    return NextResponse.json(result);
  } catch (err) {
    console.error("Improve error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
