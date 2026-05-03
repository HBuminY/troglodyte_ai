import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Navbar } from "@/components/landing/navbar";
import "./globals.css";
import { ThemeSwitcher } from "@/components/theme-switcher";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  title: 'Troglodyte.AI | Yeşil Veri Altyapısı',
  description: "Kapadokya'nın atıl kaya oyma depolarını sıfır soğutma maliyetli Yeşil Veri Merkezlerine dönüştürüyoruz. Atık ısıyı seralara yönlendirerek sanayiciyi karbon vergisinden kurtarıyoruz.",
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  display: "swap",
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${orbitron.variable} ${shareTechMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="pt-20">
            {children}
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeSwitcher />
            </div>
          </main>
        </ThemeProvider>

      </body>
    </html>
  );
}
