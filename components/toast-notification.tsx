"use client"

import { useEffect } from "react"
import { CheckCircle, X, AlertCircle, Info } from "lucide-react"

interface ToastNotificationProps {
  message: string
  type?: "success" | "error" | "info"
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function ToastNotification({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 4000,
}: ToastNotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-accent" />,
    error: <AlertCircle className="h-5 w-5 text-destructive" />,
    info: <Info className="h-5 w-5 text-primary" />,
  }

  const backgrounds = {
    success: "bg-accent/10 border-accent/20",
    error: "bg-destructive/10 border-destructive/20",
    info: "bg-primary/10 border-primary/20",
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={`flex items-center gap-3 rounded-lg border ${backgrounds[type]} bg-card px-4 py-3 shadow-lg`}>
        {icons[type]}
        <p className="text-sm font-medium text-foreground">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
