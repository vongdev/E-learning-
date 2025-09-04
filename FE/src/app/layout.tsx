"use client"

import { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { useState } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    template: "%s | EduLearn Platform",
    default: "EduLearn Platform - E-Learning Interactive"
  },
  description: "Nền tảng học trực tuyến tương tác với video lectures, quiz, breakout rooms và gamification",
  keywords: ["e-learning", "education", "online courses", "university", "UTH", "interactive learning"],
  authors: [{ name: "UTH University" }],
  creator: "UTH University",
  publisher: "UTH University",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Cho phép zoom để đảm bảo accessibility
  userScalable: true, // Cho phép người dùng zoom để đảm bảo accessibility
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Tạo client instance một lần cho mỗi lần mount component
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        cacheTime: 1000 * 60 * 30, // 30 minutes
      },
    },
  }));

  return (
    <html 
      lang="vi" 
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans min-h-screen bg-background text-foreground">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="edulearn-theme">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}