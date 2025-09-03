"use client"

import { useNotification } from "@/contexts/notification-context"
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"

export function NotificationSystem() {
  const { notifications, removeNotification } = useNotification()

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
          <div className="flex items-start gap-3">
            {notification.type === "success" && (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            )}
            {notification.type === "warning" && (
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            )}
            {notification.type === "info" && (
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              {notification.title && (
                <h5 className={`font-medium text-sm mb-1
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
              className={`text-gray-400 hover:text-gray-600 rounded-full p-0.5 hover:bg-gray-100 flex-shrink-0`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}