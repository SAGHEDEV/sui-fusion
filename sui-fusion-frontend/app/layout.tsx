import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import Sidebar from "@/components/sidebar"
import TopBar from "@/components/topbar"


export const metadata: Metadata = {
  title: "SuiFusion - Live Gaming Platform",
  description: "Watch live streams of your favorite gamers",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-background text-foreground glass custom-scrollbar`}>
        <Providers>
          <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar */}
              <TopBar />
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
