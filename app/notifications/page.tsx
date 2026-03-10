"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Bell,
  Eye,
  UserPlus,
  FileSignature,
  User as UserIcon,
  CheckCheck,
  Clock,
  ArrowRight
} from "lucide-react"
import { 
  getCurrentUser,
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type User,
  type Notification
} from "@/lib/store"

export default function NotificationsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const loadData = () => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      const userNotifications = getNotificationsForUser(user.id)
      setNotifications(userNotifications)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    loadData()
  }

  const handleMarkAllAsRead = () => {
    if (currentUser) {
      markAllNotificationsAsRead(currentUser.id)
      loadData()
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'join_request':
        return <UserPlus className="h-5 w-5 text-primary" />
      case 'idea_view':
        return <Eye className="h-5 w-5 text-accent" />
      case 'profile_view':
        return <UserIcon className="h-5 w-5 text-chart-4" />
      case 'nda_signed':
        return <FileSignature className="h-5 w-5 text-chart-5" />
      case 'join_accepted':
        return <CheckCheck className="h-5 w-5 text-accent" />
      case 'join_rejected':
        return <UserPlus className="h-5 w-5 text-destructive" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'join_request':
        return (
          <>
            <span className="font-medium text-foreground">{notification.fromUserName}</span>
            {" requested to join "}
            <Link href={`/idea/${notification.ideaId}`} className="font-medium text-primary hover:underline">
              {notification.ideaTitle}
            </Link>
          </>
        )
      case 'idea_view':
        return (
          <>
            <span className="font-medium text-foreground">{notification.fromUserName}</span>
            {" viewed your idea "}
            <Link href={`/idea/${notification.ideaId}`} className="font-medium text-primary hover:underline">
              {notification.ideaTitle}
            </Link>
          </>
        )
      case 'profile_view':
        return (
          <>
            <span className="font-medium text-foreground">{notification.fromUserName}</span>
            {" viewed your profile"}
          </>
        )
      case 'nda_signed':
        return (
          <>
            <span className="font-medium text-foreground">{notification.fromUserName}</span>
            {" signed NDA for "}
            <Link href={`/idea/${notification.ideaId}`} className="font-medium text-primary hover:underline">
              {notification.ideaTitle}
            </Link>
          </>
        )
      case 'join_accepted':
        return (
          <>
            {"Your request to join "}
            <Link href={`/idea/${notification.ideaId}`} className="font-medium text-primary hover:underline">
              {notification.ideaTitle}
            </Link>
            {" was accepted"}
          </>
        )
      case 'join_rejected':
        return (
          <>
            {"Your request to join "}
            <Link href={`/idea/${notification.ideaId}`} className="font-medium text-primary hover:underline">
              {notification.ideaTitle}
            </Link>
            {" was declined"}
          </>
        )
      default:
        return notification.message || "New notification"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-secondary">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">Sign In Required</h1>
            <p className="mt-2 text-muted-foreground">
              You need to sign in to view your notifications.
            </p>
            <Button className="mt-6" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Header */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Notifications List */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {notifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold text-foreground">No notifications yet</h2>
                <p className="mt-2 text-muted-foreground">
                  When someone views your ideas, signs an NDA, or requests to join, you will see it here.
                </p>
                <Link href="/browse">
                  <Button variant="outline" className="mt-6">
                    Browse Ideas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group rounded-lg border bg-card p-4 transition-colors ${
                      notification.read 
                        ? "border-border" 
                        : "border-primary/30 bg-primary/5"
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        notification.read ? "bg-secondary" : "bg-primary/10"
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-secondary text-xs">
                                {notification.fromUserName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm text-muted-foreground">
                              {getNotificationMessage(notification)}
                            </p>
                          </div>
                          {!notification.read && (
                            <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        {notification.message && notification.type === 'join_request' && (
                          <p className="mt-2 rounded-lg bg-secondary/50 p-2 text-sm text-muted-foreground">
                            &ldquo;{notification.message}&rdquo;
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-4">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(notification.createdAt)}
                          </span>
                          
                          {notification.type === 'join_request' && notification.ideaId && (
                            <Link 
                              href="/profile" 
                              className="text-xs text-primary hover:underline"
                            >
                              View requests
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
