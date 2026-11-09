import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Laminar traces stop after the first turn on Claude Agent SDK 0.3.304+",
  description:
    "The Claude Code proxy cannot parse the tool_addition block, so later model turns and tool calls never reach Laminar. A repro with no API key, the version window and two workarounds with their cost.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
