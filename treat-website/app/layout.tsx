import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./_components/Nav";
import Footer from "./_components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Treat — AI-Native Cyber Service Management",
  description:
    "Treat aggregates every security request from every channel into a single, risk-prioritized queue. AI agents surface context automatically so your team can focus on decisions, not detective work.",
  keywords: ["cybersecurity", "security operations", "AI security", "ITSM", "SIEM", "SOC", "cyber service management"],
  openGraph: {
    title: "Treat — AI-Native Cyber Service Management",
    description: "Every security request. One unified queue.",
    siteName: "Treat Security",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
