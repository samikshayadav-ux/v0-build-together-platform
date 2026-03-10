"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { IdeaCard } from "@/components/idea-card"
import { NdaModal } from "@/components/nda-modal"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Lightbulb, Shield } from "lucide-react"
import { 
  getIdeas, 
  getCurrentUser, 
  hasSignedNda, 
  signNda, 
  logAccess, 
  createJoinRequest,
  initializeSampleData,
  type Idea,
  type User
} from "@/lib/store"

const SKILL_FILTERS = [
  "AI/ML",
  "Web Development",
  "Mobile App",
  "IoT",
  "Data Science",
  "UI/UX",
  "Cloud Backend",
  "Blockchain",
  "Marketing",
  "Hardware",
]

export default function BrowsePage() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [ndaModal, setNdaModal] = useState<{ isOpen: boolean; idea: Idea | null }>({
    isOpen: false,
    idea: null,
  })
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  useEffect(() => {
    initializeSampleData()
    setIdeas(getIdeas())
    setCurrentUser(getCurrentUser())
  }, [])

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery === "" ||
        idea.title.toLowerCase().includes(searchLower) ||
        idea.problemStatement.toLowerCase().includes(searchLower) ||
        idea.skillsRequired.some((skill) => skill.toLowerCase().includes(searchLower))

      // Skill filter
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) => idea.skillsRequired.includes(skill))

      return matchesSearch && matchesSkills
    })
  }, [ideas, searchQuery, selectedSkills])

  const handleViewDetails = (idea: Idea) => {
    if (!currentUser) {
      setToast({ isVisible: true, message: "Please sign in to view idea details", type: "info" })
      setTimeout(() => router.push("/login"), 1500)
      return
    }

    // Check if user has already signed NDA for this idea
    if (hasSignedNda(currentUser.id, idea.id)) {
      // Log access and navigate
      logAccess(currentUser.id, currentUser.name, idea.id, idea.title)
      router.push(`/idea/${idea.id}`)
    } else {
      // Show NDA modal
      setNdaModal({ isOpen: true, idea })
    }
  }

  const handleNdaAccept = () => {
    if (!currentUser || !ndaModal.idea) return

    // Sign NDA
    signNda(currentUser.id, ndaModal.idea.id)
    
    // Log access
    logAccess(currentUser.id, currentUser.name, ndaModal.idea.id, ndaModal.idea.title)
    
    // Close modal and navigate
    setNdaModal({ isOpen: false, idea: null })
    setToast({ isVisible: true, message: "NDA signed successfully. Access logged.", type: "success" })
    
    setTimeout(() => {
      router.push(`/idea/${ndaModal.idea!.id}`)
    }, 500)
  }

  const handleJoinProject = (idea: Idea) => {
    if (!currentUser) {
      setToast({ isVisible: true, message: "Please sign in to join projects", type: "info" })
      setTimeout(() => router.push("/login"), 1500)
      return
    }

    // Create join request
    createJoinRequest(idea.id, currentUser.id, currentUser.name, "I would like to join this project!")
    setToast({ isVisible: true, message: "Join request sent successfully!", type: "success" })
  }

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedSkills([])
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Header */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Browse Ideas</h1>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Discover startup ideas and find projects to join. All ideas are NDA protected.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-accent" />
                <span>{ideas.length} protected ideas</span>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="mt-8 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search ideas by title, problem, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-secondary" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {selectedSkills.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedSkills.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Skill Filters */}
              {showFilters && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Filter by Skills</p>
                    {selectedSkills.length > 0 && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SKILL_FILTERS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkillFilter(skill)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          selectedSkills.includes(skill)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Ideas Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {filteredIdeas.length > 0 ? (
              <>
                <p className="mb-6 text-sm text-muted-foreground">
                  Showing {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? "s" : ""}
                  {(searchQuery || selectedSkills.length > 0) && " (filtered)"}
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      user={currentUser}
                      onViewDetails={handleViewDetails}
                      onJoinProject={handleJoinProject}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">No ideas found</h3>
                <p className="mt-2 text-muted-foreground">
                  {searchQuery || selectedSkills.length > 0
                    ? "Try adjusting your search or filters"
                    : "Be the first to post a startup idea!"}
                </p>
                {(searchQuery || selectedSkills.length > 0) && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* NDA Modal */}
      <NdaModal
        isOpen={ndaModal.isOpen}
        onClose={() => setNdaModal({ isOpen: false, idea: null })}
        onAccept={handleNdaAccept}
        ideaTitle={ndaModal.idea?.title || ""}
      />

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
