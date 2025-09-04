"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
  Bell,
  Shield,
  LayoutDashboard,
} from "lucide-react";

export function AdminHeader() {
  const { user, userName, userAvatarUrl, logout, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // Lấy tên viết tắt cho avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() + 
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  // Hiển thị skeleton khi đang tải
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị button đăng nhập
  if (!user) {
    return (
      <Button
        onClick={() => router.push("/auth/login")}
        variant="outline"
        className="gap-2"
      >
        <UserIcon className="h-4 w-4" />
        <span>Đăng nhập</span>
      </Button>
    );
  }

  // Sử dụng userName từ context
  const displayName = userName || "Admin";

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 text-slate-600" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
      </Button>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 hover:bg-slate-100"
          >
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarImage src={userAvatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700">
              {displayName.split(" ")[0]}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/admin/dashboard")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Thông tin cá nhân</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Xem trang chính</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}