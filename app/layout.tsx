import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Geist } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "TruthKeeper – Check the News. Store the Proof. Forever on Filecoin.",
  description:
    "TruthKeeper is an AI-powered fact-checker that verifies news articles and permanently stores the verdict on Filecoin — immutable, timestamped, shareable.",
  generator: "v0.app",
}

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${geist.variable} antialiased dark`}>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
