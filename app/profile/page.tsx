"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  ArrowRight,
  Settings
} from "lucide-react"
import { 
  getCurrentUser, 
  getIdeas, 
  type User,
  type Idea
} from "@/lib/store"

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userIdeas, setUserIdeas] = useState<Idea[]>([])
  const [joinedProjects, setJoinedProjects] = useState<Idea[]>([])
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      const allIdeas = getIdeas()
      setUserIdeas(allIdeas.filter((idea) => idea.postedBy === user.id))
      setJoinedProjects(allIdeas.filter((idea) => idea.teamMembers.includes(user.id) && idea.postedBy !== user.id))
    }
  }, [])

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Profile Header */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* Avatar */}
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-foreground">{currentUser.name}</h1>
                <p className="mt-1 text-muted-foreground">{currentUser.email}</p>

                {/* Verification Badges */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  {currentUser.isVerifiedStudent && (
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3 text-accent" />
                      Verified Student
                    </Badge>
                  )}
                  {currentUser.isLinkedInVerified && (
                    <Badge variant="outline" className="gap-1">
                      <Linkedin className="h-3 w-3 text-primary" />
                      LinkedIn Verified
                    </Badge>
                  )}
                  {!currentUser.isVerifiedStudent && !currentUser.isLinkedInVerified && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </div>

                {/* Skills */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  {currentUser.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Reputation */}
                <div className="mt-4 flex items-center justify-center gap-2 md:justify-start">
                  <span className="text-sm text-muted-foreground">Reputation:</span>
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
                    {currentUser.reputation.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
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
                  <span className="text-2xl font-bold text-foreground">{joinedProjects.length}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Projects Joined</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-chart-4" />
                  <span className="text-2xl font-bold text-foreground">
                    {currentUser.isVerifiedStudent || currentUser.isLinkedInVerified ? "Yes" : "No"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Verified</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">
                    {new Date(currentUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
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
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Your Ideas
                  </h2>
                  <Link href="/post-idea">
                    <Button variant="ghost" size="sm">
                      Post New
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-4 space-y-4">
                  {userIdeas.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
                      <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        You have not posted any ideas yet
                      </p>
                      <Link href="/post-idea">
                        <Button variant="outline" size="sm" className="mt-4">
                          Post Your First Idea
                        </Button>
                      </Link>
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
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3 text-accent" />
                            <span>Posted: {idea.timestamp}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Projects Joined */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Users className="h-5 w-5 text-accent" />
                    Projects Joined
                  </h2>
                  <Link href="/browse">
                    <Button variant="ghost" size="sm">
                      Browse More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 space-y-4">
                  {joinedProjects.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        You have not joined any projects yet
                      </p>
                      <Link href="/browse">
                        <Button variant="outline" size="sm" className="mt-4">
                          Find Projects to Join
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    joinedProjects.map((idea) => (
                      <Link key={idea.id} href={`/idea/${idea.id}`}>
                        <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-foreground group-hover:text-primary">
                                {idea.title}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                by {idea.postedByName}
                              </p>
                            </div>
                            <Badge className="ml-2 shrink-0 bg-accent/10 text-accent">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Joined
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Verification Section */}
            {(!currentUser.isVerifiedStudent || !currentUser.isLinkedInVerified) && (
              <div className="mt-12 rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
                    <Shield className="h-5 w-5 text-chart-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Complete Your Verification</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Verified users build more trust and receive more project invitations.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {!currentUser.isVerifiedStudent && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Add college email (.edu)</span>
                        </div>
                      )}
                      {!currentUser.isLinkedInVerified && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Connect LinkedIn</span>
                        </div>
                      )}
                    </div>
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
