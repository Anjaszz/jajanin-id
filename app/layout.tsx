import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google"; // Import standard fonts
import "./globals.css";
import { Toaster } from "sonner";

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
  title: "YukJajan | Jajan Lokal Jadi Mudah",
  description: "Platform marketplace modern untuk menemukan jajanan favorit dan produk lokal terbaik.",
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
