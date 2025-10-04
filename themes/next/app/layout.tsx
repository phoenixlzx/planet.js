import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { loadPlanetData } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

let siteMetadata: Metadata = {
  title: "Planet",
  description: "A planet news reader.",
};

let htmlLocale = "en";

try {
  const data = loadPlanetData();
  siteMetadata = {
    title: data.site.name ?? siteMetadata.title,
    description: data.site.description ?? siteMetadata.description,
  };
  if (data.site.locale) {
    htmlLocale = data.site.locale;
  }
} catch {
  // ignore when data is not yet generated
}

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={htmlLocale} className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
