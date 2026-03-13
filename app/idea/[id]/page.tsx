"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { NdaModal } from "@/components/nda-modal"
import { ToastNotification } from "@/components/toast-notification"
import { StarRating } from "@/components/star-rating"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Shield, 
  Clock, 
  Users, 
  Mail, 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { 
  getIdeaById, 
  getCurrentUser, 
  hasSignedNda, 
  signNda, 
  logAccess,
  createJoinRequest,
  getCommentsForIdea,
  createComment,
  getUserById,
  getJoinRequestsForIdea,
  createRating,
  getRatingByUsers,
  updateIdea,
  type Idea,
  type User,
  type Comment
} from "@/lib/store"

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [hasAccess, setHasAccess] = useState(false)
  const [showNdaModal, setShowNdaModal] = useState(false)
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  const [memberRatings, setMemberRatings] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchedIdea = getIdeaById(id)
    const user = getCurrentUser()
    
    setIdea(fetchedIdea || null)
    setCurrentUser(user)
    
    if (fetchedIdea && user) {
      if (fetchedIdea.postedBy === user.id || fetchedIdea.teamMembers.includes(user.id)) {
        setHasAccess(true)
        setShowNdaModal(false)
        logAccess(user.id, user.name, fetchedIdea.id, fetchedIdea.title)
        setComments(getCommentsForIdea(fetchedIdea.id))
      } else {
        const signed = hasSignedNda(user.id, fetchedIdea.id)
        setHasAccess(signed)
        setShowNdaModal(false)
        
        if (signed) {
          logAccess(user.id, user.name, fetchedIdea.id, fetchedIdea.title)
          setComments(getCommentsForIdea(fetchedIdea.id))
        } else {
          setShowNdaModal(true)
        }
      }
    } else if (!user) {
      setShowNdaModal(false)
    }
  }, [id])

  useEffect(() => {
    if (!idea || !currentUser) return

    const initialRatings: Record<string, number> = {}
    idea.teamMembers.forEach((memberId) => {
      const existingRating = getRatingByUsers(currentUser.id, memberId)
      initialRatings[memberId] = existingRating?.rating ?? 0
    })

    setMemberRatings(initialRatings)
  }, [idea, currentUser])

  const handleNdaAccept = () => {
    if (!currentUser || !idea) return
    
    signNda(currentUser.id, currentUser.name, idea.id)
    logAccess(currentUser.id, currentUser.name, idea.id, idea.title)
    setHasAccess(true)
    setShowNdaModal(false)
    setComments(getCommentsForIdea(idea.id))
    setToast({ isVisible: true, message: "NDA signed. Access logged.", type: "success" })
  }

  const handleJoinProject = () => {
    if (!currentUser || !idea) return
    
    createJoinRequest(idea.id, currentUser.id, currentUser.name, "I would like to join this project!")
    setToast({ isVisible: true, message: "Join request sent successfully!", type: "success" })
  }

  const handleSubmitComment = () => {
    if (!currentUser || !idea || !newComment.trim()) return
    
    const comment = createComment(idea.id, currentUser.id, currentUser.name, newComment)
    setComments((prev) => [...prev, comment])
    setNewComment("")
    setToast({ isVisible: true, message: "Comment posted!", type: "success" })
  }

  const handleRating = (memberId: string, rating: number) => {
    if (!currentUser || !idea) return
    
    createRating({
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: memberId,
      ideaId: idea.id,
      ideaTitle: idea.title,
      rating
    })
    setMemberRatings((prev) => ({ ...prev, [memberId]: rating }))
    setToast({ isVisible: true, message: "Rating submitted!", type: "success" })
  }

  const handleRemoveMember = (memberId: string) => {
    if (!currentUser || !idea || !isOwner) return
    
    updateIdea(idea.id, { teamMembers: idea.teamMembers.filter(id => id !== memberId) })
    setIdea(prev => prev ? { ...prev, teamMembers: prev.teamMembers.filter(id => id !== memberId) } : null)
    setToast({ isVisible: true, message: "Member removed from team!", type: "info" })
  }

  const handleLeaveIdea = () => {
    if (!currentUser || !idea || isOwner) return
    
    updateIdea(idea.id, { teamMembers: idea.teamMembers.filter(id => id !== currentUser.id) })
    setToast({ isVisible: true, message: "You have left the idea!", type: "info" })
    // Redirect or lose access
    router.push("/browse")
  }

  const poster = idea ? getUserById(idea.postedBy) : null
  const isOwner = currentUser?.id === idea?.postedBy
  const hasJoined = idea?.teamMembers.includes(currentUser?.id || "")
  const hasPendingRequest = idea ? getJoinRequestsForIdea(idea.id).some(req => req.userId === currentUser?.id && req.status === 'pending') : false

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Idea Not Found</h1>
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <Shield className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Sign In Required</h1>
            <p className="mt-2 text-muted-foreground">
              You need to sign in and accept the NDA to view this idea.
            </p>
            <Button className="mt-4" onClick={() => router.push("/login")}>
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
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <Button variant="ghost" size="sm" onClick={() => router.push("/browse")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{idea.title}</h1>
                <p className="mt-2 text-muted-foreground">{idea.problemStatement}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">
                  <Shield className="h-4 w-4" />
                  <span>NDA Protected</span>
                </div>
                {hasAccess && (
                  <Badge className="bg-chart-4/10 text-chart-4">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    NDA Signed
                  </Badge>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {idea.skillsRequired.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Meta */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Posted: {idea.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{idea.teamMembers.length} team member{idea.teamMembers.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{idea.contactEmail}</span>
              </div>
            </div>
          </div>
        </section>

        {hasAccess ? (
          <section className="py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Full Description */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Shield className="h-5 w-5 text-accent" />
                      Full Idea Description
                    </h2>
                    <div className="mt-4 whitespace-pre-wrap text-muted-foreground">
                      {idea.fullDescription}
                    </div>
                  </div>

                  {/* Discussion */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Discussion ({comments.length})
                    </h2>

                    {/* Comment Form */}
                    <div className="mt-4">
                      <Textarea
                        placeholder="Share your thoughts or ask a question..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        className="mt-2" 
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Post Comment
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="mt-6 space-y-4">
                      {comments.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          No comments yet. Start the discussion!
                        </p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="rounded-lg border border-border bg-background p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {comment.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">{comment.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Posted By */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Posted By</h3>
                    <Link href={`/user/${idea.postedBy}`} className="mt-4 flex items-center gap-3 group">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {idea.postedByName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary">{idea.postedByName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {poster?.isVerifiedStudent && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <CheckCircle className="h-3 w-3 text-accent" />
                              Verified Student
                            </Badge>
                          )}
                          {poster?.isLinkedInVerified && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              LinkedIn
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 text-chart-4" />
                          <span className="text-sm text-muted-foreground">
                            {poster?.reputation?.toFixed(1) || "4.0"} / 5.0
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Join Project */}
                  {!isOwner && (
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="text-sm font-medium text-muted-foreground">Join This Project</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Interested in working on this idea? Send a request to join the team.
                      </p>
                      {hasJoined ? (
                        <Badge className="mt-4 bg-green-100 text-green-800">Joined</Badge>
                      ) : hasPendingRequest ? (
                        <Button className="mt-4 w-full" disabled>Request Sent</Button>
                      ) : (
                        <Button className="mt-4 w-full" onClick={handleJoinProject}>Request to Join</Button>
                      )}
                    </div>
                  )}

                  {/* Team Members */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Team Members ({idea.teamMembers.length})
                    </h3>
                    <div className="mt-4 space-y-3">
                      {idea.teamMembers.map((memberId) => {
                        const member = getUserById(memberId)
                        return member ? (
                          <div
                            key={memberId}
                            className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <Link
                                href={`/user/${memberId}`}
                                className="flex min-w-0 items-center gap-4 group flex-1"
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-secondary text-sm">
                                    {member.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                                    {member.name}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {member.skills.slice(0, 2).join(", ")}
                                  </p>
                                </div>
                              </Link>

                              <div className="flex items-center gap-3">
                                {isOwner && memberId !== currentUser?.id && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveMember(memberId)}
                                    className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    Remove
                                  </Button>
                                )}

                                {isOwner && memberId !== currentUser?.id && (
                                  <StarRating
                                    value={memberRatings[memberId] ?? 0}
                                    onChange={(rating) => handleRating(memberId, rating)}
                                    size="sm"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                    {hasJoined && !isOwner && (
                      <Button
                        variant="outline"
                        className="mt-4 w-full text-destructive hover:text-destructive"
                        onClick={handleLeaveIdea}
                      >
                        Leave Idea
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-24">
            <div className="mx-auto max-w-md px-4 text-center">
              <Shield className="mx-auto h-16 w-16 text-primary" />
              <h2 className="mt-6 text-xl font-semibold text-foreground">NDA Agreement Required</h2>
              <p className="mt-2 text-muted-foreground">
                You must accept the NDA agreement to view the full details of this idea.
              </p>
              <Button className="mt-6" onClick={() => setShowNdaModal(true)}>
                View NDA Agreement
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* NDA Modal */}
      <NdaModal
        isOpen={showNdaModal}
        onClose={() => {
          setShowNdaModal(false)
          if (!hasAccess) {
            router.push("/browse")
          }
        }}
        onAccept={handleNdaAccept}
        ideaTitle={idea.title}
      />

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
