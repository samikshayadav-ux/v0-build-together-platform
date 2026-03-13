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
        <section className="border-b border-border/50 bg-gradient-to-b from-card to-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between animate-fade-in-up">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Lightbulb className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Browse Ideas</h1>
                    <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
                      Discover startup ideas and find projects to join. All ideas are NDA protected.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-6 py-3 text-sm font-medium text-muted-foreground shadow-lg">
                <Shield className="h-5 w-5 text-accent" />
                <span>{ideas.length} protected ideas</span>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="mt-12 space-y-6 animate-fade-in-up animation-delay-200">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search ideas by title, problem, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 text-base border-2 focus:border-primary transition-all duration-300"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-14 px-6 text-base font-semibold border-2 transition-all duration-300 hover:scale-105 ${
                    showFilters ? "bg-primary text-primary-foreground border-primary" : ""
                  }`}
                >
                  <Filter className="mr-3 h-5 w-5" />
                  Filters
                  {selectedSkills.length > 0 && (
                    <Badge variant="secondary" className="ml-3 h-6 px-2 text-sm">
                      {selectedSkills.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Skill Filters */}
              {showFilters && (
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">Filter by Skills</p>
                    {selectedSkills.length > 0 && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {SKILL_FILTERS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkillFilter(skill)}
                        className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                          selectedSkills.includes(skill)
                            ? "border-primary bg-primary/10 text-primary shadow-md"
                            : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5"
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
        <section className="py-20 bg-gradient-to-b from-background to-card/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {filteredIdeas.length > 0 ? (
              <>
                <div className="mb-8 flex items-center justify-between animate-fade-in-up">
                  <p className="text-lg text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredIdeas.length}</span> idea{filteredIdeas.length !== 1 ? "s" : ""}
                    {(searchQuery || selectedSkills.length > 0) && " (filtered)"}
                  </p>
                  {(searchQuery || selectedSkills.length > 0) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear filters
                    </Button>
                  )}
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredIdeas.map((idea, index) => (
                    <div key={idea.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <IdeaCard
                        idea={idea}
                        user={currentUser}
                        onViewDetails={handleViewDetails}
                        onJoinProject={handleJoinProject}
                      />
                    </div>
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
