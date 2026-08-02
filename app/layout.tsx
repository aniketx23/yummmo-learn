import type { Metadata, Viewport } from "next";
import { Baloo_2, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";

const baloo = Baloo_2({
  subsets: ["latin", "latin-ext"],
  variable: "--font-baloo",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  title: {
    default: "Yummmo Learn — Healthy Cooking Courses",
    template: "%s | Yummmo Learn",
  },
  description:
    "Hindi + Hinglish healthy cooking courses. Swad bhi, sehat bhi — learn ingredient swaps that taste amazing.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Yummmo Learn",
    title: "Yummmo Learn — Healthy Cooking Courses",
    description:
      "Hindi + Hinglish healthy cooking courses. Swad bhi, sehat bhi — learn ingredient swaps that taste amazing.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Yummmo Learn — healthy baking workshops with Akta Mahajan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yummmo Learn — Healthy Cooking Courses",
    description:
      "Hindi + Hinglish healthy cooking courses. Swad bhi, sehat bhi — learn ingredient swaps that taste amazing.",
    images: ["/og-default.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${baloo.variable} ${dmSans.variable} min-h-screen bg-cream font-sans text-charcoal antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </Providers>
      </body>
    </html>
  );
}
