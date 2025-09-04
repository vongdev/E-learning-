"use client"

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      active: pathname === '/admin/dashboard',
    },
    {
      label: 'Khóa học',
      icon: BookOpen,
      href: '/admin/courses',
      active: pathname === '/admin/courses',
    },
    {
      label: 'Người dùng',
      icon: Users,
      href: '/admin/users',
      active: pathname === '/admin/users',
    },
    {
      label: 'Bài tập',
      icon: FileText,
      href: '/admin/assignments',
      active: pathname === '/admin/assignments',
    },
    {
      label: 'Thảo luận',
      icon: MessageSquare,
      href: '/admin/discussions',
      active: pathname === '/admin/discussions',
    },
    {
      label: 'Thống kê',
      icon: BarChart3,
      href: '/admin/analytics',
      active: pathname === '/admin/analytics',
    },
    {
      label: 'Cài đặt',
      icon: Settings,
      href: '/admin/settings',
      active: pathname === '/admin/settings',
    }
  ]

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-white border-r shadow-sm dark:bg-slate-900 dark:border-slate-700">
      {/* Logo */}
      <div className="p-4 border-b dark:border-slate-700">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Image 
              src="/uth-logo.png" 
              alt="UTH University" 
              width={40} 
              height={40} 
            />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                EduLearn
              </h1>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 py-4 flex flex-col gap-1 px-2">
        {routes.map((route) => (
          <Link 
            key={route.href} 
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              route.active 
                ? "bg-primary text-primary-foreground" 
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <route.icon className={cn("h-5 w-5", route.active ? "text-primary-foreground" : "text-slate-500 dark:text-slate-400")} />
            {route.label}
          </Link>
        ))}
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t dark:border-slate-700">
        <Button 
          variant="default" 
          className="w-full justify-start gap-2"
          onClick={() => router.push('/admin/create-course')}
        >
          <Plus className="h-4 w-4" />
          Tạo khóa học mới
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 mt-2"
          onClick={() => router.push('/')}
        >
          <Home className="h-4 w-4" />
          Về trang chủ
        </Button>
      </div>
    </div>
  )
}