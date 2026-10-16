
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nilanshu | Personal Biodata",
  description: "Nilanshu's personal portfolio and biodata website.",
  verification: {
    google: "qgH07_mmPN7nmTQV3jA9LvsXX7cFoTT2sHi1p5BgJLI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5367732405267748"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
