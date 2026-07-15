import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Only weight 300/400, normal style are actually used anywhere in the app
// (verified against every fontFamily: 'var(--font-dm-serif)' usage) — trimmed
// from 4 weights x 2 styles (8 font files) down to 2.
const cormorant = Cormorant_Garamond({
  variable: "--font-dm-serif",
  weight: ["300", "400"],
  style: ["normal"],
  subsets: ["latin"],
});

const SITE_URL = "https://homereach.site";
const SITE_TITLE = "Home Reach - Essex County, NJ";
const SITE_DESCRIPTION =
  "Home Reach is Essex County's free housing guide. Find affordable programs, listings, and waitlists you qualify for.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Home Reach",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "affordable housing Essex County NJ",
    "Section 8 Newark NJ",
    "low income apartments Essex County",
    "housing assistance New Jersey",
    "affordable housing waitlist NJ",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Home Reach",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-inter" style={{ backgroundColor: '#F7F5F0' }}>
        {children}
      </body>
    </html>
  );
}
