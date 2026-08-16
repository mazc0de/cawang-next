import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-archivo-black",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

import { Providers } from './providers';

export const viewport: Viewport = {
  themeColor: "#ffd23f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "CAWANG — Catat Keuangan Pribadi",
    template: "%s | CAWANG",
  },
  description:
    "Aplikasi pencatatan keuangan pribadi modern dengan siklus keuangan fleksibel, budgeting wizard, visualisasi arus kas, dan pelacakan transaksi rutin.",
  keywords: [
    "CAWANG",
    "catat keuangan",
    "keuangan pribadi",
    "personal finance",
    "budgeting wizard",
    "financial cycle",
    "arus kas",
    "manajer uang",
    "transaksi rutin",
    "catatan pengeluaran",
  ],
  authors: [{ name: "CAWANG Team" }],
  creator: "CAWANG",
  publisher: "CAWANG",
  applicationName: "CAWANG",
  metadataBase: new URL("https://cawang.app"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CAWANG",
  },
  openGraph: {
    title: "CAWANG — Catat Keuangan Pribadi",
    description:
      "Kendalikan keuangan dengan percaya diri. Dashboard keuangan personal modern untuk mencatat transaksi, merencanakan budget, dan memproyeksikan arus kas.",
    url: "https://cawang.app",
    siteName: "CAWANG",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "CAWANG Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAWANG — Catat Keuangan Pribadi",
    description:
      "Kendalikan keuangan dengan percaya diri. Catat transaksi, kelola budget, dan pantau keuangan Anda secara cerdas.",
    images: ["/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${archivoBlack.variable} ${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased font-space-grotesk font-medium`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
