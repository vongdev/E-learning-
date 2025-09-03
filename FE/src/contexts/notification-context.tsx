"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { X } from "lucide-react"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number // milliseconds
  autoClose?: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification = {
      id,
      ...notification,
      duration: notification.duration || 5000,
      autoClose: notification.autoClose !== false,
    }
    setNotifications((prev) => [...prev, newNotification])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Handle auto close
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    notifications.forEach((notification) => {
      if (notification.autoClose) {
        const timer = setTimeout(() => {
          removeNotification(notification.id)
        }, notification.duration)
        
        timers.push(timer)
      }
    })
    
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [notifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

function NotificationContainer() {
  const context = useContext(NotificationContext)
  if (!context) return null

  const { notifications, removeNotification } = context

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border transition-all transform animate-slide-in-right
            ${notification.type === "success" ? "bg-green-50 border-green-200" : ""}
            ${notification.type === "error" ? "bg-red-50 border-red-200" : ""}
            ${notification.type === "warning" ? "bg-yellow-50 border-yellow-200" : ""}
            ${notification.type === "info" ? "bg-blue-50 border-blue-200" : ""}
          `}
        >
          <div className="flex justify-between items-start">
            <div>
              {notification.title && (
                <h5 className={`font-medium text-sm
                  ${notification.type === "success" ? "text-green-800" : ""}
                  ${notification.type === "error" ? "text-red-800" : ""}
                  ${notification.type === "warning" ? "text-yellow-800" : ""}
                  ${notification.type === "info" ? "text-blue-800" : ""}
                `}>
                  {notification.title}
                </h5>
              )}
              <p className={`text-sm
                ${notification.type === "success" ? "text-green-700" : ""}
                ${notification.type === "error" ? "text-red-700" : ""}
                ${notification.type === "warning" ? "text-yellow-700" : ""}
                ${notification.type === "info" ? "text-blue-700" : ""}
              `}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}