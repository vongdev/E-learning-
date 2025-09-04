import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans", // Đổi tên để phù hợp với CSS
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono", // Đổi tên để phù hợp với CSS
})

// Cấu hình metadata đầy đủ hơn
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

// Thêm cấu hình viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans min-h-screen bg-background text-foreground">
        <ThemeProvider defaultTheme="light" storageKey="edulearn-theme">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}