import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "@/components/header"
import { NetworkInfo } from "@/components/network-info"
import { Footer } from "@/components/footer"
import { NetworkProvider } from "@/contexts/network-context"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "0rca Explorer Cronos",
  description: "Explore AI Agents on-chain",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <NetworkProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
            <NetworkInfo />
            {children}
            <Footer />
          </Suspense>
        </NetworkProvider>
        <Analytics />
      </body>
    </html>
  )
}
