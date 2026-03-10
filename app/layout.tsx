import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Sportyex — Fan Token Pulse",
  description: "Track which fan tokens are heating up. Powered by match context, whale activity, and community signals.",
  openGraph: {
    title: "Sportyex — Fan Token Pulse",
    description: "Track which fan tokens are heating up. Powered by match context, whale activity, and community signals.",
    siteName: "Sportyex",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased min-h-screen"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <Nav />
        <main className="max-w-5xl mx-auto px-4 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
