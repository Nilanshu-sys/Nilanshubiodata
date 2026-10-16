import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}