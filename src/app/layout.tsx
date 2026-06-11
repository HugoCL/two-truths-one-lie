import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Two Truths, One Lie",
  description: "A real-time party game — spot the lie!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} dark h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden bg-zinc-950 text-zinc-50">
        {/* Atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
        >
          <div className="absolute -top-40 left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-amber-500/[0.13] blur-[140px]" />
          <div className="absolute -bottom-48 -left-40 h-[28rem] w-[28rem] rounded-full bg-rose-500/[0.08] blur-[120px]" />
          <div className="absolute -right-40 top-1/3 h-[26rem] w-[26rem] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
          <div className="bg-grain absolute inset-0 opacity-[0.35]" />
        </div>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
