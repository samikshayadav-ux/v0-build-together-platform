"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User as UserIcon, 
  Shield, 
  Star, 
  Lightbulb, 
  Users, 
  CheckCircle, 
  GraduationCap, 
  Linkedin,
  Mail,
  Calendar,
  AlertTriangle,
  Settings,
  ExternalLink,
  MessageSquare,
  Briefcase,
  TrendingUp,
  Clock,
  ArrowUpRight
} from "lucide-react"
import { 
  getCurrentUser, 
  getIdeas,
  getJoinRequests,
  updateJoinRequest,
  updateIdea,
  updateUser,
  getUserById,
  getRatingsForUser,
  getProjectMeta,
  type User,
  type Idea,
  type JoinRequest,
  type CollaboratorRating
} from "@/lib/store"

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userIdeas, setUserIdeas] = useState<Idea[]>([])
  const [joinedProjects, setJoinedProjects] = useState<Idea[]>([])
  const [pendingRequests, setPendingRequests] = useState<(JoinRequest & { ideaTitle: string })[]>([])
  const [ratings, setRatings] = useState<CollaboratorRating[]>([])
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  const loadData = () => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      const allIdeas = getIdeas()
      const userPostedIdeas = allIdeas.filter((idea) => idea.postedBy === user.id)
      setUserIdeas(userPostedIdeas)
      setJoinedProjects(allIdeas.filter((idea) => idea.teamMembers.includes(user.id) && idea.postedBy !== user.id))
      
      const allRequests = getJoinRequests()
      const userIdeaIds = userPostedIdeas.map(idea => idea.id)
      const pending = allRequests
        .filter(req => userIdeaIds.includes(req.ideaId) && req.status === 'pending')
        .map(req => ({
          ...req,
          ideaTitle: allIdeas.find(idea => idea.id === req.ideaId)?.title || 'Unknown Idea'
        }))
      setPendingRequests(pending)
      
      setRatings(getRatingsForUser(user.id))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAcceptRequest = (request: JoinRequest & { ideaTitle: string }) => {
    updateJoinRequest(request.id, 'accepted')
    
    const idea = getIdeas().find(i => i.id === request.ideaId)
    if (idea && !idea.teamMembers.includes(request.userId)) {
      updateIdea(request.ideaId, { teamMembers: [...idea.teamMembers, request.userId] })
      
      const joiningUser = getUserById(request.userId)
      if (joiningUser && !joiningUser.projectsJoined.includes(request.ideaId)) {
        updateUser(request.userId, { projectsJoined: [...joiningUser.projectsJoined, request.ideaId] })
      }
    }
    
    setToast({ isVisible: true, message: `${request.userName} has been added to the team!`, type: "success" })
    loadData()
  }

  const handleRejectRequest = (request: JoinRequest & { ideaTitle: string }) => {
    updateJoinRequest(request.id, 'rejected')
    setToast({ isVisible: true, message: `Request from ${request.userName} has been declined.`, type: "info" })
    loadData()
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-secondary">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">Sign In Required</h1>
            <p className="mt-2 text-muted-foreground">
              You need to sign in to view your profile.
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

  const reputationStars = Math.round(currentUser.reputation)
  const completedProjects = [...userIdeas, ...joinedProjects].filter(idea => {
    const meta = getProjectMeta(idea.id)
    return meta?.status === 'completed'
  }).length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Profile Header - Modern Card Design */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                    {currentUser.profilePicture ? (
                      <AvatarImage src={currentUser.profilePicture} alt={currentUser.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-3xl font-semibold text-primary-foreground">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {(currentUser.isVerifiedStudent || currentUser.isLinkedInVerified) && (
                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                {/* Rating */}
                <div className="mt-4 flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5">
                  <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
                  <span className="text-sm font-semibold text-foreground">{currentUser.reputation.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({ratings.length} reviews)</span>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{currentUser.name}</h1>
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    {currentUser.isVerifiedStudent && (
                      <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent">
                        <GraduationCap className="h-3 w-3" />
                        Student
                      </Badge>
                    )}
                    {currentUser.isLinkedInVerified && (
                      <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                        <Linkedin className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="mt-1 text-muted-foreground">{currentUser.email}</p>
                
                {currentUser.bio && (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">{currentUser.bio}</p>
                )}

                {/* Skills */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  {currentUser.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-background">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Quick Stats Row */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm md:justify-start">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{userIdeas.length}</span> ideas
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="font-medium text-foreground">{joinedProjects.length}</span> collaborations
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-foreground">{completedProjects}</span> completed
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(currentUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                {currentUser.linkedIn && (
                  <a href={`https://${currentUser.linkedIn}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                      LinkedIn
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pending Requests Alert */}
        {pendingRequests.length > 0 && (
          <section className="border-b border-chart-4/20 bg-chart-4/5">
            <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/10">
                    <Mail className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {pendingRequests.length} pending join request{pendingRequests.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">People want to collaborate with you</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => document.getElementById('requests-tab')?.click()}>
                  Review
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Main Content with Tabs */}
        <section className="py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="mb-6 w-full justify-start border-b border-border bg-transparent p-0">
                <TabsTrigger 
                  value="projects" 
                  className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Reviews ({ratings.length})
                </TabsTrigger>
                {pendingRequests.length > 0 && (
                  <TabsTrigger 
                    id="requests-tab"
                    value="requests" 
                    className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Requests
                    <Badge variant="secondary" className="ml-2 bg-chart-4/10 text-chart-4">{pendingRequests.length}</Badge>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Projects Tab */}
              <TabsContent value="projects" className="mt-0">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Your Ideas */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Your Ideas
                      </h2>
                      <Link href="/post-idea">
                        <Button variant="ghost" size="sm" className="gap-1 text-primary">
                          Create New
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="space-y-3">
                      {userIdeas.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                          <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground/50" />
                          <p className="mt-3 text-sm text-muted-foreground">No ideas yet</p>
                          <Link href="/post-idea">
                            <Button variant="outline" size="sm" className="mt-4">
                              Post Your First Idea
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        userIdeas.map((idea) => {
                          const meta = getProjectMeta(idea.id)
                          return (
                            <div key={idea.id} className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <Link href={`/idea/${idea.id}`} className="flex-1">
                                  <h3 className="font-medium text-foreground group-hover:text-primary">
                                    {idea.title}
                                  </h3>
                                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                    {idea.problemStatement}
                                  </p>
                                </Link>
                                {meta?.status === 'completed' ? (
                                  <Badge className="shrink-0 bg-green-500/10 text-green-500">Completed</Badge>
                                ) : meta?.status === 'in_progress' ? (
                                  <Badge className="shrink-0 bg-accent/10 text-accent">Active</Badge>
                                ) : (
                                  <Badge variant="secondary" className="shrink-0">{idea.teamMembers.length} members</Badge>
                                )}
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {idea.timestamp}
                                </span>
                                <Link href={`/project/${idea.id}`}>
                                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                                    Workspace
                                    <ArrowUpRight className="h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Collaborations */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Users className="h-5 w-5 text-accent" />
                        Collaborations
                      </h2>
                      <Link href="/browse">
                        <Button variant="ghost" size="sm" className="gap-1 text-accent">
                          Find More
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {joinedProjects.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                          <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                          <p className="mt-3 text-sm text-muted-foreground">No collaborations yet</p>
                          <Link href="/browse">
                            <Button variant="outline" size="sm" className="mt-4">
                              Browse Projects
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        joinedProjects.map((idea) => {
                          const meta = getProjectMeta(idea.id)
                          return (
                            <div key={idea.id} className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/30 hover:shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <Link href={`/idea/${idea.id}`} className="flex-1">
                                  <h3 className="font-medium text-foreground group-hover:text-accent">
                                    {idea.title}
                                  </h3>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    by {idea.postedByName}
                                  </p>
                                </Link>
                                {meta?.status === 'completed' ? (
                                  <Badge className="shrink-0 bg-green-500/10 text-green-500">Completed</Badge>
                                ) : (
                                  <Badge className="shrink-0 bg-accent/10 text-accent">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Joined
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-3 flex justify-end">
                                <Link href={`/project/${idea.id}`}>
                                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                                    Workspace
                                    <ArrowUpRight className="h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-0">
                <div className="space-y-4">
                  {ratings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center">
                      <Star className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-3 text-muted-foreground">No reviews yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Complete projects to receive reviews from collaborators
                      </p>
                    </div>
                  ) : (
                    ratings.map((rating) => (
                      <div key={rating.id} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-secondary text-sm">
                              {rating.fromUserName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground">{rating.fromUserName}</p>
                                <p className="text-sm text-muted-foreground">on {rating.ideaTitle}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < rating.rating ? "fill-chart-4 text-chart-4" : "text-muted-foreground/30"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {rating.review && (
                              <p className="mt-3 text-sm text-foreground/80">{rating.review}</p>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Requests Tab */}
              {pendingRequests.length > 0 && (
                <TabsContent value="requests" className="mt-0">
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {request.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <Link href={`/user/${request.userId}`} className="font-medium text-foreground hover:text-primary">
                                  {request.userName}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                  wants to join <span className="text-primary">{request.ideaTitle}</span>
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAcceptRequest(request)}
                                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                                >
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRejectRequest(request)}
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                            {request.message && (
                              <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                                <p className="text-sm text-muted-foreground">&ldquo;{request.message}&rdquo;</p>
                              </div>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground">
                              <Clock className="mr-1 inline h-3 w-3" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Verification Prompt */}
            {(!currentUser.isVerifiedStudent && !currentUser.isLinkedInVerified) && (
              <div className="mt-8 rounded-xl border border-chart-4/30 bg-chart-4/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
                    <Shield className="h-5 w-5 text-chart-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Verify Your Identity</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Build trust with potential collaborators by verifying your student status or LinkedIn profile.
                    </p>
                    <Link href="/profile/edit">
                      <Button variant="outline" size="sm" className="mt-4">
                        Get Verified
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
