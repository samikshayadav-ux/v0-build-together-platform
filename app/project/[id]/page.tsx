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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
} from "@/components/ui/dialog"
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
  ListTodo,
  FileText,
  Trash2,
  UserMinus,
  Crown,
  Eye,
  UserCog,
  CalendarDays
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
  createRating,
  getRatings,
  type Idea,
  type User,
  type ProjectMessage,
  type ProjectStatus,
  type ProjectTask,
  type ProjectNote,
  type MemberRole,
  type TaskStatus,
  type TaskPriority
} from "@/lib/store"

const statusConfig: Record<ProjectStatus, { label: string; icon: typeof Clock; color: string }> = {
  planning: { label: 'Planning', icon: Clock, color: 'text-chart-4' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-accent' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-muted-foreground' }
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: 'High', color: 'text-red-500 bg-red-500/10' },
  medium: { label: 'Medium', color: 'text-chart-4 bg-chart-4/10' },
  low: { label: 'Low', color: 'text-muted-foreground bg-secondary' }
}

const roleConfig: Record<MemberRole, { label: string; icon: typeof Crown; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-chart-4' },
  collaborator: { label: 'Collaborator', icon: Users, color: 'text-accent' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-muted-foreground' }
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
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [notes, setNotes] = useState<ProjectNote[]>([])
  
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', priority: 'medium' as TaskPriority, dueDate: '' })
  const [newNote, setNewNote] = useState("")
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<User | null>(null)
  const [memberRole, setMemberRole] = useState<MemberRole>('collaborator')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingMember, setRatingMember] = useState<User | null>(null)
  const [ratingValue, setRatingValue] = useState(5)
  const [ratingReview, setRatingReview] = useState("")
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({ isVisible: false, message: "", type: "success" })

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

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
      if (meta) setProjectStatus(meta.status)
    }
  }

  useEffect(() => { loadData() }, [id])
  useEffect(() => { scrollToBottom() }, [messages])

  const handleSendMessage = () => {
    if (!currentUser || !idea || !newMessage.trim()) return
    const message = createProjectMessage(idea.id, currentUser.id, currentUser.name, newMessage)
    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const handleStatusChange = (newStatus: ProjectStatus) => {
    if (!idea) return
    const updates: Partial<{ status: ProjectStatus; startedAt: string; completedAt: string }> = { status: newStatus }
    if (newStatus === 'in_progress' && projectStatus === 'planning') updates.startedAt = new Date().toISOString()
    if (newStatus === 'completed') updates.completedAt = new Date().toISOString()
    updateProjectMeta(idea.id, updates)
    setProjectStatus(newStatus)
    setToast({ isVisible: true, message: `Project status updated to ${statusConfig[newStatus].label}`, type: "success" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() }
  }

  const handleCreateTask = () => {
    if (!idea || !currentUser || !taskForm.title.trim()) return
    createProjectTask({
      ideaId: idea.id, title: taskForm.title, description: taskForm.description || undefined,
      assigneeId: taskForm.assigneeId || undefined, assigneeName: taskForm.assigneeId ? getUserById(taskForm.assigneeId)?.name : undefined,
      status: 'todo', priority: taskForm.priority, dueDate: taskForm.dueDate || undefined, createdBy: currentUser.id
    })
    setTaskForm({ title: '', description: '', assigneeId: '', priority: 'medium', dueDate: '' })
    setShowTaskModal(false)
    loadData()
    setToast({ isVisible: true, message: "Task created successfully", type: "success" })
  }

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => { updateProjectTask(taskId, { status }); loadData() }
  const handleDeleteTask = (taskId: string) => { deleteProjectTask(taskId); loadData(); setToast({ isVisible: true, message: "Task deleted", type: "info" }) }

  const handleCreateNote = () => {
    if (!idea || !currentUser || !newNote.trim()) return
    const mentions = parseMentions(newNote, idea.teamMembers)
    createProjectNote({ ideaId: idea.id, content: newNote, authorId: currentUser.id, authorName: currentUser.name, mentions })
    setNewNote("")
    loadData()
    setToast({ isVisible: true, message: "Note added", type: "success" })
  }

  const handleDeleteNote = (noteId: string) => { deleteProjectNote(noteId); loadData() }

  const handleUpdateMemberRole = () => {
    if (!idea || !selectedMember) return
    setProjectMember(idea.id, selectedMember.id, memberRole)
    setShowMemberModal(false)
    setSelectedMember(null)
    loadData()
    setToast({ isVisible: true, message: `${selectedMember.name}'s role updated`, type: "success" })
  }

  const handleRemoveMember = (memberId: string) => {
    if (!idea) return
    const member = getUserById(memberId)
    removeProjectMember(idea.id, memberId)
    loadData()
    setToast({ isVisible: true, message: `${member?.name || 'Member'} removed`, type: "info" })
  }

  const handleSubmitRating = () => {
    if (!idea || !currentUser || !ratingMember) return
    createRating({ fromUserId: currentUser.id, fromUserName: currentUser.name, toUserId: ratingMember.id, ideaId: idea.id, ideaTitle: idea.title, rating: ratingValue, review: ratingReview || undefined })
    setShowRatingModal(false)
    setRatingMember(null)
    setRatingValue(5)
    setRatingReview("")
    setToast({ isVisible: true, message: `Rating submitted for ${ratingMember.name}`, type: "success" })
  }

  const isOwner = currentUser?.id === idea?.postedBy
  const isTeamMember = idea?.teamMembers.includes(currentUser?.id || "")
  const isProjectCompleted = projectStatus === 'completed'
  const hasRatedMember = (memberId: string) => {
    if (!currentUser || !idea) return false
    return getRatings().some(r => r.fromUserId === currentUser.id && r.toUserId === memberId && r.ideaId === idea.id)
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Project Not Found</h1>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/browse")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Browse</Button>
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
            <p className="mt-2 text-muted-foreground">You need to be a team member to access this project space.</p>
            <Button className="mt-4" onClick={() => router.push(`/idea/${id}`)}>View Idea Details</Button>
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
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push(`/idea/${id}`)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <div><h1 className="text-lg font-semibold text-foreground">{idea.title}</h1><p className="text-sm text-muted-foreground">Project Workspace</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${statusConfig[projectStatus].color} gap-1 bg-secondary`}><StatusIcon className="h-3 w-3" />{statusConfig[projectStatus].label}</Badge>
                {isOwner && (
                  <Select value={projectStatus} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
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

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b border-border bg-card px-4">
                <TabsList className="h-12 bg-transparent p-0">
                  <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-transparent"><MessageCircle className="h-4 w-4" />Chat</TabsTrigger>
                  <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-transparent"><ListTodo className="h-4 w-4" />Tasks{tasks.filter(t => t.status !== 'done').length > 0 && <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">{tasks.filter(t => t.status !== 'done').length}</Badge>}</TabsTrigger>
                  <TabsTrigger value="notes" className="gap-2 data-[state=active]:bg-transparent"><FileText className="h-4 w-4" />Notes</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="flex flex-1 flex-col overflow-hidden mt-0">
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mx-auto max-w-3xl space-y-4">
                    {messages.length === 0 ? (
                      <div className="py-12 text-center"><MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 font-medium text-foreground">No messages yet</h3><p className="mt-1 text-sm text-muted-foreground">Start the conversation with your team!</p></div>
                    ) : messages.map((message) => {
                      const isOwnMessage = message.userId === currentUser.id
                      return (
                        <div key={message.id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className={`text-sm ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{message.userName.charAt(0)}</AvatarFallback></Avatar>
                          <div className={`max-w-[70%]`}>
                            <div className={`flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                              <span className="text-sm font-medium text-foreground">{message.userName}</span>
                              <span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className={`mt-1 rounded-lg px-3 py-2 ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}><p className="text-sm whitespace-pre-wrap">{message.content}</p></div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                <div className="border-t border-border bg-card p-4">
                  <div className="mx-auto max-w-3xl flex gap-3">
                    <Textarea placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyPress} rows={1} className="min-h-[44px] resize-none" />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="flex-1 overflow-y-auto mt-0 p-4">
                <div className="mx-auto max-w-4xl">
                  <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-foreground">Tasks</h2><Button size="sm" onClick={() => setShowTaskModal(true)}><Plus className="mr-2 h-4 w-4" />Add Task</Button></div>
                  {tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center"><ListTodo className="mx-auto h-12 w-12 text-muted-foreground/50" /><h3 className="mt-4 font-medium text-foreground">No tasks yet</h3><p className="mt-1 text-sm text-muted-foreground">Create tasks to track your project progress</p><Button variant="outline" className="mt-4" onClick={() => setShowTaskModal(true)}>Create First Task</Button></div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className={`group rounded-lg border bg-card p-4 transition-colors ${task.status === 'done' ? 'border-green-500/20 bg-green-500/5' : 'border-border hover:border-primary/30'}`}>
                          <div className="flex items-start gap-3">
                            <button onClick={() => handleUpdateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${task.status === 'done' ? 'border-green-500 bg-green-500 text-white' : 'border-border hover:border-primary'}`}>{task.status === 'done' && <CheckCircle className="h-3 w-3" />}</button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div><h3 className={`font-medium ${task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</h3>{task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}</div>
                                <div className="flex items-center gap-2"><Badge className={priorityConfig[task.priority].color}>{priorityConfig[task.priority].label}</Badge><Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                {task.assigneeName && <span className="flex items-center gap-1"><Avatar className="h-4 w-4"><AvatarFallback className="text-[10px]">{task.assigneeName.charAt(0)}</AvatarFallback></Avatar>{task.assigneeName}</span>}
                                {task.dueDate && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(task.dueDate).toLocaleDateString()}</span>}
                                <Select value={task.status} onValueChange={(v) => handleUpdateTaskStatus(task.id, v as TaskStatus)}><SelectTrigger className="h-6 w-24 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todo">To Do</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="done">Done</SelectItem></SelectContent></Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="flex-1 overflow-y-auto mt-0 p-4">
                <div className="mx-auto max-w-4xl">
                  <div className="mb-4"><h2 className="text-lg font-semibold text-foreground">Project Notes</h2><p className="text-sm text-muted-foreground">Use @username to mention team members</p></div>
                  <div className="mb-6 rounded-lg border border-border bg-card p-4">
                    <Textarea placeholder="Write a note... Use @name to mention someone" value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={3} className="mb-3" />
                    <div className="flex justify-end"><Button onClick={handleCreateNote} disabled={!newNote.trim()}><Plus className="mr-2 h-4 w-4" />Add Note</Button></div>
                  </div>
                  {notes.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center"><FileText className="mx-auto h-12 w-12 text-muted-foreground/50" /><h3 className="mt-4 font-medium text-foreground">No notes yet</h3><p className="mt-1 text-sm text-muted-foreground">Add notes to keep track of ideas and decisions</p></div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="group rounded-lg border border-border bg-card p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-sm text-primary">{note.authorName.charAt(0)}</AvatarFallback></Avatar><div><span className="font-medium text-foreground">{note.authorName}</span><span className="ml-2 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span></div></div>
                            {note.authorId === currentUser.id && <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteNote(note.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-foreground">{note.content}</p>
                          {note.mentions.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{note.mentions.map((mentionId) => { const user = getUserById(mentionId); return user ? <Badge key={mentionId} variant="secondary" className="text-xs">@{user.name}</Badge> : null })}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden w-80 flex-shrink-0 overflow-y-auto border-l border-border bg-card lg:block">
            <div className="p-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Users className="h-4 w-4" />Team ({idea.teamMembers.length})</h3>
              <div className="mt-3 space-y-2">
                {idea.teamMembers.map((memberId) => {
                  const member = getUserById(memberId)
                  if (!member) return null
                  const isThisOwner = memberId === idea.postedBy
                  const role = getMemberRole(idea.id, memberId)
                  const RoleIcon = roleConfig[role].icon
                  return (
                    <div key={memberId} className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-secondary">
                      <Link href={`/user/${memberId}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-sm text-primary">{member.name.charAt(0)}</AvatarFallback></Avatar>
                        <div><p className="text-sm font-medium text-foreground">{member.name}</p><div className="flex items-center gap-1"><RoleIcon className={`h-3 w-3 ${roleConfig[role].color}`} /><span className={`text-xs ${roleConfig[role].color}`}>{roleConfig[role].label}</span></div></div>
                      </Link>
                      {isOwner && !isThisOwner && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setSelectedMember(member); setMemberRole(role); setShowMemberModal(true) }}><UserCog className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleRemoveMember(memberId)}><UserMinus className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                      {isOwner && !isThisOwner && isProjectCompleted && !hasRatedMember(memberId) && <Button variant="outline" size="sm" className="h-7 gap-1 text-xs opacity-0 group-hover:opacity-100" onClick={() => { setRatingMember(member); setShowRatingModal(true) }}><Star className="h-3 w-3" />Rate</Button>}
                      {isOwner && !isThisOwner && isProjectCompleted && hasRatedMember(memberId) && <Badge variant="secondary" className="text-xs text-green-500"><CheckCircle className="mr-1 h-3 w-3" />Rated</Badge>}
                    </div>
                  )
                })}
              </div>
              {isOwner && isProjectCompleted && idea.teamMembers.filter(m => m !== currentUser.id && !hasRatedMember(m)).length > 0 && (
                <div className="mt-6 rounded-lg border border-chart-4/30 bg-chart-4/5 p-4">
                  <div className="flex items-center gap-2 text-chart-4"><Star className="h-4 w-4" /><span className="text-sm font-medium">Rate Your Team</span></div>
                  <p className="mt-1 text-xs text-muted-foreground">Project completed! Rate your collaborators to build trust.</p>
                </div>
              )}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Links</h3>
                <div className="mt-3 space-y-2">
                  <Link href={`/idea/${id}`} className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><Settings className="h-4 w-4" />Idea Details</Link>
                  {isOwner && <Link href={`/idea/${id}/edit`} className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><Settings className="h-4 w-4" />Edit Idea</Link>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Task</DialogTitle><DialogDescription>Add a task for your team</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Title</label><Input placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="mt-1" /></div>
            <div><label className="text-sm font-medium">Description</label><Textarea placeholder="Describe..." value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Assign To</label><Select value={taskForm.assigneeId} onValueChange={(v) => setTaskForm({ ...taskForm, assigneeId: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="">Unassigned</SelectItem>{idea.teamMembers.map((mid) => { const m = getUserById(mid); return m ? <SelectItem key={mid} value={mid}>{m.name}</SelectItem> : null })}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Priority</label><Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as TaskPriority })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
            </div>
            <div><label className="text-sm font-medium">Due Date</label><Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowTaskModal(false)}>Cancel</Button><Button onClick={handleCreateTask} disabled={!taskForm.title.trim()}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Member Role</DialogTitle><DialogDescription>Change role for {selectedMember?.name}</DialogDescription></DialogHeader>
          <div className="py-4">
            <Select value={memberRole} onValueChange={(v) => setMemberRole(v as MemberRole)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="collaborator"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" />Collaborator</div></SelectItem><SelectItem value="viewer"><div className="flex items-center gap-2"><Eye className="h-4 w-4" />Viewer</div></SelectItem></SelectContent></Select>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowMemberModal(false)}>Cancel</Button><Button onClick={handleUpdateMemberRole}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rate {ratingMember?.name}</DialogTitle><DialogDescription>Share your experience on &ldquo;{idea.title}&rdquo;</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Rating</label><div className="mt-2 flex items-center gap-1">{[1,2,3,4,5].map((star) => (<button key={star} onClick={() => setRatingValue(star)} className="p-1 hover:scale-110"><Star className={`h-8 w-8 ${star <= ratingValue ? 'fill-chart-4 text-chart-4' : 'text-muted-foreground/30'}`} /></button>))}<span className="ml-2 text-lg font-semibold">{ratingValue}/5</span></div></div>
            <div><label className="text-sm font-medium">Review</label><Textarea placeholder="Your experience..." value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} className="mt-1" rows={4} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowRatingModal(false)}>Cancel</Button><Button onClick={handleSubmitRating}>Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastNotification message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))} />
    </div>
  )
}
