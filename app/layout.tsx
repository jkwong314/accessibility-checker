import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Accessible — WCAG 2.2 Design Checker",
  description:
    "Upload your design or paste from Figma to get an instant WCAG 2.2 accessibility audit with side-by-side before/after comparison.",
  openGraph: {
    title: "Accessible — WCAG 2.2 Design Checker",
    description: "Instant accessibility audits for digital designs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full`}>
      <body className="h-full bg-[#0a0a0f] text-white antialiased" style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}>
        {children}
      </body>
    </html>
  );
}
