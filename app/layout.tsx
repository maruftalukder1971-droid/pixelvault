import "./globals.css";
import Script from "next/script";
import type { Metadata } from "next";
import ScrollOptimizer from "@/components/ScrollOptimizer"; // ✅ added

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PixelVault - Premium HD and 4K Wallpapers", template: "%s | PixelVault" },
  description: "Stunning HD, QHD, and 4K wallpapers for desktop and mobile. Curated daily.",
  keywords: ["wallpapers", "4k wallpapers", "hd wallpapers", "mobile wallpapers", "desktop backgrounds"],
  openGraph: { type: "website", siteName: "PixelVault", url: SITE_URL },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">
        <ScrollOptimizer /> {/* ✅ added here */}

        {ADSENSE_ID ? (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          />
        ) : null}

        {children}
      </body>
    </html>
  );
}
