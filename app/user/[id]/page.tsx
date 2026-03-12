"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { RatingModal } from "@/components/rating-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User as UserIcon, 
  Shield, 
  Star, 
  Lightbulb, 
  Users, 
  CheckCircle, 
  GraduationCap, 
  Linkedin,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  MessageSquare
} from "lucide-react"
import { 
  getCurrentUser, 
  getUserById,
  getIdeas,
  getRatingsForUser,
  getRatingByUsers,
  getCollaborators,
  createRating,
  logProfileView,
  getProjectMeta,
  type User,
  type Idea,
  type CollaboratorRating
} from "@/lib/store"

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [userIdeas, setUserIdeas] = useState<Idea[]>([])
  const [ratings, setRatings] = useState<CollaboratorRating[]>([])
  const [canRate, setCanRate] = useState(false)
  const [completedProjectName, setCompletedProjectName] = useState<string>("")
  const [existingRating, setExistingRating] = useState<CollaboratorRating | undefined>(undefined)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  useEffect(() => {
    const user = getCurrentUser()
    const profile = getUserById(id)
    
    setCurrentUser(user)
    setProfileUser(profile || null)

    if (profile) {
      // If viewing own profile, redirect to /profile
      if (user && user.id === profile.id) {
        router.push("/profile")
        return
      }

      const allIdeas = getIdeas()
      setUserIdeas(allIdeas.filter((idea) => idea.postedBy === profile.id))
      setRatings(getRatingsForUser(profile.id))

      // Check if current user can rate this profile (only for completed projects)
      if (user) {
        // Find a completed shared project
        const completedSharedProject = allIdeas.find(idea => {
          if (!idea.teamMembers.includes(user.id) || !idea.teamMembers.includes(profile.id)) {
            return false
          }
          const meta = getProjectMeta(idea.id)
          return meta?.status === 'completed'
        })
        
        setCanRate(!!completedSharedProject)
        setCompletedProjectName(completedSharedProject?.title || "")
        
        // Check for existing rating
        const existing = getRatingByUsers(user.id, profile.id)
        setExistingRating(existing)

        // Log profile view
        logProfileView(user.id, user.name, profile.id)
      }
    }
  }, [id, router])

  const handleRatingSubmit = (rating: number, review: string) => {
    if (!currentUser || !profileUser) return

    // Find a shared project for context
    const allIdeas = getIdeas()
    const sharedIdea = allIdeas.find(idea => 
      idea.teamMembers.includes(currentUser.id) && idea.teamMembers.includes(profileUser.id)
    )

    createRating({
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: profileUser.id,
      ideaId: sharedIdea?.id || "",
      ideaTitle: sharedIdea?.title || "Collaboration",
      rating,
      review: review.trim() || undefined
    })

    setShowRatingModal(false)
    setToast({ 
      isVisible: true, 
      message: existingRating ? "Rating updated successfully" : "Rating submitted successfully", 
      type: "success" 
    })

    // Refresh ratings
    setRatings(getRatingsForUser(profileUser.id))
    setExistingRating(getRatingByUsers(currentUser.id, profileUser.id))
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-secondary">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">User Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              This user does not exist or has been removed.
            </p>
            <Button className="mt-6" onClick={() => router.push("/browse")}>
              Browse Ideas
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : profileUser.reputation
  const reputationStars = Math.round(avgRating)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Profile Header */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* Avatar */}
              <Avatar className="h-24 w-24">
                {profileUser.profilePicture ? (
                  <AvatarImage src={profileUser.profilePicture} alt={profileUser.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {profileUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-foreground">{profileUser.name}</h1>
                {profileUser.bio && (
                  <p className="mt-2 text-muted-foreground">{profileUser.bio}</p>
                )}

                {/* Verification Badges */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  {profileUser.isVerifiedStudent && (
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3 text-accent" />
                      Verified Student
                    </Badge>
                  )}
                  {profileUser.isLinkedInVerified && (
                    <Badge variant="outline" className="gap-1">
                      <Linkedin className="h-3 w-3 text-primary" />
                      LinkedIn Verified
                    </Badge>
                  )}
                  {!profileUser.isVerifiedStudent && !profileUser.isLinkedInVerified && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </div>

                {/* Skills */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  {profileUser.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Rating */}
                <div className="mt-4 flex items-center justify-center gap-2 md:justify-start">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < reputationStars ? "fill-chart-4 text-chart-4" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {avgRating.toFixed(1)} / 5.0
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {currentUser && canRate && (
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => setShowRatingModal(true)}>
                      <Star className="mr-2 h-4 w-4" />
                      {existingRating ? "Edit Rating" : "Rate Collaborator"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      For: {completedProjectName}
                    </p>
                  </div>
                )}
                {currentUser && !canRate && currentUser.id !== profileUser.id && (
                  <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center text-xs text-muted-foreground">
                    <p>You can rate collaborators after completing a project together.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{userIdeas.length}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Ideas Posted</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold text-foreground">{profileUser.projectsJoined.length}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Projects Joined</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-chart-4" />
                  <span className="text-2xl font-bold text-foreground">
                    {profileUser.isVerifiedStudent || profileUser.isLinkedInVerified ? "Yes" : "No"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Verified</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">
                    {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Joined</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Ideas Posted */}
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Ideas by {profileUser.name.split(" ")[0]}
                </h2>
                
                <div className="mt-4 space-y-4">
                  {userIdeas.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
                      <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No ideas posted yet
                      </p>
                    </div>
                  ) : (
                    userIdeas.map((idea) => (
                      <Link key={idea.id} href={`/idea/${idea.id}`}>
                        <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-foreground group-hover:text-primary">
                                {idea.title}
                              </h3>
                              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                {idea.problemStatement}
                              </p>
                            </div>
                            <Badge variant="secondary" className="ml-2 shrink-0">
                              {idea.teamMembers.length} member{idea.teamMembers.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <MessageSquare className="h-5 w-5 text-accent" />
                  Reviews ({ratings.length})
                </h2>

                <div className="mt-4 space-y-4">
                  {ratings.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
                      <Star className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No reviews yet
                      </p>
                    </div>
                  ) : (
                    ratings.slice(0, 5).map((rating) => (
                      <div key={rating.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-secondary text-sm">
                              {rating.fromUserName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-foreground">{rating.fromUserName}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < rating.rating ? "fill-chart-4 text-chart-4" : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {rating.review && (
                              <p className="mt-2 text-sm text-muted-foreground">{rating.review}</p>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground">
                              Project: {rating.ideaTitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        userName={profileUser.name}
        existingRating={existingRating?.rating}
        existingReview={existingRating?.review}
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
