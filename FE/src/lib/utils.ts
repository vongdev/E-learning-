import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format time function to convert seconds to MM:SS
export function formatTime(seconds: number) {
  if (seconds < 0 || !Number.isFinite(seconds)) {
    return '00:00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
// Generate random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// Format date
export function formatDate(date: Date | string): string {
  try {
    if (typeof date === 'string') {
      date = new Date(date)
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    console.error('Lỗi khi format date:', error)
    return 'Invalid date'
  }
}

// Format date with time
export function formatDateWithTime(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Deep clone an object
export function deepClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (error) {
    console.error('Lỗi khi clone object:', error)
  return JSON.parse(JSON.stringify(obj))
}
}