import type { Metadata, Viewport } from "next";
import { Baloo_2, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

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

export const metadata: Metadata = {
  title: {
    default: "Yummmo Learn — Healthy Cooking Courses",
    template: "%s | Yummmo Learn",
  },
  description:
    "Hindi + Hinglish healthy cooking courses. Swad bhi, sehat bhi — learn ingredient swaps that taste amazing.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
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
    <html lang="hi" suppressHydrationWarning>
      <body
        className={`${baloo.variable} ${dmSans.variable} min-h-screen bg-cream font-sans text-charcoal antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
