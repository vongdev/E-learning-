"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/shared/login-form"
import Image from "next/image"

/**
 * Trang đăng nhập - hiển thị form đăng nhập và chuyển hướng 
 * nếu người dùng đã đăng nhập
 */
export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Nếu người dùng đã đăng nhập, chuyển hướng về trang chủ
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  // Nếu chưa đăng nhập, hiển thị form đăng nhập
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/uth-logo.png"
          alt="UTH University Logo"
          width={180}
          height={60}
          className="mb-4 drop-shadow-md"
          priority
        />
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          E-Learning Platform
        </h1>
        <p className="text-slate-600 font-medium mt-2 text-center">
          Đại học Giao thông Vận tải TP.HCM
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
