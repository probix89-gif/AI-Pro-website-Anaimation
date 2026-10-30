import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anitom AI - AI-Powered Motion Graphics & Visual Design Studio",
  description: "Create stunning animations, infographics, diagrams, and visual content with AI. Animate, design, and export professional motion graphics in minutes.",
  keywords: ["AI animation", "motion graphics", "infographics", "diagrams", "visual design", "AI design tool"],
  authors: [{ name: "Anitom AI" }],
  creator: "Anitom AI",
  publisher: "Anitom AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://anitom-ai.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anitom-ai.vercel.app",
    title: "Anitom AI - AI-Powered Motion Graphics & Visual Design Studio",
    description: "Create stunning animations, infographics, diagrams, and visual content with AI.",
    siteName: "Anitom AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Anitom AI - AI Creative Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anitom AI - AI-Powered Motion Graphics & Visual Design Studio",
    description: "Create stunning animations, infographics, diagrams, and visual content with AI.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
