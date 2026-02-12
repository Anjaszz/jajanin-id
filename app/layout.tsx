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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YukJajan",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "@/components/theme-provider";

import NextTopLoader from 'nextjs-toploader';
import { SWRegistration } from "@/components/sw-registration";
import { InstallPWA } from "@/components/install-pwa";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader 
            color="#2563eb"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2563eb,0 0 5px #2563eb"
          />
          <SWRegistration />
          <InstallPWA />
          {children}
          <Toaster richColors position="top-right" />
          <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}></script>
        </ThemeProvider>
      </body>
    </html>
  );
}
