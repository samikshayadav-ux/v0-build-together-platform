"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Star,
  Plus,
  FileText,
  ListTodo,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Crown,
  Eye,
  UserMinus,
  Circle,
  ArrowUpRight
} from "lucide-react"
import { 
  getIdeaById, 
  getCurrentUser, 
  getUserById,
  getProjectMessages,
  createProjectMessage,
  getProjectMeta,
  updateProjectMeta,
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  getProjectNotes,
  createProjectNote,
  deleteProjectNote,
  getMemberRole,
  setProjectMember,
  removeProjectMember,
  parseMentions,
  type Idea,
  type User,
  type ProjectMessage,
  type ProjectStatus,
  type ProjectTask,
  type ProjectNote,
  type TaskStatus,
  type TaskPriority,
  type MemberRole
} from "@/lib/store"

const statusConfig: Record<ProjectStatus, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
  planning: { label: 'Planning', icon: Clock, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-accent', bgColor: 'bg-accent/10' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-muted-foreground', bgColor: 'bg-muted' }
}

const taskStatusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: 'bg-secondary text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-accent/10 text-accent' },
  done: { label: 'Done', color: 'bg-green-500/10 text-green-500' }
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-chart-4' },
  high: { label: 'High', color: 'text-destructive' }
}

const roleConfig: Record<MemberRole, { label: string; icon: typeof Crown; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-chart-4' },
  collaborator: { label: 'Collaborator', icon: Users, color: 'text-primary' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-muted-foreground' }
}

export default function ProjectSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [idea, setIdea] = useState<Idea | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<ProjectMessage[]>([])
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('planning')
  const [activeTab, setActiveTab] = useState("chat")
  
  // Task form state
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '', priority: 'medium' as TaskPriority })
  
  // Note form state
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [newNote, setNewNote] = useState('')
  
  // Member management
  const [showMemberDialog, setShowMemberDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; role: MemberRole } | null>(null)
  
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadData = () => {
    const fetchedIdea = getIdeaById(id)
    const user = getCurrentUser()
    
    setIdea(fetchedIdea || null)
    setCurrentUser(user)
    
    if (fetchedIdea) {
      setMessages(getProjectMessages(fetchedIdea.id))
      setTasks(getProjectTasks(fetchedIdea.id))
      setNotes(getProjectNotes(fetchedIdea.id))
      const meta = getProjectMeta(fetchedIdea.id)
      if (meta) {
        setProjectStatus(meta.status)
      }
    }
  }

  useEffect(() => {
    loadData()
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

  const handleCreateTask = () => {
    if (!currentUser || !idea || !newTask.title.trim()) return
    
    createProjectTask({
      ideaId: idea.id,
      title: newTask.title,
      description: newTask.description || undefined,
      assigneeId: newTask.assigneeId || undefined,
      assigneeName: newTask.assigneeId ? getUserById(newTask.assigneeId)?.name : undefined,
      status: 'todo',
      priority: newTask.priority,
      createdBy: currentUser.id
    })
    
    setTasks(getProjectTasks(idea.id))
    setNewTask({ title: '', description: '', assigneeId: '', priority: 'medium' })
    setShowTaskDialog(false)
    setToast({ isVisible: true, message: "Task created successfully", type: "success" })
  }

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    updateProjectTask(taskId, { status })
    if (idea) setTasks(getProjectTasks(idea.id))
  }

  const handleDeleteTask = (taskId: string) => {
    deleteProjectTask(taskId)
    if (idea) setTasks(getProjectTasks(idea.id))
    setToast({ isVisible: true, message: "Task deleted", type: "info" })
  }

  const handleCreateNote = () => {
    if (!currentUser || !idea || !newNote.trim()) return
    
    const mentions = parseMentions(newNote, idea.teamMembers)
    createProjectNote({
      ideaId: idea.id,
      content: newNote,
      authorId: currentUser.id,
      authorName: currentUser.name,
      mentions
    })
    
    setNotes(getProjectNotes(idea.id))
    setNewNote('')
    setShowNoteDialog(false)
    setToast({ isVisible: true, message: "Note added", type: "success" })
  }

  const handleDeleteNote = (noteId: string) => {
    deleteProjectNote(noteId)
    if (idea) setNotes(getProjectNotes(idea.id))
    setToast({ isVisible: true, message: "Note deleted", type: "info" })
  }

  const handleChangeMemberRole = (memberId: string, newRole: MemberRole) => {
    if (!idea) return
    setProjectMember(idea.id, memberId, newRole)
    setShowMemberDialog(false)
    setSelectedMember(null)
    setToast({ isVisible: true, message: "Member role updated", type: "success" })
  }

  const handleRemoveMember = (memberId: string) => {
    if (!idea) return
    removeProjectMember(idea.id, memberId)
    loadData()
    setShowMemberDialog(false)
    setSelectedMember(null)
    setToast({ isVisible: true, message: "Member removed from project", type: "info" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isOwner = currentUser?.id === idea?.postedBy
  const isTeamMember = idea?.teamMembers.includes(currentUser?.id || "")
  const currentUserRole = idea && currentUser ? getMemberRole(idea.id, currentUser.id) : 'viewer'

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
  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 flex-col pt-16">
        {/* Header */}
        <section className="border-b border-border bg-card/50">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/idea/${id}`)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{idea.title}</h1>
                  <p className="text-sm text-muted-foreground">Project Workspace</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${statusConfig[projectStatus].color} ${statusConfig[projectStatus].bgColor} gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig[projectStatus].label}
                </Badge>
                {isOwner && (
                  <Select value={projectStatus} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
                    <SelectTrigger className="w-36 h-9">
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
          {/* Left Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
              <div className="border-b border-border bg-card/30 px-4">
                <TabsList className="h-12 bg-transparent p-0">
                  <TabsTrigger value="chat" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    <ListTodo className="h-4 w-4" />
                    Tasks
                    {tasks.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{tasks.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    <FileText className="h-4 w-4" />
                    Notes
                    {notes.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{notes.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Chat Tab */}
              <TabsContent value="chat" className="mt-0 flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mx-auto max-w-3xl space-y-4">
                    {messages.length === 0 ? (
                      <div className="py-12 text-center">
                        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
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
                                className={`mt-1 rounded-2xl px-4 py-2 ${
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

                <div className="border-t border-border bg-card p-4">
                  <div className="mx-auto max-w-3xl">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Type a message... (use @name to mention)"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-0 flex-1 overflow-y-auto p-4">
                <div className="mx-auto max-w-4xl">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Project Tasks</h2>
                    <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Task</DialogTitle>
                          <DialogDescription>Add a task for your team to work on.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">Title</label>
                            <Input 
                              placeholder="Task title" 
                              value={newTask.title}
                              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground">Description</label>
                            <Textarea 
                              placeholder="Task description (optional)" 
                              value={newTask.description}
                              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                              className="mt-1.5"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-foreground">Assignee</label>
                              <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask(prev => ({ ...prev, assigneeId: v }))}>
                                <SelectTrigger className="mt-1.5">
                                  <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Unassigned</SelectItem>
                                  {idea.teamMembers.map(memberId => {
                                    const member = getUserById(memberId)
                                    return member ? (
                                      <SelectItem key={memberId} value={memberId}>{member.name}</SelectItem>
                                    ) : null
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground">Priority</label>
                              <Select value={newTask.priority} onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v as TaskPriority }))}>
                                <SelectTrigger className="mt-1.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
                          <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>Create Task</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Task Columns */}
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* To Do */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-foreground">To Do</h3>
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">{todoTasks.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {todoTasks.map(task => (
                          <TaskCard key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
                        ))}
                        {todoTasks.length === 0 && (
                          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                            No tasks
                          </div>
                        )}
                      </div>
                    </div>

                    {/* In Progress */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-accent" />
                        <h3 className="font-medium text-foreground">In Progress</h3>
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">{inProgressTasks.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {inProgressTasks.map(task => (
                          <TaskCard key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
                        ))}
                        {inProgressTasks.length === 0 && (
                          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                            No tasks
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Done */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <h3 className="font-medium text-foreground">Done</h3>
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">{doneTasks.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {doneTasks.map(task => (
                          <TaskCard key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
                        ))}
                        {doneTasks.length === 0 && (
                          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                            No tasks
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-0 flex-1 overflow-y-auto p-4">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Project Notes</h2>
                    <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Note
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Note</DialogTitle>
                          <DialogDescription>Share updates or ideas with your team. Use @name to mention someone.</DialogDescription>
                        </DialogHeader>
                        <Textarea 
                          placeholder="Write your note here... Use @name to mention team members" 
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={5}
                          className="mt-4"
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
                          <Button onClick={handleCreateNote} disabled={!newNote.trim()}>Add Note</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-4">
                    {notes.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-12 text-center">
                        <FileText className="mx-auto h-10 w-10 text-muted-foreground/30" />
                        <p className="mt-3 text-muted-foreground">No notes yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">Add notes to share updates with your team</p>
                      </div>
                    ) : (
                      notes.map(note => (
                        <div key={note.id} className="rounded-xl border border-border bg-card p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-sm text-primary">
                                  {note.authorName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">{note.authorName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{note.content}</p>
                              </div>
                            </div>
                            {(note.authorId === currentUser.id || isOwner) && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="hidden w-72 flex-shrink-0 border-l border-border bg-card/50 lg:block">
            <div className="p-4">
              {/* Team Members */}
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Team ({idea.teamMembers.length})
                </h3>
              </div>
              <div className="mt-3 space-y-1">
                {idea.teamMembers.map((memberId) => {
                  const member = getUserById(memberId)
                  if (!member) return null
                  const memberRole = getMemberRole(idea.id, memberId)
                  const RoleIcon = roleConfig[memberRole].icon
                  
                  return (
                    <div key={memberId} className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-secondary">
                      <Link href={`/user/${memberId}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-sm text-primary">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <RoleIcon className={`h-3 w-3 ${roleConfig[memberRole].color}`} />
                            <span className="text-xs text-muted-foreground">{roleConfig[memberRole].label}</span>
                          </div>
                        </div>
                      </Link>
                      {isOwner && memberId !== currentUser.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleChangeMemberRole(memberId, 'collaborator')}>
                              <Users className="mr-2 h-4 w-4" />
                              Make Collaborator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeMemberRole(memberId, 'viewer')}>
                              <Eye className="mr-2 h-4 w-4" />
                              Make Viewer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveMember(memberId)}>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Quick Links */}
              <div className="mt-6 border-t border-border pt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Links</h3>
                <div className="mt-3 space-y-1">
                  <Link href={`/idea/${id}`} className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <ArrowUpRight className="h-4 w-4" />
                    View Idea
                  </Link>
                  {isOwner && (
                    <Link href={`/idea/${id}/edit`} className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
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

      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}

// Task Card Component
function TaskCard({ 
  task, 
  onStatusChange, 
  onDelete 
}: { 
  task: ProjectTask
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className={`text-sm font-medium ${task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>
              <Circle className="mr-2 h-4 w-4" />
              To Do
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
              <PlayCircle className="mr-2 h-4 w-4" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Done
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assigneeName && (
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">{task.assigneeName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assigneeName}</span>
            </div>
          )}
        </div>
        <span className={`text-xs font-medium ${priorityConfig[task.priority].color}`}>
          {priorityConfig[task.priority].label}
        </span>
      </div>
    </div>
  )
}
