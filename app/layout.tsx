import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google"; // Import standard fonts
import "./globals.css";

// Configure Outfit for Headings and modern accents
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Configure Inter for Body text for readability
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaaS Marketplace | Platform Jual Beli Modern",
  description: "Platform marketplace multi-tenant lengkap untuk penjual dan pembeli.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
