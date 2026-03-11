"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  MessageCircle, 
  Users, 
  ArrowLeft, 
  Send, 
  Clock,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Settings,
  Star
} from "lucide-react"
import { 
  getIdeaById, 
  getCurrentUser, 
  getUserById,
  getProjectMessages,
  createProjectMessage,
  getProjectMeta,
  updateProjectMeta,
  type Idea,
  type User,
  type ProjectMessage,
  type ProjectStatus
} from "@/lib/store"

const statusConfig: Record<ProjectStatus, { label: string; icon: typeof Clock; color: string }> = {
  planning: { label: 'Planning', icon: Clock, color: 'text-chart-4' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-accent' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-muted-foreground' }
}

export default function ProjectSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [idea, setIdea] = useState<Idea | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<ProjectMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('planning')
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchedIdea = getIdeaById(id)
    const user = getCurrentUser()
    
    setIdea(fetchedIdea || null)
    setCurrentUser(user)
    
    if (fetchedIdea) {
      setMessages(getProjectMessages(fetchedIdea.id))
      const meta = getProjectMeta(fetchedIdea.id)
      if (meta) {
        setProjectStatus(meta.status)
      }
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!currentUser || !idea || !newMessage.trim()) return
    
    const message = createProjectMessage(idea.id, currentUser.id, currentUser.name, newMessage)
    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const handleStatusChange = (newStatus: ProjectStatus) => {
    if (!idea) return
    
    const updates: Partial<{ status: ProjectStatus; startedAt: string; completedAt: string }> = { status: newStatus }
    
    if (newStatus === 'in_progress' && projectStatus === 'planning') {
      updates.startedAt = new Date().toISOString()
    }
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString()
    }
    
    updateProjectMeta(idea.id, updates)
    setProjectStatus(newStatus)
    setToast({ isVisible: true, message: `Project status updated to ${statusConfig[newStatus].label}`, type: "success" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isOwner = currentUser?.id === idea?.postedBy
  const isTeamMember = idea?.teamMembers.includes(currentUser?.id || "")

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Project Not Found</h1>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/browse")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!currentUser || !isTeamMember) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <Users className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Team Members Only</h1>
            <p className="mt-2 text-muted-foreground">
              You need to be a team member to access this project space.
            </p>
            <Button className="mt-4" onClick={() => router.push(`/idea/${id}`)}>
              View Idea Details
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const StatusIcon = statusConfig[projectStatus].icon

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 flex-col pt-16">
        {/* Header */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push(`/idea/${id}`)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">{idea.title}</h1>
                  <p className="text-sm text-muted-foreground">Project Space</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${statusConfig[projectStatus].color} gap-1 bg-secondary`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig[projectStatus].label}
                </Badge>
                {isOwner && (
                  <Select value={projectStatus} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="flex flex-1 flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-3xl space-y-4">
                {messages.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-medium text-foreground">No messages yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Start the conversation with your team!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.userId === currentUser.id
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={`text-sm ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                            {message.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                            <span className="text-sm font-medium text-foreground">{message.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div
                            className={`mt-1 rounded-lg px-3 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-foreground'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-border bg-card p-4">
              <div className="mx-auto max-w-3xl">
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    className="min-h-[44px] resize-none"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden w-72 flex-shrink-0 border-l border-border bg-card lg:block">
            <div className="p-4">
              {/* Team Members */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Team ({idea.teamMembers.length})
                </h3>
                <div className="mt-3 space-y-2">
                  {idea.teamMembers.map((memberId) => {
                    const member = getUserById(memberId)
                    if (!member) return null
                    const isOnlineOwner = memberId === idea.postedBy
                    return (
                      <Link
                        key={memberId}
                        href={`/user/${memberId}`}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-sm text-primary">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium text-foreground">
                            {member.name}
                            {isOnlineOwner && (
                              <Badge variant="outline" className="ml-2 text-xs">Owner</Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-chart-4" />
                            <span className="text-xs text-muted-foreground">
                              {member.reputation.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Links</h3>
                <div className="mt-3 space-y-2">
                  <Link
                    href={`/idea/${id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Idea Details
                  </Link>
                  {isOwner && (
                    <Link
                      href={`/idea/${id}/edit`}
                      className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      Edit Idea
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
